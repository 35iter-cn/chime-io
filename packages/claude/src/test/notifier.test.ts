import assert from "node:assert/strict";
import test from "node:test";

import {
  createSessionCompletedNotification,
  createSessionErrorNotification,
  createPermissionNotification,
  createQuestionNotification,
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

  // 检查会话标题（从 cwd 提取）
  assert.equal(notification.title, "telnotify");

  // 检查 lines 包含关键信息
  const lines = notification.lines.join("\n");
  assert.match(lines, /completed/);
  assert.match(lines, /claude-3-7-sonnet/);
  assert.match(lines, /10800/);
  assert.match(lines, /feat\/demo/);
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
  assert.equal(notification.title, "myproject");
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

  // 检查会话标题（从 cwd 提取的项目名）
  assert.equal(notification.title, "myproject");

  // 检查 lines 包含错误信息
  const lines = notification.lines.join("\n");
  assert.match(lines, /Error occurred during session/);
  assert.match(lines, /Something went wrong during execution/);
  assert.match(lines, /main/);

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
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "permission");

  // 检查会话标题
  assert.equal(notification.title, "myproject");

  // 检查 lines 包含权限信息
  const lines = notification.lines.join("\n");
  assert.match(lines, /Execute Bash Command/);
  assert.match(lines, /Bash/);
  assert.match(lines, /ls -la/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "perm-session-123");
  assert.equal(notification.metadata.fullSessionId, "perm-session-123");
  assert.equal(notification.metadata.permissionTitle, "Execute Bash Command");
  assert.equal(notification.metadata.toolName, "Bash");
});

test("createPermissionNotification handles minimal input", () => {
  const notification = createPermissionNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata.permissionTitle, "Permission Required");
  assert.equal(notification.metadata.toolName, "Unknown Tool");
});

test("createQuestionNotification includes required fields", () => {
  const notification = createQuestionNotification({
    session_id: "question-session-456",
    cwd: "/root/code/awesome-app",
    prompt: "What would you like me to do next?",
    turn_count: 5,
  });

  // 检查 Agent 名称
  assert.equal(notification.agent, "claude");

  // 检查消息类型
  assert.equal(notification.kind, "question");

  // 检查会话标题
  assert.equal(notification.title, "awesome-app");

  // 检查 lines 包含问题信息
  const lines = notification.lines.join("\n");
  assert.match(lines, /Turn #5/);
  assert.match(lines, /What would you like me to do next/);

  // 检查 metadata
  assert.equal(notification.metadata.sessionId, "question-session-456");
  assert.equal(notification.metadata.fullSessionId, "question-session-456");
  assert.equal(notification.metadata.turnCount, 5);
});

test("createQuestionNotification handles message field", () => {
  const notification = createQuestionNotification({
    session_id: "test789",
    message: "Please provide more details",
  });

  const lines = notification.lines.join("\n");
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
