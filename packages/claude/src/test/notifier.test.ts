import assert from "node:assert/strict";
import test from "node:test";

import type { Block, FieldsBlock, StatsBlock, ParagraphBlock, CodeBlock } from "@chime-io/core";

import {
  claudeDescriptor,
  createSessionCompletedNotification,
  createSessionErrorNotification,
  createPermissionNotification,
  createQuestionNotification,
  createToolFailureNotification,
  shouldNotifyStop,
  createApproveResponse,
} from "../notifier.ts";

function findBlock<T extends Block["type"]>(
  blocks: Block[],
  type: T,
): Extract<Block, { type: T }> | undefined {
  return blocks.find((b): b is Extract<Block, { type: T }> => b.type === type);
}

test("createSessionCompletedNotification produces channel-neutral fields", () => {
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

  assert.equal(notification.agent, "claude");
  assert.equal(notification.kind, "session_complete");
  assert.equal(notification.intent, "completion");
  assert.equal(notification.severity, "info");
  assert.equal(notification.requiresAction, false);
  assert.equal(notification.subject, "telnotify");

  const stats = findBlock(notification.blocks, "stats") as StatsBlock;
  assert.ok(stats, "stats block should exist");
  assert.deepEqual(stats.stats, [
    { label: "status", value: "completed" },
    { label: "model", value: "claude-3-7-sonnet" },
    { label: "tokens", value: 10800 },
  ]);

  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields, "fields block should exist");
  assert.deepEqual(fields.fields, [
    { label: "cwd", value: "/root/code/telnotify" },
    { label: "branch", value: "feat/demo" },
  ]);

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph, "paragraph block should exist");
  assert.equal(paragraph.content, "This is the final message from the agent");

  assert.equal(notification.metadata['sessionId'], "1234567890abcdef");
  assert.equal(notification.metadata['fullSessionId'], "1234567890abcdef");
});

test("createSessionCompletedNotification blocks contain no channel-specific copy", () => {
  const notification = createSessionCompletedNotification({
    session_id: "abc123",
    cwd: "/home/user/myproject",
    git_info: { branch: "main" },
    last_assistant_message: "done",
  });

  const serialized = JSON.stringify(notification.blocks);
  assert.doesNotMatch(serialized, /Claude/, "blocks must not brand the agent");
  assert.doesNotMatch(serialized, /<\w+>/, "blocks must not include HTML");
  assert.doesNotMatch(serialized, /📁|🌿|✅|🚨|🔒|💬|🔧|❌/, "blocks must not include emoji");
});

test("createSessionCompletedNotification handles missing optional fields", () => {
  const notification = createSessionCompletedNotification({
    session_id: "abc123",
    cwd: "/home/user/myproject",
  });

  assert.equal(notification.subject, "myproject");
  assert.equal(notification.metadata['sessionId'], "abc123");

  const stats = findBlock(notification.blocks, "stats") as StatsBlock;
  assert.ok(stats);
  assert.deepEqual(stats.stats, [{ label: "status", value: "completed" }]);
});

test("createSessionCompletedNotification truncates long messages", () => {
  const longMessage = "a".repeat(1000);
  const notification = createSessionCompletedNotification({
    session_id: "test123",
    last_assistant_message: longMessage,
  });

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.ok(paragraph.content.length < 1000);
  assert.match(paragraph.content, /\.\.\.$/);
});

test("createSessionErrorNotification produces error intent", () => {
  const notification = createSessionErrorNotification({
    session_id: "error-session-123",
    cwd: "/root/code/myproject",
    error: "Something went wrong during execution",
    git_info: { branch: "main" },
  });

  assert.equal(notification.agent, "claude");
  assert.equal(notification.kind, "error");
  assert.equal(notification.intent, "error");
  assert.equal(notification.severity, "critical");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.subject, "myproject");

  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields);
  assert.deepEqual(fields.fields, [
    { label: "cwd", value: "/root/code/myproject" },
    { label: "branch", value: "main" },
  ]);

  const code = findBlock(notification.blocks, "code") as CodeBlock;
  assert.ok(code);
  assert.equal(code.content, "Something went wrong during execution");

  assert.equal(notification.metadata['sessionId'], "error-session-123");
  assert.equal(
    notification.metadata['error'],
    "Something went wrong during execution",
  );
});

test("createSessionErrorNotification handles unknown error", () => {
  const notification = createSessionErrorNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata['error'], "Unknown error");
  const code = findBlock(notification.blocks, "code") as CodeBlock;
  assert.ok(code);
  assert.equal(code.content, "Unknown error");
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

  assert.equal(notification.metadata['project'], "awesome-app");
});

test("createSessionErrorNotification includes project in metadata", () => {
  const notification = createSessionErrorNotification({
    session_id: "error123",
    cwd: "/work/project-x",
    error: "Test error",
  });

  assert.equal(notification.metadata['project'], "project-x");
});

test("notifications include all required fields", () => {
  const notification = createSessionCompletedNotification({
    session_id: "full-session-id-12345",
    cwd: "/test/project",
    last_assistant_message: "Final response",
  });

  assert.ok(notification.agent, "agent should be defined");
  assert.ok(notification.kind, "kind should be defined");
  assert.ok(notification.intent, "intent should be defined");
  assert.ok(notification.severity, "severity should be defined");
  assert.ok(typeof notification.requiresAction === "boolean");
  assert.ok(notification.subject, "subject should be defined");
  assert.ok(Array.isArray(notification.blocks), "blocks should be an array");
  assert.ok(notification.metadata, "metadata should be defined");

  assert.equal(
    notification.metadata['fullSessionId'],
    "full-session-id-12345",
  );
});

