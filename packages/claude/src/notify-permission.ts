#!/usr/bin/env node
/**
 * Hook: Permission - 权限请求通知
 *
 * 触发时机：Claude Code 需要用户权限时
 * 消息内容包含：
 *   - Agent 名称: claude
 *   - 会话标题（从项目目录名提取）
 *   - 完整的 session ID
 *   - 权限请求详情
 */

import {
  createClaudeNotifier,
  createPermissionNotification,
  createApproveResponse,
} from './notifier.js';

interface HookInput {
  session_id?: string;
  sessionID?: string;
  cwd?: string;
  title?: string;
  permission?: {
    title?: string;
  };
  tool_name?: string;
  tool?: string;
  tool_input?: Record<string, unknown>;
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
    const notification = createPermissionNotification(hookInput);

    await notifier.notify(notification);

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-permission hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
