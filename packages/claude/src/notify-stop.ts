#!/usr/bin/env node
/**
 * Hook: Stop - 会话完成通知
 *
 * 触发时机：Claude Code 会话结束时
 * 消息内容包含：
 *   - Agent 名称: claude
 *   - 会话标题（从项目目录名提取）
 *   - 完整的 session ID
 *   - 最后一条 Agent 消息（适当裁剪）
 */

import {
  createClaudeNotifier,
  createSessionCompletedNotification,
  shouldNotifyStop,
  createApproveResponse,
} from './notifier.js';

interface HookInput {
  reason?: string;
  message?: string;
  session_id?: string;
  sessionID?: string;
  stop_details?: {
    model?: string;
    total_tokens?: number;
  };
  git_info?: {
    branch?: string;
  };
  cwd?: string;
  last_assistant_message?: string;
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

    // 检查是否应该发送通知
    if (!shouldNotifyStop(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    // 创建 notifier 并发送通知
    const notifier = createClaudeNotifier();
    const notification = createSessionCompletedNotification(hookInput);

    await notifier.notify(notification);

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-stop hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
