import assert from "node:assert/strict";
import test from "node:test";

import {
  formatNotification,
  formatPermissionRequest,
  formatQuestion,
  formatSessionCompleted,
  formatSubagentNotification,
  formatToolFailure,
  shouldNotifyNotification,
  shouldNotifyQuestion,
  shouldNotifySubagent,
  shouldNotifyToolFailure,
} from "../notifier.js";

test("formatSessionCompleted includes model tokens and git branch", () => {
  process.env.CLAUDE_NOTIFY_DETAIL_LEVEL = "high";

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

  delete process.env.CLAUDE_NOTIFY_DETAIL_LEVEL;

  assert.match(text, /claude-3-7-sonnet/);
  assert.match(text, /Input tokens: 8\.5k/);
  assert.match(text, /Output tokens: 2\.3k/);
  assert.match(text, /10\.8k total/);
  assert.match(text, /feat\/demo\*/);
});

test("formatSessionCompleted escapes html content", () => {
  const text = formatSessionCompleted({
    session_id: "1234567890",
    reason: "completed <ok>",
    cwd: "/root/code/telnotify",
    git_info: { branch: "feat/<demo>", dirty: true },
  });

  assert.match(text, /completed &lt;ok&gt;/);
  assert.match(text, /feat\/&lt;demo&gt;\*/);
});

test("formatSessionCompleted respects stats and git flags", () => {
  process.env.CLAUDE_NOTIFY_INCLUDE_STATS = "false";
  process.env.CLAUDE_NOTIFY_INCLUDE_GIT = "0";

  const text = formatSessionCompleted({
    session_id: "1234567890",
    reason: "completed",
    cwd: "/root/code/telnotify",
    git_info: { branch: "feat/demo", dirty: true },
    stop_details: {
      model: "claude-3-7-sonnet",
      total_tokens: 10800,
    },
  });

  delete process.env.CLAUDE_NOTIFY_INCLUDE_STATS;
  delete process.env.CLAUDE_NOTIFY_INCLUDE_GIT;

  assert.doesNotMatch(text, /Tokens:/);
  assert.doesNotMatch(text, /feat\/demo/);
});

test("formatPermissionRequest includes tool risk and confidence", () => {
  process.env.CLAUDE_NOTIFY_DETAIL_LEVEL = "high";

  const text = formatPermissionRequest({
    session_id: "1234567890",
    title: "Permission Required",
    tool_name: "Bash",
    tool_input: { command: "rm -rf /tmp/*" },
    auto_mode_classification: { risk_level: "high", confidence: 15 },
  });

  delete process.env.CLAUDE_NOTIFY_DETAIL_LEVEL;

  assert.match(text, /Bash/);
  assert.match(text, /High/);
  assert.match(text, /15%/);
  assert.match(text, /rm -rf \/tmp\/\*/);
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
  assert.match(text, /8200/);
  assert.match(text, /200000/);
  assert.match(text, /4%/);
  assert.match(text, /ask/);
});

test("formatQuestion keeps project name without git branch", () => {
  const text = formatQuestion({
    prompt: "请问如何优化性能？",
    cwd: "/root/code/telnotify",
  });

  assert.match(text, /Project: telnotify/);
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

test("formatToolFailure only includes input at high detail", () => {
  const hookInput = {
    tool_name: "Bash",
    tool_input: { command: "npm test" },
    error: "permission denied",
  };

  const lowDetailText = formatToolFailure(hookInput);

  process.env.CLAUDE_NOTIFY_DETAIL_LEVEL = "high";
  const highDetailText = formatToolFailure(hookInput);
  delete process.env.CLAUDE_NOTIFY_DETAIL_LEVEL;

  assert.doesNotMatch(lowDetailText, /Input:/);
  assert.match(highDetailText, /Input:/);
});

test("shouldNotifySubagent uses high-signal final messages", () => {
  assert.equal(
    shouldNotifySubagent({
      hook_event_name: "SubagentStart",
      agent_type: "Explore",
    }),
    false,
  );
  assert.equal(
    shouldNotifySubagent({
      hook_event_name: "SubagentStop",
      agent_type: "Explore",
      last_assistant_message: "Analysis complete. Found 3 potential issues.",
    }),
    true,
  );
  assert.equal(
    shouldNotifySubagent({
      hook_event_name: "SubagentStop",
      agent_type: "Explore",
      last_assistant_message: "Analysis complete.",
    }),
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

test("shouldNotifySubagent supports high-signal chinese summaries", () => {
  assert.equal(
    shouldNotifySubagent({
      hook_event_name: "SubagentStop",
      agent_type: "Explore",
      last_assistant_message: "分析完成，发现 3 个问题。",
    }),
    true,
  );
});
