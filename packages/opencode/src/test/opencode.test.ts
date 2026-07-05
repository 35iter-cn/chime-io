import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createOpenCodeEventFormatter,
  extractLastErrorFromMessages,
  extractLastResultFromMessages,
  formatChangeSummary,
} from "../format.ts";
import { createOpenCodeNotifierPlugin } from "../notifier-plugin.ts";

test("formatChangeSummary keeps additions deletions and file count", () => {
  assert.equal(
    formatChangeSummary({
      summary: { additions: 4, deletions: 2, files: 3 },
    }),
    "+4 · -2 · 3 files",
  );
});

test("extractLastResultFromMessages prefers latest assistant text", () => {
  const result = extractLastResultFromMessages([
    { info: { role: "user" }, parts: [{ type: "text", text: "ignored" }] },
    {
      info: { role: "assistant" },
      parts: [{ type: "text", text: "   已经完成   最终结果   " }],
    },
  ]);

  assert.equal(result, "已经完成 最终结果");
});

test("extractLastErrorFromMessages reads tool error message", () => {
  const result = extractLastErrorFromMessages([
    {
      info: { role: "assistant" },
      parts: [
        {
          type: "tool",
          state: {
            status: "error",
            error: { message: "permission denied" },
          },
        },
      ],
    },
  ]);

  assert.equal(result, "permission denied");
});

test("createOpenCodeEventFormatter formats completed root session", async () => {
  const formatter = createOpenCodeEventFormatter({
    listMessages: async () => [
      {
        info: { role: "assistant" },
        parts: [{ type: "text", text: "任务已完成" }],
      },
    ],
  });

  const notification = await formatter.formatSessionCompleted({
    id: "1234567890abcdef",
    title: "feature-flow",
    summary: { additions: 7, deletions: 1, files: 2 },
  });

  assert.deepEqual(notification, {
    agent: "opencode",
    kind: "session.completed",
    title: "OpenCode · feature-flow",
    lines: ["+7 · -1 · 2 files", "任务已完成"],
    metadata: { sessionId: "1234567890abcdef" },
  });
});

test("createOpenCodeNotifierPlugin writes lifecycle log to file", async () => {
  const logFile = path.join(
    os.tmpdir(),
    `telnotify-opencode-${Date.now()}.log`,
  );
  process.env.TELME_LOG_FILE = logFile;

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => ({
          data: { id: sessionID, title: "demo-session", parentID: null },
        }),
        messages: async () => ({ data: [] }),
      },
    },
    notifier: { notify: async () => undefined },
    logger: { warn: async () => undefined },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "busy" },
      },
    },
  });

  const logContent = await fs.readFile(logFile, "utf8");
  assert.match(logContent, /event\.received/);
  assert.match(logContent, /session\.status/);

  delete process.env.TELME_LOG_FILE;
  await fs.unlink(logFile);
});

test("createOpenCodeNotifierPlugin skips notification for invalid sessionID", async () => {
  const warnings: Array<{ message: string; extra?: Record<string, unknown> }> = [];
  const clientGetCalls: string[] = [];
  const notifyCalls: unknown[] = [];

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => {
          clientGetCalls.push(sessionID);
          return { data: { id: sessionID, title: "demo-session", parentID: null } };
        },
        messages: async () => ({ data: [] }),
      },
    },
    notifier: {
      notify: async (notification) => {
        notifyCalls.push(notification);
      },
    },
    logger: {
      warn: async (message, extra) => {
        warnings.push({ message, ...(extra ? { extra } : {}) });
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.idle",
      properties: {
        sessionID: "xHLOinvalid",
      },
    },
  });

  assert.equal(
    clientGetCalls.length,
    0,
    "should not call client.session.get for an invalid sessionID",
  );
  assert.equal(
    notifyCalls.length,
    0,
    "should not send notification for an invalid sessionID",
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!.message, /invalid sessionID/i);
  assert.equal(warnings[0]!.extra?.sessionId, "xHLOinvalid");
});

test("createOpenCodeNotifierPlugin sends completed notification after session.idle", async () => {
  const notifyCalls: unknown[] = [];

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => ({
          data: { id: sessionID, title: "demo-session", parentID: null },
        }),
        messages: async () => ({ data: [] }),
      },
    },
    notifier: {
      notify: async (notification) => {
        notifyCalls.push(notification);
      },
    },
    logger: { warn: async () => undefined },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "busy" },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.idle",
      properties: {
        sessionID: "ses_root-session",
      },
    },
  });

  assert.equal(notifyCalls.length, 1);
  assert.equal((notifyCalls[0] as { kind: string }).kind, "session.completed");
});

test("createOpenCodeNotifierPlugin skips completed notification when retry is pending", async () => {
  const notifyCalls: unknown[] = [];

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => ({
          data: { id: sessionID, title: "demo-session", parentID: null },
        }),
        messages: async () => ({ data: [] }),
      },
    },
    notifier: {
      notify: async (notification) => {
        notifyCalls.push(notification);
      },
    },
    logger: { warn: async () => undefined },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "busy" },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "retry", attempt: 1, message: "retrying", next: 0 },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.idle",
      properties: {
        sessionID: "ses_root-session",
      },
    },
  });

  assert.equal(
    notifyCalls.length,
    0,
    "should not notify while retry is pending",
  );
});

test("createOpenCodeNotifierPlugin resumes notification after retry then new busy", async () => {
  const notifyCalls: unknown[] = [];

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => ({
          data: { id: sessionID, title: "demo-session", parentID: null },
        }),
        messages: async () => ({ data: [] }),
      },
    },
    notifier: {
      notify: async (notification) => {
        notifyCalls.push(notification);
      },
    },
    logger: { warn: async () => undefined },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "busy" },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "retry", attempt: 1, message: "retrying", next: 0 },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.status",
      properties: {
        sessionID: "ses_root-session",
        status: { type: "busy" },
      },
    },
  });

  await plugin.event({
    event: {
      type: "session.idle",
      properties: {
        sessionID: "ses_root-session",
      },
    },
  });

  assert.equal(notifyCalls.length, 1);
  assert.equal((notifyCalls[0] as { kind: string }).kind, "session.completed");
});

test("createOpenCodeNotifierPlugin skips question notification for invalid sessionID", async () => {
  const warnings: Array<{ message: string; extra?: Record<string, unknown> }> = [];
  const clientGetCalls: string[] = [];
  const notifyCalls: unknown[] = [];

  const plugin = createOpenCodeNotifierPlugin({
    client: {
      session: {
        get: async ({ sessionID }: { sessionID: string }) => {
          clientGetCalls.push(sessionID);
          return { data: { id: sessionID, title: "demo-session", parentID: null } };
        },
        messages: async () => ({ data: [] }),
      },
    },
    notifier: {
      notify: async (notification) => {
        notifyCalls.push(notification);
      },
    },
    logger: {
      warn: async (message, extra) => {
        warnings.push({ message, ...(extra ? { extra } : {}) });
      },
    },
  });

  await plugin["tool.execute.before"](
    {
      tool: "question",
      sessionID: "not-a-session",
      callID: "call-1",
    },
    { args: { questions: [{ question: "hello?" }] } },
  );

  assert.equal(clientGetCalls.length, 0);
  assert.equal(notifyCalls.length, 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!.message, /invalid sessionID/i);
  assert.equal(warnings[0]!.extra?.sessionId, "not-a-session");
});
