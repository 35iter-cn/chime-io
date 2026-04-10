/**
 * Claude Code hooks - 使用 Core 层统一接口
 */

import {
  createNotification,
  createNotifier,
  type Notification,
} from '@chime-io/core';
import { createTelegramChannel } from '@chime-io/channel-telegram';

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
  error?: string;
  last_assistant_message?: string;
  title?: string;
  permission?: {
    title?: string;
  };
  tool_name?: string;
  tool?: string;
  tool_input?: Record<string, unknown>;
  prompt?: string;
  turn_count?: number;
}

/**
 * 创建 Claude 专用的 Notifier
 */
export function createClaudeNotifier() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_USER_ID;

  if (!token || !userId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID');
  }

  const channel = createTelegramChannel({
    token,
    userId,
    parseMode: 'HTML',
    silent: process.env.TELEGRAM_SILENT === '1',
  });

  return createNotifier({ channels: [channel] });
}

/**
 * 裁剪文本到指定长度
 */
function truncateText(text: string, maxLength = 500): string {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

/**
 * 格式化项目名
 */
function formatProjectName(cwd: string): string {
  if (!cwd) return '';
  const parts = cwd.split('/').filter(Boolean);
  return parts.at(-1) ?? cwd;
}

/**
 * 获取会话标题（从 cwd 中提取）
 */
function getSessionTitle(hookInput: HookInput): string {
  return formatProjectName(hookInput.cwd || '');
}

/**
 * 获取完整的 session ID
 */
function getSessionId(hookInput: HookInput): string {
  return hookInput.session_id || hookInput.sessionID || 'unknown';
}

/**
 * 检查是否应该通知 stop 事件
 */
export function shouldNotifyStop(hookInput: HookInput): boolean {
  return hookInput.reason !== 'user_exit' && hookInput.reason !== 'interrupt';
}

/**
 * 创建会话完成的 Notification
 * 包含：Agent名称、会话标题、完整sessionId、最后一条Agent消息
 */
export function createSessionCompletedNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const title = getSessionTitle(hookInput);
  const reason = hookInput.reason || 'completed';
  const lastMessage = hookInput.last_assistant_message || '';
  const model = hookInput.stop_details?.model;
  const totalTokens = hookInput.stop_details?.total_tokens;
  const branch = hookInput.git_info?.branch;

  const lines: string[] = [
    `Status: ${reason}`,
    ...(model ? [`Model: ${model}`] : []),
    ...(totalTokens ? [`Tokens: ${totalTokens}`] : []),
    ...(branch ? [`Branch: ${branch}`] : []),
    '',
    ...(lastMessage ? ['Last Message:', truncateText(lastMessage, 500)] : ['No message']),
  ];

  return createNotification({
    agent: 'claude',
    kind: 'session_complete',
    title: title || 'Claude Session',
    lines,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project: title,
      reason,
      model,
      totalTokens,
    },
  });
}

/**
 * 创建会话错误的 Notification
 * 包含：Agent名称、会话标题、完整sessionId、错误内容
 */
export function createSessionErrorNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const title = getSessionTitle(hookInput);
  const errorMessage = hookInput.error || 'Unknown error';
  const branch = hookInput.git_info?.branch;

  const lines: string[] = [
    'Error occurred during session',
    ...(branch ? [`Branch: ${branch}`] : []),
    '',
    'Error Details:',
    truncateText(errorMessage, 800),
  ];

  return createNotification({
    agent: 'claude',
    kind: 'error',
    title: title || 'Claude Session Error',
    lines,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project: title,
      error: errorMessage,
    },
  });
}

/**
 * 创建权限请求的 Notification
 * 包含：Agent名称、会话标题、完整sessionId、权限请求详情
 */
export function createPermissionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const title = getSessionTitle(hookInput);
  const permissionTitle = hookInput.title || hookInput.permission?.title || 'Permission Required';
  const toolName = hookInput.tool_name || hookInput.tool || 'Unknown Tool';
  const toolInput = hookInput.tool_input
    ? truncateText(JSON.stringify(hookInput.tool_input), 300)
    : '';

  const lines: string[] = [
    `Permission: ${permissionTitle}`,
    `Tool: ${toolName}`,
    ...(toolInput ? [`Input: ${toolInput}`] : []),
  ];

  return createNotification({
    agent: 'claude',
    kind: 'permission',
    title: title || 'Claude Permission',
    lines,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project: title,
      permissionTitle,
      toolName,
    },
  });
}

/**
 * 创建用户提问的 Notification
 * 包含：Agent名称、会话标题、完整sessionId、问题内容
 */
export function createQuestionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const title = getSessionTitle(hookInput);
  const question = hookInput.prompt || hookInput.message || 'Waiting for input';
  const turnCount = hookInput.turn_count;

  const lines: string[] = [
    ...(turnCount ? [`Turn #${turnCount}`] : []),
    `Question: ${truncateText(question, 500)}`,
  ];

  return createNotification({
    agent: 'claude',
    kind: 'question',
    title: title || 'Claude Question',
    lines,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project: title,
      turnCount,
    },
  });
}

/**
 * Hook 响应类型
 */
export interface ApproveResponse {
  decision: 'approve';
  reason: string;
  systemMessage: string;
}

/**
 * 创建批准响应
 */
export function createApproveResponse(): ApproveResponse {
  return {
    decision: 'approve',
    reason: '',
    systemMessage: '',
  };
}
