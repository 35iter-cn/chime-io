const {
  createOpenCodeEventFormatter,
  extractErrorMessage,
} = require("./format");
const fs = require("node:fs/promises");

const QUESTION_TOOLS = new Set([
  "question",
  "ask_user_question",
  "askuserquestion",
]);

function getLifecycleLogFile() {
  return process.env.TELME_LOG_FILE || "/tmp/telme.log";
}

async function appendLifecycleLog(stage, payload) {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      stage,
      ...payload,
    });
    await fs.appendFile(getLifecycleLogFile(), `${line}\n`, "utf8");
  } catch (error) {
    // Never break plugin lifecycle when file logging fails.
  }
}

function isBusyStatus(status) {
  return (
    status === "busy" ||
    (typeof status === "object" && status && status.type === "busy")
  );
}

function getQuestionText(args) {
  const questions = args && args.questions;
  if (!Array.isArray(questions) || questions.length === 0) return "";
  const questionText = questions[0] && questions[0].question;
  return typeof questionText === "string" ? questionText : "";
}

function createOpenCodeNotifierPlugin({ client, notifier, logger }) {
  const sessionCache = new Map();
  const rootActivity = new Map();
  const notifyingRoots = new Set();
  const rootErrors = new Map();
  const notifiedTaskErrors = new Set();
  const questionNotifications = new Map();
  const permissionNotifications = new Map();

  const formatter = createOpenCodeEventFormatter({
    listMessages: async (sessionId) => {
      if (!client.session || !client.session.messages) return [];

      const attempts = [
        () => client.session.messages({ sessionID: sessionId, limit: 10 }),
        () =>
          client.session.messages({
            path: { id: sessionId },
            query: { limit: 10 },
          }),
      ];

      for (const attempt of attempts) {
        try {
          const result = await attempt();
          if (Array.isArray(result && result.data)) return result.data;
          if (Array.isArray(result)) return result;
        } catch (error) {
          await logger.warn(
            "Failed to load session messages for notification",
            {
              sessionId,
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }
      }

      return [];
    },
  });

  async function getSessionInfo(sessionId) {
    const cached = sessionCache.get(sessionId);
    if (cached) return cached;

    const result = await client.session.get({ sessionID: sessionId });
    if (result.error || !result.data) {
      throw new Error(
        result.error
          ? `Failed to load session ${sessionId}`
          : `Session ${sessionId} not found`,
      );
    }

    sessionCache.set(result.data.id, result.data);
    return result.data;
  }

  async function getRootSessionInfo(sessionId) {
    const visited = new Set();
    let current = await getSessionInfo(sessionId);

    while (current.parentID) {
      if (visited.has(current.id)) {
        throw new Error(`Detected session parent cycle at ${current.id}`);
      }

      visited.add(current.id);
      current = await getSessionInfo(current.parentID);
    }

    return current;
  }

  async function notifyRootSession(sessionId) {
    let notifiedRootId = null;

    try {
      const rootSession = await getRootSessionInfo(sessionId);
      if (rootSession.id !== sessionId) return;
      if (!rootActivity.get(rootSession.id)) return;
      if (notifyingRoots.has(rootSession.id)) return;

      notifyingRoots.add(rootSession.id);
      notifiedRootId = rootSession.id;

      if (rootErrors.has(rootSession.id)) {
        await notifier.notify(
          await formatter.formatSessionError(
            rootSession,
            rootErrors.get(rootSession.id),
          ),
        );
      } else {
        await notifier.notify(
          await formatter.formatSessionCompleted(rootSession),
        );
      }

      rootActivity.set(rootSession.id, false);
      rootErrors.delete(rootSession.id);
    } catch (error) {
      await logger.warn("Failed to process notification event", {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (notifiedRootId) {
        notifyingRoots.delete(notifiedRootId);
      }
    }
  }

  async function notifyTaskSessionError(sessionId, errorMessage) {
    if (notifiedTaskErrors.has(sessionId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      if (!session.parentID) return;

      notifiedTaskErrors.add(sessionId);
      await notifier.notify(
        await formatter.formatSessionError(session, errorMessage),
      );
    } catch (error) {
      await logger.warn("Failed to send task error notification", {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function notifyQuestion(sessionId, callId, questionText) {
    if (!callId || questionNotifications.has(callId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      questionNotifications.set(callId, sessionId);
      await notifier.notify(formatter.formatQuestion(session, questionText));
    } catch (error) {
      await logger.warn("Failed to send question notification", {
        sessionId,
        callId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function notifyPermission(sessionId, permissionId, title) {
    if (!permissionId || permissionNotifications.has(permissionId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      permissionNotifications.set(permissionId, sessionId);
      await notifier.notify(formatter.formatPermission(session, title));
    } catch (error) {
      await logger.warn("Failed to send permission notification", {
        sessionId,
        permissionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function clearSessionNotificationState(sessionId) {
    notifiedTaskErrors.delete(sessionId);

    for (const [callId, trackedSessionId] of questionNotifications.entries()) {
      if (trackedSessionId === sessionId) {
        questionNotifications.delete(callId);
      }
    }

    for (const [
      permissionId,
      trackedSessionId,
    ] of permissionNotifications.entries()) {
      if (trackedSessionId === sessionId) {
        permissionNotifications.delete(permissionId);
      }
    }
  }

  return {
    "tool.execute.before": async (input, output) => {
      await appendLifecycleLog("tool.execute.before", {
        tool: input && input.tool,
        sessionId: input && input.sessionID,
        callId: input && input.callID,
      });
      if (!QUESTION_TOOLS.has(input.tool)) return;
      await notifyQuestion(
        input.sessionID,
        input.callID,
        getQuestionText(output && output.args),
      );
    },
    "tool.execute.after": async (input) => {
      await appendLifecycleLog("tool.execute.after", {
        tool: input && input.tool,
        sessionId: input && input.sessionID,
        callId: input && input.callID,
      });
      if (!QUESTION_TOOLS.has(input.tool)) return;
      questionNotifications.delete(input.callID);
    },
    event: async ({ event }) => {
      await appendLifecycleLog("event.received", {
        eventType: event && event.type,
        sessionId: event && event.properties && event.properties.sessionID,
      });

      if (
        event.type === "session.created" ||
        event.type === "session.updated"
      ) {
        const info = event.properties && event.properties.info;
        if (info && info.id) {
          sessionCache.set(info.id, info);
        }
        return;
      }

      if (event.type === "session.deleted") {
        const sessionId =
          event.properties && event.properties.info && event.properties.info.id;
        if (sessionId) {
          clearSessionNotificationState(sessionId);
        }
        return;
      }

      if (
        event.type === "permission.updated" ||
        event.type === "permission.asked"
      ) {
        const permissionId = event.properties && event.properties.id;
        const sessionId = event.properties && event.properties.sessionID;
        if (!permissionId || !sessionId) return;
        await notifyPermission(
          sessionId,
          permissionId,
          event.properties && event.properties.title,
        );
        return;
      }

      if (event.type === "permission.replied") {
        const permissionId = event.properties && event.properties.permissionID;
        if (permissionId) {
          permissionNotifications.delete(permissionId);
        }
        return;
      }

      if (event.type === "session.status") {
        const sessionId = event.properties && event.properties.sessionID;
        const status = event.properties && event.properties.status;
        if (!sessionId) return;

        if (status && status.type === "idle") {
          await notifyRootSession(sessionId);
          return;
        }

        if (!isBusyStatus(status)) return;

        try {
          const rootSession = await getRootSessionInfo(sessionId);
          rootActivity.set(rootSession.id, true);
        } catch (error) {
          await logger.warn("Failed to resolve root session for status event", {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return;
      }

      if (event.type === "session.error") {
        const sessionId = event.properties && event.properties.sessionID;
        if (!sessionId) return;

        try {
          const session = await getSessionInfo(sessionId);
          const errorMessage = extractErrorMessage(
            event.properties && event.properties.error,
          );

          if (session.parentID) {
            await notifyTaskSessionError(sessionId, errorMessage);
            return;
          }

          const rootSession = await getRootSessionInfo(sessionId);
          rootActivity.set(rootSession.id, true);
          rootErrors.set(rootSession.id, errorMessage);
        } catch (error) {
          await logger.warn("Failed to resolve root session for error event", {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return;
      }

      if (event.type !== "session.idle") return;

      const sessionId = event.properties && event.properties.sessionID;
      if (!sessionId) return;
      await notifyRootSession(sessionId);
    },
  };
}

module.exports = {
  createOpenCodeNotifierPlugin,
};
