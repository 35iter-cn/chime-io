import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { Block, CodeBlock, ParagraphBlock, StatsBlock } from "@chime-io/core";

import { opencodeDescriptor } from "../agent.ts";
import {
  buildChangeStats,
  createOpenCodeEventFormatter,
  extractLastErrorFromMessages,
  extractLastResultFromMessages,
} from "../format.ts";
import { createOpenCodeNotifierPlugin } from "../notifier-plugin.ts";

function findBlock<T extends Block["type"]>(
  blocks: Block[],
  type: T,
): Extract<Block, { type: T }> | undefined {
  return blocks.find((b): b is Extract<Block, { type: T }> => b.type === type);
}

test("buildChangeStats keeps additions deletions and file count", () => {
  assert.deepEqual(
    buildChangeStats({
      summary: { additions: 4, deletions: 2, files: 3 },
    }),
    [
      { label: "additions", value: 4 },
      { label: "deletions", value: 2 },
      { label: "files", value: 3 },
    ],
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

test("createOpenCodeEventFormatter formats completed root session as neutral notification", async () => {
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

  assert.equal(notification.agent, "opencode");
  assert.equal(notification.kind, "session.completed");
  assert.equal(notification.intent, "completion");
  assert.equal(notification.severity, "info");
  assert.equal(notification.requiresAction, false);
  assert.equal(notification.subject, "feature-flow");
  assert.deepEqual(notification.metadata, { sessionId: "1234567890abcdef" });

  const stats = findBlock(notification.blocks, "stats") as StatsBlock;
  assert.ok(stats);
  assert.deepEqual(stats.stats, [
    { label: "additions", value: 7 },
    { label: "deletions", value: 1 },
    { label: "files", value: 2 },
  ]);

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.equal(paragraph.content, "任务已完成");
});

test("createOpenCodeEventFormatter includes error code block on session error", async () => {
  const formatter = createOpenCodeEventFormatter({
    listMessages: async () => [],
  });

  const notification = await formatter.formatSessionError(
    { id: "ses_abcdef1234", title: "task" },
    "TypeError: boom",
  );

  assert.equal(notification.intent, "error");
  assert.equal(notification.severity, "critical");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.subject, "task");
  const code = findBlock(notification.blocks, "code") as CodeBlock;
  assert.ok(code);
  assert.equal(code.content, "TypeError: boom");
});

test("createOpenCodeEventFormatter formats question and permission events", () => {
  const formatter = createOpenCodeEventFormatter({
    listMessages: async () => [],
  });

  const question = formatter.formatQuestion(
    { id: "ses_a", title: "app" },
    "which one?",
  );
  assert.equal(question.intent, "question");
  assert.equal(question.requiresAction, true);
  const questionParagraph = findBlock(
    question.blocks,
    "paragraph",
  ) as ParagraphBlock;
  assert.equal(questionParagraph?.content, "which one?");

  const permission = formatter.formatPermission(
    { id: "ses_a", title: "app" },
    "run rm -rf",
  );
  assert.equal(permission.intent, "permission");
  assert.equal(permission.severity, "warning");
  assert.equal(permission.requiresAction, true);
  const permParagraph = findBlock(
    permission.blocks,
    "paragraph",
  ) as ParagraphBlock;
  assert.equal(permParagraph?.content, "run rm -rf");
});

test("opencodeDescriptor exposes the expected identity", () => {
  assert.equal(opencodeDescriptor.id, "opencode");
  assert.equal(opencodeDescriptor.displayName, "OpenCode");
  assert.ok(opencodeDescriptor.defaultEmoji.length > 0);

  const link = opencodeDescriptor.deepLinkTemplate?.({
    sessionId: "abc",
  });
  assert.equal(link, "opencode://session/abc");
  assert.equal(opencodeDescriptor.deepLinkTemplate?.({}), undefined);
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
    notifier: { notify: async () => [] },
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
        return [];
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

  assert.equal(clientGetCalls.length, 0);
  assert.equal(notifyCalls.length, 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!.message, /invalid sessionID/i);
  assert.equal(warnings[0]!.extra?.["sessionId"], "xHLOinvalid");
});

test("createOpenCodeNotifierPlugin sends completion notification after session.idle", async () => {
  const notifyCalls: Array<{ kind: string; intent: string }> = [];

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
        notifyCalls.push({
          kind: notification.kind,
          intent: notification.intent,
        });
        return [];
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
  assert.equal(notifyCalls[0]?.kind, "session.completed");
  assert.equal(notifyCalls[0]?.intent, "completion");
});

test("createOpenCodeNotifierPlugin skips completion notification when retry is pending", async () => {
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
        return [];
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

  assert.equal(notifyCalls.length, 0);
});

test("createOpenCodeNotifierPlugin resumes notification after retry then new busy", async () => {
  const notifyCalls: Array<{ kind: string }> = [];

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
        notifyCalls.push({ kind: notification.kind });
        return [];
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
  assert.equal(notifyCalls[0]?.kind, "session.completed");
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
        return [];
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
  assert.equal(warnings[0]!.extra?.["sessionId"], "not-a-session");
});
