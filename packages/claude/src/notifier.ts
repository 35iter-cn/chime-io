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
  tool_use?: {
    name?: string;
    input?: Record<string, unknown>;
  };
  result?: {
    error?: string;
    message?: string;
  };
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
function truncateText(text: string, maxLength = 160): string {
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
 * 获取短 session ID（前8位）
 */
function getShortSessionId(hookInput: HookInput): string {
  return getSessionId(hookInput).slice(0, 8);
}

/**
 * 构建上下文信息（工作路径 + 分支）
 */
function buildContextInfo(hookInput: HookInput): string {
  const parts: string[] = [];
  
  if (hookInput.cwd) {
    parts.push(`📁 ${hookInput.cwd}`);
  }
  
  if (hookInput.git_info?.branch) {
    parts.push(`🌿 ${hookInput.git_info.branch}`);
  }
  
  return parts.join(' · ');
}

/**
 * 检查是否应该通知 stop 事件
 */
export function shouldNotifyStop(hookInput: HookInput): boolean {
  return hookInput.reason !== 'user_exit' && hookInput.reason !== 'interrupt';
}

/**
 * 创建会话完成的 Notification
 * 格式：包含上下文信息（路径、分支）
 */
export function createSessionCompletedNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const reason = hookInput.reason || 'completed';
  const lastMessage = hookInput.last_assistant_message || '';
  const model = hookInput.stop_details?.model;
  const totalTokens = hookInput.stop_details?.total_tokens;

  // 构建状态摘要
  const parts: string[] = [];
  parts.push(reason);
  if (model) parts.push(model);
  if (totalTokens) parts.push(`${totalTokens} tokens`);

  const summary = parts.join(' · ');
  const contextInfo = buildContextInfo(hookInput);

  return createNotification({
    agent: 'claude',
    kind: 'session_complete',
    title: `Claude · ${project || getShortSessionId(hookInput)}`,
    lines: [
      summary,
      ...(contextInfo ? [contextInfo] : []),
      ...(lastMessage ? [truncateText(lastMessage)] : []),
    ],
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      reason,
      model,
      totalTokens,
    },
  });
}

/**
 * 创建会话失败的 Notification
 * 格式：包含上下文信息（路径、分支）
 */
export function createSessionErrorNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const errorMessage = hookInput.error || 'Unknown error';
  const contextInfo = buildContextInfo(hookInput);

  return createNotification({
    agent: 'claude',
    kind: 'error',
    title: `Claude · ${project || getShortSessionId(hookInput)}`,
    lines: [
      `❌ 出错啦：${truncateText(errorMessage)}`,
      ...(contextInfo ? [contextInfo] : []),
    ],
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      error: errorMessage,
    },
  });
}

/**
 * 创建权限请求的 Notification
 * 格式：包含上下文信息（路径、分支）
 */
export function createPermissionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const permissionTitle = hookInput.title || hookInput.permission?.title || '';
  const contextInfo = buildContextInfo(hookInput);

  return createNotification({
    agent: 'claude',
    kind: 'permission',
    title: `Claude · ${project || getShortSessionId(hookInput)}`,
    lines: [
      permissionTitle
        ? `🔒 Agent 需要你的确认：${truncateText(permissionTitle)}`
        : '🔒 Agent 需要你的确认',
      ...(contextInfo ? [contextInfo] : []),
    ],
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      permissionTitle,
    },
  });
}

/**
 * 创建用户提问的 Notification
 * 格式：包含上下文信息（路径、分支）
 */
export function createQuestionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const question = hookInput.prompt || hookInput.message || '';
  const contextInfo = buildContextInfo(hookInput);

  return createNotification({
    agent: 'claude',
    kind: 'question',
    title: `Claude · ${project || getShortSessionId(hookInput)}`,
    lines: [
      question
        ? `💬 Agent 正在等你回答：${truncateText(question)}`
        : '💬 Agent 正在等你回答',
      ...(contextInfo ? [contextInfo] : []),
    ],
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
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

/**
 * 创建工具执行失败的 Notification
 * 格式：包含上下文信息（路径、分支）
 */
export function createToolFailureNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const toolName = hookInput.tool_name ||
    hookInput.tool ||
    hookInput.tool_use?.name ||
    '';
  const errorMessage = hookInput.result?.error ||
    hookInput.error ||
    hookInput.result?.message ||
    '';
  const contextInfo = buildContextInfo(hookInput);

  const lines: string[] = [];
  if (toolName && errorMessage) {
    lines.push(`🔧 工具 ${toolName} 失败：${truncateText(errorMessage)}`);
  } else if (toolName) {
    lines.push(`🔧 工具 ${toolName} 执行失败`);
  } else if (errorMessage) {
    lines.push(`❌ 执行失败：${truncateText(errorMessage)}`);
  } else {
    lines.push('❌ 工具执行失败');
  }
  
  if (contextInfo) {
    lines.push(contextInfo);
  }

  return createNotification({
    agent: 'claude',
    kind: 'tool_failure',
    title: `Claude · ${project || getShortSessionId(hookInput)}`,
    lines,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      toolName,
      error: errorMessage,
    },
  });
}