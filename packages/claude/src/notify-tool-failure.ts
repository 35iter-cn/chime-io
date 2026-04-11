#!/usr/bin/env node
/**
 * Hook: PostToolUseFailure - 工具执行失败通知
 *
 * 触发时机：Claude Code 执行工具失败时
 * 消息内容包含：
 *   - Agent 名称: claude
 *   - 会话标题（从项目目录名提取）
 *   - 完整的 session ID
 *   - 失败的工具名称和错误详情
 */

import {
  createClaudeNotifier,
  createToolFailureNotification,
  createApproveResponse,
} from './notifier.js';

interface HookInput {
  session_id?: string;
  sessionID?: string;
  cwd?: string;
  tool_name?: string;
  tool?: string;
  tool_use?: {
    name?: string;
    input?: Record<string, unknown>;
  };
  tool_input?: Record<string, unknown>;
  error?: string;
  result?: {
    error?: string;
    message?: string;
  };
  git_info?: {
    branch?: string;
  };
}

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput: HookInput = JSON.parse(input);

    // 创建 notifier 并发送通知
    const notifier = createClaudeNotifier();
    const notification = createToolFailureNotification(hookInput);

    await notifier.notify(notification);

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-tool-failure hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();