test("createPermissionNotification produces permission intent", () => {
  const notification = createPermissionNotification({
    session_id: "perm-session-123",
    cwd: "/root/code/myproject",
    title: "Execute Bash Command",
    permission: { title: "Run command" },
    tool_name: "Bash",
    tool_input: { command: "ls -la", timeout: 60000 },
    git_info: { branch: "develop" },
  });

  assert.equal(notification.agent, "claude");
  assert.equal(notification.kind, "permission");
  assert.equal(notification.intent, "permission");
  assert.equal(notification.severity, "warning");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.subject, "myproject");

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.equal(paragraph.content, "Execute Bash Command");

  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields);
  assert.deepEqual(fields.fields, [
    { label: "tool", value: "Bash" },
    { label: "cwd", value: "/root/code/myproject" },
    { label: "branch", value: "develop" },
  ]);

  assert.equal(notification.metadata['sessionId'], "perm-session-123");
  assert.equal(notification.metadata['permissionTitle'], "Execute Bash Command");
});

test("createPermissionNotification handles minimal input", () => {
  const notification = createPermissionNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.intent, "permission");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.metadata['permissionTitle'], "");
  assert.equal(findBlock(notification.blocks, "paragraph"), undefined);
});

test("createQuestionNotification produces question intent", () => {
  const notification = createQuestionNotification({
    session_id: "question-session-456",
    cwd: "/root/code/awesome-app",
    prompt: "What would you like me to do next?",
    turn_count: 5,
    git_info: { branch: "feature/test" },
  });

  assert.equal(notification.agent, "claude");
  assert.equal(notification.kind, "question");
  assert.equal(notification.intent, "question");
  assert.equal(notification.severity, "info");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.subject, "awesome-app");

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.equal(paragraph.content, "What would you like me to do next?");

  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields);
  assert.deepEqual(fields.fields, [
    { label: "cwd", value: "/root/code/awesome-app" },
    { label: "branch", value: "feature/test" },
  ]);
});

test("createQuestionNotification handles message field", () => {
  const notification = createQuestionNotification({
    session_id: "test789",
    message: "Please provide more details",
  });

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.equal(paragraph.content, "Please provide more details");
});

test("createQuestionNotification truncates long questions", () => {
  const longQuestion = "a".repeat(1000);
  const notification = createQuestionNotification({
    session_id: "test123",
    prompt: longQuestion,
  });

  const paragraph = findBlock(notification.blocks, "paragraph") as ParagraphBlock;
  assert.ok(paragraph);
  assert.ok(paragraph.content.length < 1000);
  assert.match(paragraph.content, /\.\.\.$/);
});

test("createToolFailureNotification produces tool_failure intent", () => {
  const notification = createToolFailureNotification({
    session_id: "tool-fail-session-789",
    cwd: "/root/code/myproject",
    tool_name: "Bash",
    tool_input: { command: "invalid-command", timeout: 60000 },
    result: { error: "Command not found: invalid-command" },
    git_info: { branch: "feature/test" },
  });

  assert.equal(notification.agent, "claude");
  assert.equal(notification.kind, "tool_failure");
  assert.equal(notification.intent, "tool_failure");
  assert.equal(notification.severity, "warning");
  assert.equal(notification.requiresAction, true);
  assert.equal(notification.subject, "myproject");

  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields);
  assert.deepEqual(fields.fields, [
    { label: "tool", value: "Bash" },
    { label: "cwd", value: "/root/code/myproject" },
    { label: "branch", value: "feature/test" },
  ]);

  const code = findBlock(notification.blocks, "code") as CodeBlock;
  assert.ok(code);
  assert.equal(code.content, "Command not found: invalid-command");

  assert.equal(notification.metadata['toolName'], "Bash");
  assert.equal(
    notification.metadata['error'],
    "Command not found: invalid-command",
  );
});

test("createToolFailureNotification handles minimal input", () => {
  const notification = createToolFailureNotification({
    session_id: "test123",
    cwd: "/project",
  });

  assert.equal(notification.metadata['toolName'], "");
  assert.equal(notification.metadata['error'], "");
  assert.equal(notification.kind, "tool_failure");
  assert.equal(findBlock(notification.blocks, "code"), undefined);
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

  assert.equal(notification.metadata['toolName'], "Edit");
  const fields = findBlock(notification.blocks, "fields") as FieldsBlock;
  assert.ok(fields);
  assert.equal(fields.fields[0]?.value, "Edit");
  const code = findBlock(notification.blocks, "code") as CodeBlock;
  assert.equal(code?.content, "File does not exist");
});

test("claudeDescriptor exposes the expected identity", () => {
  assert.equal(claudeDescriptor.id, "claude");
  assert.equal(claudeDescriptor.displayName, "Claude");
  assert.equal(typeof claudeDescriptor.defaultEmoji, "string");
  assert.ok(claudeDescriptor.defaultEmoji.length > 0);
});

test("claudeDescriptor.deepLinkTemplate builds a session URL when available", () => {
  const link = claudeDescriptor.deepLinkTemplate?.({
    fullSessionId: "abc123",
  });
  assert.equal(link, "claude://session/abc123");

  const missing = claudeDescriptor.deepLinkTemplate?.({});
  assert.equal(missing, undefined);
});
