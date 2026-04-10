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
} from "../format.js";
import { createOpenCodeNotifierPlugin } from "../notifier-plugin.js";

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
        sessionID: "root-session",
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
