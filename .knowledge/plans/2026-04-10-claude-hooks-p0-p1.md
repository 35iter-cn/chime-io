# Claude Hooks P0 P1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `@chime-io/plugin-claude` 增强现有 Claude Code hooks 消息内容，并新增低噪音的 tool-use / subagent 通知。

**Architecture:** 保留每个 hook 一个入口脚本的结构，把字段提取、过滤规则和消息格式化集中到 `packages/claude/hooks/lib/notifier.js`。测试采用 `tsx --test` 跑 `packages/claude/test/` 中的 Node 原生测试，先写失败用例，再写最小实现。

**Tech Stack:** TypeScript, ESM, Node `node:test`, `tsx`, Claude Code hooks, Telegram Bot API.

---

### Task 1: 建立 claude 包测试入口并写第一批失败测试

**Files:**
- Modify: `packages/claude/package.json`
- Create: `packages/claude/test/notifier.test.ts`
- Read: `packages/claude/hooks/lib/notifier.js`

- [ ] **Step 1: 在 `packages/claude/package.json` 中添加测试脚本**

```json
{
  "scripts": {
    "build": "tsc -b",
    "build:watch": "tsc -b --watch --preserveWatchOutput",
    "test": "tsx --test test/notifier.test.ts",
    "clean": "rm -rf dist tsconfig.tsbuildinfo",
    "typecheck": "tsc -b --pretty false"
  }
}
```

- [ ] **Step 2: 新建 `packages/claude/test/notifier.test.ts`，先写 Stop / Permission / Notification 的失败测试**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  formatNotification,
  formatPermissionRequest,
  formatSessionCompleted,
  shouldNotifyNotification,
} from "../hooks/lib/notifier.js";

test("formatSessionCompleted includes model tokens and git branch", () => {
  const text = formatSessionCompleted({
    session_id: "1234567890",
    reason: "completed",
    cwd: "/root/code/telnotify",
    permission_mode: "default",
    git_info: { branch: "feat/demo", dirty: true },
    stop_details: {
      model: "claude-3-7-sonnet",
      prompt_tokens: 8500,
      completion_tokens: 2300,
      total_tokens: 10800,
    },
  });

  assert.match(text, /claude-3-7-sonnet/);
  assert.match(text, /10\.8k total/);
  assert.match(text, /feat\/demo\*/);
});

test("formatPermissionRequest includes tool risk and confidence", () => {
  const text = formatPermissionRequest({
    session_id: "1234567890",
    title: "Permission Required",
    permission_type: "tool",
    tool_name: "Bash",
    tool_input: { command: "rm -rf /tmp/*" },
    auto_mode_classification: { risk_level: "high", confidence: 15 },
  });

  assert.match(text, /Bash/);
  assert.match(text, /High/);
  assert.match(text, /15%/);
});

test("shouldNotifyNotification skips low priority", () => {
  assert.equal(shouldNotifyNotification({ priority: "low" }), false);
});

