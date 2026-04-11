import assert from "node:assert/strict";
import test from "node:test";

import {
  createSessionCompletedNotification,
  createSessionErrorNotification,
  createPermissionNotification,
  createQuestionNotification,
  createToolFailureNotification,
  shouldNotifyStop,
  createApproveResponse,
} from "../notifier.ts";

test("createSessionCompletedNotification includes required fields", () => {
  const notification = createSessionCompletedNotification({
    session_id: "1234567890abcdef",
    reason: "completed",
    cwd: "/root/code/telnotify",
    git_info: { branch: "feat/demo" },
    stop_details: {
      model: "claude-3-7-sonnet",
      total_tokens: 10800,
    },
    last_assistant_message: "This is the final message from the agent",
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "session_complete");

  // 检查标题格式：Claude · 项目名
  assert.equal(notification.title, "Claude · telnotify");

  // 检查 lines 包含关键信息（包含上下文）
  const lines = notification.lines.join("\n");
  assert.match(lines, /completed/);
  assert.match(lines, /claude-3-7-sonnet/);
  assert.match(lines, /10800 tokens/);
  assert.match(lines, /📁 \/root\/code\/telnotify/);
  assert.match(lines, /🌿 feat\/demo/);
  assert.match(lines, /This is the final message from the agent/);

  // 检查 metadata 包含完整的 sessionId
  assert.equal(notification.metadata.sessionId, "1234567890abcdef");
  assert.equal(notification.metadata.fullSessionId, "1234567890abcdef");
});

test("createSessionCompletedNotification handles missing optional fields", () => {
  const notification = createSessionCompletedNotification({
    session_id: "abc123",
    cwd: "/home/user/myproject",
  });

  assert.equal(notification.agent, "claude");
  assert.equal(notification.title, "Claude · myproject");
  assert.equal(notification.metadata.sessionId, "abc123");

  // 应该包含默认状态
  const lines = notification.lines.join("\n");
  assert.match(lines, /completed/);
});

test("createSessionCompletedNotification truncates long messages", () => {
  const longMessage = "a".repeat(1000);
  const notification = createSessionCompletedNotification({
    session_id: "test123",
    last_assistant_message: longMessage,
  });

  const lines = notification.lines.join("\n");
  assert.ok(lines.length < 1000);
  assert.match(lines, /\.\.\.$/);
});

test("createSessionErrorNotification includes error details", () => {
  const notification = createSessionErrorNotification({
    session_id: "error-session-123",
    cwd: "/root/code/myproject",
    error: "Something went wrong during execution",
    git_info: { branch: "main" },
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "error");

  // 检查标题格式：Claude · 项目名
  assert.equal(notification.title, "Claude · myproject");

  // 检查 lines 包含简洁错误信息和上下文
  const lines = notification.lines.join("\n");
  assert.match(lines, /❌ 出错啦：/);
  assert.match(lines, /Something went wrong during execution/);
  assert.match(lines, /📁 \/root\/code\/myproject/);
  assert.match(lines, /🌿 main/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "error-session-123");
  assert.equal(notification.metadata.error, "Something went wrong during execution");
});

test("createSessionErrorNotification handles unknown error", () => {
  const notification = createSessionErrorNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata.error, "Unknown error");
  const lines = notification.lines.join("\n");
  assert.match(lines, /❌ 出错啦：Unknown error/);
});

test("shouldNotifyStop returns true for normal completions", () => {
  assert.equal(shouldNotifyStop({ reason: "completed" }), true);
  assert.equal(shouldNotifyStop({ reason: "error" }), true);
  assert.equal(shouldNotifyStop({}), true);
});

test("shouldNotifyStop returns false for user exits", () => {
  assert.equal(shouldNotifyStop({ reason: "user_exit" }), false);
  assert.equal(shouldNotifyStop({ reason: "interrupt" }), false);
});

test("createApproveResponse returns correct structure", () => {
  const response = createApproveResponse();

  assert.equal(response.decision, "approve");
  assert.equal(response.reason, "");
  assert.equal(response.systemMessage, "");
});

test("createSessionCompletedNotification includes project in metadata", () => {
  const notification = createSessionCompletedNotification({
    session_id: "test123",
    cwd: "/home/user/projects/awesome-app",
  });

  assert.equal(notification.metadata.project, "awesome-app");
});

test("createSessionErrorNotification includes project in metadata", () => {
  const notification = createSessionErrorNotification({
    session_id: "error123",
    cwd: "/work/project-x",
    error: "Test error",
  });

  assert.equal(notification.metadata.project, "project-x");
});

test("notifications include all required fields", () => {
  const completedNotification = createSessionCompletedNotification({
    session_id: "full-session-id-12345",
    cwd: "/test/project",
    last_assistant_message: "Final response",
  });

  // 验证所有必需字段都存在
  assert.ok(completedNotification.agent, "agent should be defined");
  assert.ok(completedNotification.kind, "kind should be defined");
  assert.ok(completedNotification.title, "title should be defined");
  assert.ok(Array.isArray(completedNotification.lines), "lines should be an array");
  assert.ok(completedNotification.metadata, "metadata should be defined");

  // 验证 metadata 包含完整的 sessionId
  assert.ok(
    completedNotification.metadata.fullSessionId,
    "fullSessionId should be in metadata",
  );
  assert.equal(
    completedNotification.metadata.fullSessionId,
    "full-session-id-12345",
    "fullSessionId should be complete",
  );
});

test("createPermissionNotification includes required fields", () => {
  const notification = createPermissionNotification({
    session_id: "perm-session-123",
    cwd: "/root/code/myproject",
    title: "Execute Bash Command",
    permission: { title: "Run command" },
    tool_name: "Bash",
    tool_input: { command: "ls -la", timeout: 60000 },
    git_info: { branch: "develop" },
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "permission");

  // 检查标题格式
  assert.equal(notification.title, "Claude · myproject");

  // 检查 lines 包含简洁权限信息和上下文
  const lines = notification.lines.join("\n");
  assert.match(lines, /🔒 Agent 需要你的确认：/);
  assert.match(lines, /Execute Bash Command/);
  assert.match(lines, /📁 \/root\/code\/myproject/);
  assert.match(lines, /🌿 develop/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "perm-session-123");
  assert.equal(notification.metadata.fullSessionId, "perm-session-123");
  assert.equal(notification.metadata.permissionTitle, "Execute Bash Command");
});

test("createPermissionNotification handles minimal input", () => {
  const notification = createPermissionNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata.permissionTitle, "");
  const lines = notification.lines.join("\n");
  assert.match(lines, /🔒 Agent 需要你的确认/);
});

test("createQuestionNotification includes required fields", () => {
  const notification = createQuestionNotification({
    session_id: "question-session-456",
    cwd: "/root/code/awesome-app",
    prompt: "What would you like me to do next?",
    turn_count: 5,
    git_info: { branch: "feature/test" },
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "question");

  // 检查标题格式
  assert.equal(notification.title, "Claude · awesome-app");

  // 检查 lines 包含简洁问题信息和上下文
  const lines = notification.lines.join("\n");
  assert.match(lines, /💬 Agent 正在等你回答：/);
  assert.match(lines, /What would you like me to do next/);
  assert.match(lines, /📁 \/root\/code\/awesome-app/);
  assert.match(lines, /🌿 feature\/test/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "question-session-456");
  assert.equal(notification.metadata.fullSessionId, "question-session-456");
});

test("createQuestionNotification handles message field", () => {
  const notification = createQuestionNotification({
    session_id: "test789",
    message: "Please provide more details",
  });

  const lines = notification.lines.join("\n");
  assert.match(lines, /💬 Agent 正在等你回答：/);
  assert.match(lines, /Please provide more details/);
});

test("createQuestionNotification truncates long questions", () => {
  const longQuestion = "a".repeat(1000);
  const notification = createQuestionNotification({
    session_id: "test123",
    prompt: longQuestion,
  });

  const lines = notification.lines.join("\n");
  assert.ok(lines.length < 1000);
  assert.match(lines, /\.\.\.$/);
});

test("createToolFailureNotification includes required fields", () => {
  const notification = createToolFailureNotification({
    session_id: "tool-fail-session-789",
    cwd: "/root/code/myproject",
    tool_name: "Bash",
    tool_input: { command: "invalid-command", timeout: 60000 },
    result: { error: "Command not found: invalid-command" },
    git_info: { branch: "feature/test" },
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "tool_failure");

  // 检查标题格式
  assert.equal(notification.title, "Claude · myproject");

  // 检查 lines 包含简洁工具失败信息和上下文
  const lines = notification.lines.join("\n");
  assert.match(lines, /🔧 工具 Bash 失败：/);
  assert.match(lines, /Command not found: invalid-command/);
  assert.match(lines, /📁 \/root\/code\/myproject/);
  assert.match(lines, /🌿 feature\/test/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "tool-fail-session-789");
  assert.equal(notification.metadata.fullSessionId, "tool-fail-session-789");
  assert.equal(notification.metadata.toolName, "Bash");
  assert.equal(notification.metadata.error, "Command not found: invalid-command");
});

test("createToolFailureNotification handles minimal input", () => {
  const notification = createToolFailureNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata.toolName, "");
  assert.equal(notification.metadata.error, "");
  assert.equal(notification.kind, "tool_failure");
  const lines = notification.lines.join("\n");
  assert.match(lines, /❌ 工具执行失败/);
});

test("createToolFailureNotification handles tool_use field", () => {
  const notification = createToolFailureNotification({
    session_id: "test456",
    cwd: "/work/app",
    tool_use: {
      name: "Edit",
      input: { file_path: "/test/file.ts", old_string: "foo", new_string: "bar" },
    },
    result: { error: "File does not exist" },
    git_info: { branch: "main" },
  });

  assert.equal(notification.metadata.toolName, "Edit");
  const lines = notification.lines.join("\n");
  assert.match(lines, /🔧 工具 Edit 失败：/);
  assert.match(lines, /File does not exist/);
  assert.match(lines, /🌿 main/);
});