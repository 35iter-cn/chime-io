import fs from 'node:fs/promises';

import type { Notifier } from '@telnotify/core';

import {
  createOpenCodeEventFormatter,
  extractErrorMessage,
  type OpenCodeConversationMessage,
  type OpenCodeErrorLike,
  type OpenCodeSession,
} from './format.js';

const QUESTION_TOOLS = new Set(['question', 'ask_user_question', 'askuserquestion']);

interface SessionGetResult {
  data?: OpenCodeSession;
  error?: unknown;
}

interface SessionListMessagesArgsPrimary {
  sessionID: string;
  limit: number;
}

interface SessionListMessagesArgsSecondary {
  path: { id: string };
  query: { limit: number };
}

type SessionMessagesArgs =
  | SessionListMessagesArgsPrimary
  | SessionListMessagesArgsSecondary;

interface SessionMessagesResult {
  data?: OpenCodeConversationMessage[];
}

interface OpenCodeSessionApi {
  get(args: { sessionID: string }): Promise<SessionGetResult>;
  messages?(args: SessionMessagesArgs): Promise<SessionMessagesResult | OpenCodeConversationMessage[]>;
}

interface OpenCodeAppApi {
  log?(input: {
    body: {
      service: string;
      level: 'warn';
      message: string;
      extra?: Record<string, unknown>;
    };
  }): Promise<unknown>;
}

export interface OpenCodeClient {
  session?: OpenCodeSessionApi;
  app?: OpenCodeAppApi;
}

export interface Logger {
  warn(message: string, extra?: Record<string, unknown>): Promise<void>;
}

interface ToolExecuteInput {
  tool?: string;
  sessionID?: string;
  callID?: string;
}

interface ToolExecuteOutput {
  args?: {
    questions?: Array<{
      question?: string;
    }>;
  };
}

interface PermissionEventProperties {
  id?: string;
  permissionID?: string;
  sessionID?: string;
  title?: string;
}

interface SessionEventProperties {
  sessionID?: string;
  status?: { type?: string } | 'busy';
  error?: OpenCodeErrorLike | string;
  info?: OpenCodeSession;
}

export interface OpenCodeEventEnvelope {
  event: {
    type: string;
    properties?: PermissionEventProperties & SessionEventProperties;
  };
}

export interface OpenCodeNotifierPlugin {
  'tool.execute.before': (input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void>;
  'tool.execute.after': (input: ToolExecuteInput) => Promise<void>;
  event: (payload: OpenCodeEventEnvelope) => Promise<void>;
}

export interface CreateOpenCodeNotifierPluginOptions {
  client: OpenCodeClient;
  notifier: Notifier;
  logger: Logger;
}

function getLifecycleLogFile(): string {
  return process.env.TELME_LOG_FILE || '/tmp/telme.log';
}

async function appendLifecycleLog(
  stage: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      stage,
      ...payload,
    });
    await fs.appendFile(getLifecycleLogFile(), `${line}\n`, 'utf8');
  } catch {
    // Never break plugin lifecycle when file logging fails.
  }
}

function isBusyStatus(status: SessionEventProperties['status']): boolean {
  return status === 'busy' || status?.type === 'busy';
}

function getQuestionText(args: ToolExecuteOutput['args']): string {
  const questions = args?.questions;
  if (!Array.isArray(questions) || questions.length === 0) return '';
  const questionText = questions[0]?.question;
  return typeof questionText === 'string' ? questionText : '';
}

