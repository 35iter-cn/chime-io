#!/usr/bin/env node
/**
 * Hook: Question - 用户提问通知
 *
 * 触发时机：Claude Code 向用户提问时
 * 消息内容包含：
 *   - Agent 名称: claude
 *   - 会话标题（从项目目录名提取）
 *   - 完整的 session ID
 *   - 问题内容
 */

import {
  createClaudeNotifier,
  createQuestionNotification,
  createApproveResponse,
} from './notifier.js';

interface HookInput {
  session_id?: string;
  sessionID?: string;
  cwd?: string;
  prompt?: string;
  message?: string;
  turn_count?: number;
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
    const notification = createQuestionNotification(hookInput);

    await notifier.notify(notification);

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-question hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
