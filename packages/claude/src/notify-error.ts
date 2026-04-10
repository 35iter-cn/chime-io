#!/usr/bin/env node
/**
 * Hook: Error - 会话错误通知
 *
 * 触发时机：Claude Code 会话发生错误时
 * 消息内容包含：
 *   - Agent 名称: claude
 *   - 会话标题（从项目目录名提取）
 *   - 完整的 session ID
 *   - 错误详情
 */

import {
  createClaudeNotifier,
  createSessionErrorNotification,
  createApproveResponse,
} from './notifier.js';

interface HookInput {
  error?: string;
  session_id?: string;
  sessionID?: string;
  cwd?: string;
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

    // 没有错误时不发送通知
    if (!hookInput.error) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    // 创建 notifier 并发送通知
    const notifier = createClaudeNotifier();
    const notification = createSessionErrorNotification(hookInput);

    await notifier.notify(notification);

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-error hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