test("formatNotification includes priority and type", () => {
  const text = formatNotification({
    session_id: "1234567890",
    priority: "high",
    title: "Claude is ready",
    message: "Analysis complete",
    notification_type: "idle_prompt",
  });

  assert.match(text, /HIGH/);
  assert.match(text, /idle_prompt/);
  assert.match(text, /Claude is ready/);
});
```

- [ ] **Step 3: 运行测试，确认因为导出不存在或格式不匹配而失败**

Run: `pnpm --filter @chime-io/plugin-claude test`
Expected: FAIL，提示 `shouldNotifyNotification` 缺失或字符串内容与断言不匹配。

- [ ] **Step 4: 提交最小脚本变更前先不要实现，保持红灯状态**

Run: `git status --short`
Expected: 只看到 `packages/claude/package.json` 和 `packages/claude/test/notifier.test.ts` 被修改/新增。

### Task 2: 实现基础 formatter 和通知过滤，把第一批测试跑绿

**Files:**
- Modify: `packages/claude/hooks/lib/notifier.js`
- Test: `packages/claude/test/notifier.test.ts`

- [ ] **Step 1: 在 `packages/claude/hooks/lib/notifier.js` 中添加最小公共工具**

```js
export function formatTokenCount(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

export function formatProjectName(cwd) {
  if (!cwd) return "";
  const parts = String(cwd).split("/").filter(Boolean);
  return parts.at(-1) ?? String(cwd);
}

export function shouldNotifyNotification(hookInput) {
  const priority = hookInput.priority || hookInput.notification?.priority;
  return priority !== "low" && priority !== "info";
}
```

- [ ] **Step 2: 用最小实现更新三个 formatter**

```js
export function formatSessionCompleted(hookInput) {
  const sessionId = hookInput.session_id || hookInput.sessionID || "unknown";
  const shortId = String(sessionId).slice(0, 8);
  const reason = hookInput.reason || "completed";
  const model = hookInput.stop_details?.model;
  const total = formatTokenCount(hookInput.stop_details?.total_tokens);
  const branch = hookInput.git_info?.branch;
  const dirty = hookInput.git_info?.dirty ? "*" : "";
  const project = formatProjectName(hookInput.cwd);

  return [
    `<b>Claude Code · Session Completed</b>`,
    "",
    `Session: <code>${escapeHtml(shortId)}</code>`,
    `Status: ${escapeHtml(reason)}`,
    model ? `Model: ${escapeHtml(model)}` : "",
    total ? `Tokens: ${escapeHtml(total)} total` : "",
    branch ? `Project: ${escapeHtml(project)} (${escapeHtml(branch + dirty)})` : "",
  ].filter(Boolean).join("\n");
}

export function formatPermissionRequest(hookInput) {
  const toolName = hookInput.tool_name || hookInput.tool || "Unknown";
  const riskLevel = hookInput.auto_mode_classification?.risk_level;
  const confidence = hookInput.auto_mode_classification?.confidence;

  return [
    `<b>Claude Code · Permission Required</b>`,
    "",
    `Tool: ${escapeHtml(toolName)}`,
    riskLevel ? `Risk: ${escapeHtml(capitalizeWord(riskLevel))}` : "",
    typeof confidence === "number" ? `Confidence: ${escapeHtml(String(confidence))}%` : "",
  ].filter(Boolean).join("\n");
}

export function formatNotification(hookInput) {
  const priority = String(hookInput.priority || hookInput.notification?.priority || "info").toUpperCase();
  const title = hookInput.title || hookInput.notification?.title;
  const message = hookInput.message || hookInput.notification?.message || "New notification";
  const type = hookInput.notification_type || hookInput.notification?.type;

  return [
    `<b>Claude Code · Notification [${escapeHtml(priority)}]</b>`,
    "",
    title ? `Title: ${escapeHtml(truncateText(title, 120))}` : "",
    `Message: ${escapeHtml(truncateText(message, 200))}`,
    type ? `Type: ${escapeHtml(type)}` : "",
  ].filter(Boolean).join("\n");
}
```

- [ ] **Step 3: 运行测试，确认 Task 1 的测试通过**

Run: `pnpm --filter @chime-io/plugin-claude test`
Expected: PASS，至少 4 个测试通过。

- [ ] **Step 4: 小幅整理重复逻辑，但不要扩展额外功能**

Run: `pnpm --filter @chime-io/plugin-claude test`
Expected: 仍然 PASS。

### Task 3: 为 question、tool failure、subagent 写失败测试

**Files:**
- Modify: `packages/claude/test/notifier.test.ts`
- Read: `packages/claude/hooks/lib/notifier.js`

- [ ] **Step 1: 为 question、tool failure、subagent 添加失败测试**

```ts
import {
  formatQuestion,
  formatSubagentNotification,
  formatToolFailure,
  shouldNotifyQuestion,
  shouldNotifySubagent,
  shouldNotifyToolFailure,
} from "../hooks/lib/notifier.js";

test("shouldNotifyQuestion only allows question-like prompts", () => {
  assert.equal(shouldNotifyQuestion({ prompt: "请问这个怎么配置？" }), true);
  assert.equal(shouldNotifyQuestion({ prompt: "帮我改这个文件" }), false);
});

test("formatQuestion includes turn and context usage", () => {
  const text = formatQuestion({
    prompt: "请问如何优化性能？",
    turn_count: 7,
    total_tokens: 8200,
    context_window_size: 200000,
    is_slash_command: true,
    command_name: "ask",
    cwd: "/root/code/telnotify",
    git_info: { branch: "feat/demo" },
  });

  assert.match(text, /Turn #7/);
  assert.match(text, /4%/);
  assert.match(text, /ask/);
});

test("shouldNotifyToolFailure respects CLAUDE_NOTIFY_TOOL_FILTER", () => {
  process.env.CLAUDE_NOTIFY_TOOL_FILTER = "Bash|Edit";
  assert.equal(shouldNotifyToolFailure({ tool_name: "Bash" }), true);
  assert.equal(shouldNotifyToolFailure({ tool_name: "Read" }), false);
  delete process.env.CLAUDE_NOTIFY_TOOL_FILTER;
});

test("formatToolFailure includes error and duration", () => {
  const text = formatToolFailure({
    tool_name: "Bash",
    error: "permission denied",
    execution_time_ms: 1234,
  });

  assert.match(text, /permission denied/);
  assert.match(text, /1\.2s/);
});

test("shouldNotifySubagent uses high-signal final messages", () => {
  assert.equal(shouldNotifySubagent({ hook_event_name: "SubagentStart", agent_type: "Explore" }), false);
  assert.equal(
    shouldNotifySubagent({ hook_event_name: "SubagentStop", agent_type: "Explore", last_assistant_message: "Analysis complete. Found 3 potential issues." }),
    true,
  );
  assert.equal(
    shouldNotifySubagent({ hook_event_name: "SubagentStop", agent_type: "Explore", last_assistant_message: "Analysis complete." }),
    false,
  );
});

test("formatSubagentNotification uses official subagent fields", () => {
  const text = formatSubagentNotification({
    hook_event_name: "SubagentStop",
    agent_type: "Explore",
    last_assistant_message: "Analysis complete. Found 3 issues.",
  });

  assert.match(text, /Explore/);
  assert.match(text, /Found 3 issues/);
});
```

- [ ] **Step 2: 运行测试，确认因导出不存在或逻辑缺失而失败**

Run: `pnpm --filter @chime-io/plugin-claude test`
Expected: FAIL，提示新增函数缺失或断言不匹配。

### Task 4: 实现 question、tool failure、subagent 共享逻辑并跑绿

**Files:**
- Modify: `packages/claude/hooks/lib/notifier.js`
- Test: `packages/claude/test/notifier.test.ts`

- [ ] **Step 1: 添加 question 的过滤和格式化最小实现**

```js
export function shouldNotifyQuestion(hookInput) {
  const prompt = hookInput.prompt || hookInput.message || "";
  return /\?|什么时候|怎么样|为什么|如何|请问/.test(prompt);
}

export function formatQuestion(hookInput) {
  const prompt = hookInput.prompt || hookInput.message || "Waiting for input";
  const turn = hookInput.turn_count;
  const totalTokens = hookInput.total_tokens;
  const windowSize = hookInput.context_window_size;
  const usage = totalTokens && windowSize ? Math.round((totalTokens / windowSize) * 100) : null;
  const commandName = hookInput.is_slash_command ? hookInput.command_name || "yes" : "No";

  return [
    `<b>Claude Code · User Prompt</b>`,
    "",
    typeof turn === "number" ? `Turn #${turn}` : "",
    usage !== null ? `Context: ${usage}%` : "",
    `Command: ${escapeHtml(String(commandName))}`,
    `Prompt: ${escapeHtml(truncateText(prompt, 200))}`,
  ].filter(Boolean).join("\n");
}
```

- [ ] **Step 2: 添加 tool failure 与 subagent 的过滤和格式化最小实现**

```js
export function shouldNotifyToolFailure(hookInput) {
  const filter = process.env.CLAUDE_NOTIFY_TOOL_FILTER;
  const toolName = hookInput.tool_name || hookInput.tool || "";
  if (!filter) return true;
  return new RegExp(filter).test(String(toolName));
}

export function formatDurationMs(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

export function formatToolFailure(hookInput) {
  return [
    `<b>Claude Code · Tool Failed</b>`,
    "",
    `Tool: ${escapeHtml(String(hookInput.tool_name || hookInput.tool || "Unknown"))}`,
    hookInput.tool_error ? `Error: ${escapeHtml(truncateText(String(hookInput.tool_error), 200))}` : "",
    hookInput.execution_time_ms ? `Duration: ${escapeHtml(formatDurationMs(hookInput.execution_time_ms))}` : "",
  ].filter(Boolean).join("\n");
}

export function shouldNotifySubagent(hookInput) {
  if (hookInput.hook_event_name === "SubagentStart") return false;
  return isHighSignalText(hookInput.last_assistant_message);
}

export function formatSubagentNotification(hookInput) {
  const summary = hookInput.last_assistant_message || "";

  return [
    `<b>Claude Code · Subagent Completed</b>`,
    "",
    `Agent: ${escapeHtml(String(hookInput.agent_type || "unknown"))}`,
    summary ? `Summary: ${escapeHtml(truncateText(String(summary), 200))}` : "",
  ].filter(Boolean).join("\n");
}
```

- [ ] **Step 3: 运行测试，确认 question/tool/subagent 测试通过**

Run: `pnpm --filter @chime-io/plugin-claude test`
Expected: PASS，全部测试通过。

- [ ] **Step 4: 再跑一次类型检查，确认 JS hooks 改动没有影响 TS 包**

Run: `pnpm --filter @chime-io/plugin-claude typecheck`
Expected: PASS。

### Task 5: 让 hook 入口脚本复用共享过滤逻辑

**Files:**
- Modify: `packages/claude/hooks/notify-stop.js`
- Modify: `packages/claude/hooks/notify-notification.js`
- Modify: `packages/claude/hooks/notify-permission.js`
- Modify: `packages/claude/hooks/notify-question.js`
- Create: `packages/claude/hooks/notify-tool-use.js`
- Create: `packages/claude/hooks/notify-subagent.js`

- [ ] **Step 1: 在共享层中补一个统一 approve 响应常量或函数**

```js
export function createApproveResponse() {
  return {
    decision: "approve",
    reason: "",
    systemMessage: "",
  };
}
```

- [ ] **Step 2: 把现有四个 hook 改成“过滤则输出 approve 并 return”**

```js
if (!shouldNotifyNotification(hookInput)) {
  console.log(JSON.stringify(createApproveResponse()));
  return;
}
```

对 `Stop`、`UserPromptSubmit` 也做同样模式，避免直接 `process.exit(0)`。

- [ ] **Step 3: 新建 `notify-tool-use.js`，只处理 `PostToolUseFailure`**

```js
#!/usr/bin/env node

import {
  createApproveResponse,
  formatToolFailure,
  sendNotification,
  shouldNotifyToolFailure,
} from "./lib/notifier.js";

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);
    if (!shouldNotifyToolFailure(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    await sendNotification({ text: formatToolFailure(hookInput) });
    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error("Error in notify-tool-use hook:", error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
```

- [ ] **Step 4: 新建 `notify-subagent.js`，使用 `shouldNotifySubagent` 和 `formatSubagentNotification`**

```js
#!/usr/bin/env node

import {
  createApproveResponse,
  formatSubagentNotification,
  sendNotification,
  shouldNotifySubagent,
} from "./lib/notifier.js";

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);
    if (!shouldNotifySubagent(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    await sendNotification({ text: formatSubagentNotification(hookInput) });
    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error("Error in notify-subagent hook:", error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
```

- [ ] **Step 5: 跑测试与 typecheck，确认入口改造没有回归**

Run: `pnpm --filter @chime-io/plugin-claude test && pnpm --filter @chime-io/plugin-claude typecheck`
Expected: PASS。

### Task 6: 更新 hooks.json、TS 类型和文档

**Files:**
- Modify: `packages/claude/hooks/hooks.json`
- Modify: `packages/claude/src/types.ts`
- Modify: `packages/claude/README.md`
- Modify: `README.md`

- [ ] **Step 1: 在 `packages/claude/hooks/hooks.json` 中注册新增事件**

```json
{
  "hooks": {
    "PostToolUseFailure": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/notify-tool-use.js",
            "async": true
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/notify-subagent.js",
            "async": true
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/notify-subagent.js",
            "async": true
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: 扩展 `packages/claude/src/types.ts` 的事件名和 hook 输入字段**

```ts
export type HookEventName =
  | "SessionStart"
  | "PreToolUse"
  | "PostToolUse"
  | "PostToolUseFailure"
  | "Stop"
  | "UserPromptSubmit"
  | "Notification"
  | "PermissionRequest"
  | "SubagentStart"
  | "SubagentStop";
```

并补充 `cwd`、`permission_mode`、`git_info`、`stop_details`、`notification_type`、`tool_name`、`error`、`execution_time_ms`、`agent_type`、`last_assistant_message`、`agent_transcript_path` 等字段接口。

- [ ] **Step 3: 更新 `packages/claude/README.md`**

把构建命令改为：

```bash
node common/scripts/install-run-rush.js install
pnpm --filter @chime-io/plugin-claude test
pnpm --filter @chime-io/plugin-claude typecheck
```

并新增环境变量示例：

```bash
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
export CLAUDE_NOTIFY_TOOL_FILTER="Bash|Edit"
```

- [ ] **Step 4: 更新根 `README.md` 的 Claude 插件说明**

将支持事件列表改为包含：`Stop`、`PermissionRequest`、`Notification`、`UserPromptSubmit`、`PostToolUseFailure`、`SubagentStop`（说明 `SubagentStart` 已注册但默认静默）。

- [ ] **Step 5: 跑最终验证**

Run: `pnpm --filter @chime-io/plugin-claude test && pnpm --filter @chime-io/plugin-claude typecheck`
Expected: PASS。

### Task 7: 完整验证与工作区自检

**Files:**
- Modify: none expected

- [ ] **Step 1: 查看工作树状态，确认只包含计划内文件**

Run: `git status --short`
Expected: 仅出现 `packages/claude/**`、`README.md`、`.knowledge/**` 的计划内改动。

- [ ] **Step 2: 运行包级验证**

Run: `pnpm --filter @chime-io/plugin-claude test && pnpm --filter @chime-io/plugin-claude typecheck`
Expected: PASS。

- [ ] **Step 3: 如时间允许再运行一次仓库级构建**

Run: `pnpm build`
Expected: PASS。

- [ ] **Step 4: 记录未覆盖项**

在最终汇报中明确列出：

```text
- ConfigChange 尚未实现
- Session Summary 尚未实现
- Telegram 交互按钮尚未实现
```