export function createOpenCodeNotifierPlugin({
  client,
  notifier,
  logger,
}: CreateOpenCodeNotifierPluginOptions): OpenCodeNotifierPlugin {
  const sessionCache = new Map<string, OpenCodeSession>();
  const rootActivity = new Map<string, boolean>();
  const notifyingRoots = new Set<string>();
  const rootErrors = new Map<string, string>();
  const notifiedTaskErrors = new Set<string>();
  const questionNotifications = new Map<string, string>();
  const permissionNotifications = new Map<string, string>();

  const formatter = createOpenCodeEventFormatter({
    listMessages: async (sessionId) => {
      if (!client.session?.messages) return [];

      const attempts: Array<() => Promise<SessionMessagesResult | OpenCodeConversationMessage[]>> = [
        () => client.session!.messages!({ sessionID: sessionId, limit: 10 }),
        () =>
          client.session!.messages!({
            path: { id: sessionId },
            query: { limit: 10 },
          }),
      ];

      for (const attempt of attempts) {
        try {
          const result = await attempt();
          if (Array.isArray(result)) return result;
          if (Array.isArray(result.data)) return result.data;
        } catch (error) {
          await logger.warn('Failed to load session messages for notification', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return [];
    },
  });

  async function getSessionInfo(sessionId: string): Promise<OpenCodeSession> {
    const cached = sessionCache.get(sessionId);
    if (cached) return cached;

    if (!client.session) {
      throw new Error('OpenCode session client is required');
    }

    const result = await client.session.get({ sessionID: sessionId });
    if (result.error || !result.data) {
      throw new Error(
        result.error ? `Failed to load session ${sessionId}` : `Session ${sessionId} not found`,
      );
    }

    sessionCache.set(result.data.id, result.data);
    return result.data;
  }

  async function getRootSessionInfo(sessionId: string): Promise<OpenCodeSession> {
    const visited = new Set<string>();
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

  async function notifyRootSession(sessionId: string): Promise<void> {
    let notifiedRootId: string | null = null;

    try {
      const rootSession = await getRootSessionInfo(sessionId);
      if (rootSession.id !== sessionId) return;
      if (!rootActivity.get(rootSession.id)) return;
      if (notifyingRoots.has(rootSession.id)) return;

      notifyingRoots.add(rootSession.id);
      notifiedRootId = rootSession.id;

      if (rootErrors.has(rootSession.id)) {
        await notifier.notify(
          await formatter.formatSessionError(rootSession, rootErrors.get(rootSession.id)),
        );
      } else {
        await notifier.notify(await formatter.formatSessionCompleted(rootSession));
      }

      rootActivity.set(rootSession.id, false);
      rootErrors.delete(rootSession.id);
    } catch (error) {
      await logger.warn('Failed to process notification event', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (notifiedRootId) {
        notifyingRoots.delete(notifiedRootId);
      }
    }
  }

  async function notifyTaskSessionError(
    sessionId: string,
    errorMessage: string,
  ): Promise<void> {
    if (notifiedTaskErrors.has(sessionId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      if (!session.parentID) return;

      notifiedTaskErrors.add(sessionId);
      await notifier.notify(await formatter.formatSessionError(session, errorMessage));
    } catch (error) {
      await logger.warn('Failed to send task error notification', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function notifyQuestion(
    sessionId: string,
    callId: string,
    questionText: string,
  ): Promise<void> {
    if (!callId || questionNotifications.has(callId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      questionNotifications.set(callId, sessionId);
      await notifier.notify(formatter.formatQuestion(session, questionText));
    } catch (error) {
      await logger.warn('Failed to send question notification', {
        sessionId,
        callId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function notifyPermission(
    sessionId: string,
    permissionId: string,
    title: string,
  ): Promise<void> {
    if (!permissionId || permissionNotifications.has(permissionId)) return;

    try {
      const session = await getSessionInfo(sessionId);
      permissionNotifications.set(permissionId, sessionId);
      await notifier.notify(formatter.formatPermission(session, title));
    } catch (error) {
      await logger.warn('Failed to send permission notification', {
        sessionId,
        permissionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function clearSessionNotificationState(sessionId: string): void {
    notifiedTaskErrors.delete(sessionId);

    for (const [callId, trackedSessionId] of questionNotifications.entries()) {
      if (trackedSessionId === sessionId) {
        questionNotifications.delete(callId);
      }
    }

    for (const [permissionId, trackedSessionId] of permissionNotifications.entries()) {
      if (trackedSessionId === sessionId) {
        permissionNotifications.delete(permissionId);
      }
    }
  }

  return {
    'tool.execute.before': async (input, output) => {
      await appendLifecycleLog('tool.execute.before', {
        tool: input.tool,
        sessionId: input.sessionID,
        callId: input.callID,
      });
      if (!input.tool || !QUESTION_TOOLS.has(input.tool)) return;
      if (!input.sessionID || !input.callID) return;

      await notifyQuestion(
        input.sessionID,
        input.callID,
        getQuestionText(output.args),
      );
    },
    'tool.execute.after': async (input) => {
      await appendLifecycleLog('tool.execute.after', {
        tool: input.tool,
        sessionId: input.sessionID,
        callId: input.callID,
      });
      if (!input.tool || !QUESTION_TOOLS.has(input.tool) || !input.callID) return;
      questionNotifications.delete(input.callID);
    },
    event: async ({ event }) => {
      await appendLifecycleLog('event.received', {
        eventType: event.type,
        sessionId: event.properties?.sessionID,
      });

      if (event.type === 'session.created' || event.type === 'session.updated') {
        const info = event.properties?.info;
        if (info?.id) {
          sessionCache.set(info.id, info);
        }
        return;
      }

      if (event.type === 'session.deleted') {
        const sessionId = event.properties?.info?.id;
        if (sessionId) {
          clearSessionNotificationState(sessionId);
        }
        return;
      }

      if (event.type === 'permission.updated' || event.type === 'permission.asked') {
        const permissionId = event.properties?.id;
        const sessionId = event.properties?.sessionID;
        if (!permissionId || !sessionId) return;
        await notifyPermission(sessionId, permissionId, event.properties?.title ?? '');
        return;
      }

      if (event.type === 'permission.replied') {
        const permissionId = event.properties?.permissionID;
        if (permissionId) {
          permissionNotifications.delete(permissionId);
        }
        return;
      }

      if (event.type === 'session.status') {
        const sessionId = event.properties?.sessionID;
        const status = event.properties?.status;
        if (!sessionId) return;

        if (typeof status === 'object' && status?.type === 'idle') {
          await notifyRootSession(sessionId);
          return;
        }

        if (!isBusyStatus(status)) return;

        try {
          const rootSession = await getRootSessionInfo(sessionId);
          rootActivity.set(rootSession.id, true);
        } catch (error) {
          await logger.warn('Failed to resolve root session for status event', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return;
      }

      if (event.type === 'session.error') {
        const sessionId = event.properties?.sessionID;
        if (!sessionId) return;

        try {
          const session = await getSessionInfo(sessionId);
          const errorMessage = extractErrorMessage(event.properties?.error);

          if (session.parentID) {
            await notifyTaskSessionError(sessionId, errorMessage);
            return;
          }

          const rootSession = await getRootSessionInfo(sessionId);
          rootActivity.set(rootSession.id, true);
          rootErrors.set(rootSession.id, errorMessage);
        } catch (error) {
          await logger.warn('Failed to resolve root session for error event', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return;
      }

      if (event.type !== 'session.idle') return;

      const sessionId = event.properties?.sessionID;
      if (!sessionId) return;
      await notifyRootSession(sessionId);
    },
  };
}
