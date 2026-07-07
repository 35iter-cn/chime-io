/**
 * Claude Code hooks - Core-neutral notification builders.
 *
 * These functions produce channel-neutral {@link Notification} objects.
 * They never emit HTML, Markdown, or channel-specific copy.
 */

import {
  block,
  createAgentRegistry,
  createNotification,
  createNotifier,
  type Block,
  type FieldEntry,
  type Notification,
  type StatEntry,
} from '@chime-io/core';
import { createTelegramChannel } from '@chime-io/channel-telegram';

import { claudeDescriptor } from './agent.js';

export { claudeDescriptor } from './agent.js';

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
 * Build a Claude notifier wired to the Telegram channel. The channel
 * receives a resolver so it can look up {@link claudeDescriptor} at
 * render time.
 */
export function createClaudeNotifier() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_USER_ID;

  if (!token || !userId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID');
  }

  const registry = createAgentRegistry([claudeDescriptor]);

  const channel = createTelegramChannel({
    token,
    userId,
    parseMode: 'HTML',
    silent: process.env.TELEGRAM_SILENT === '1',
    resolveAgent: (id) => registry.lookup(id),
  });

  return createNotifier({ channels: [channel] });
}

function truncateText(text: string, maxLength = 160): string {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatProjectName(cwd: string): string {
  if (!cwd) return '';
  const parts = cwd.split('/').filter(Boolean);
  return parts.at(-1) ?? cwd;
}

function getSessionId(hookInput: HookInput): string {
  return hookInput.session_id || hookInput.sessionID || 'unknown';
}

function getShortSessionId(hookInput: HookInput): string {
  return getSessionId(hookInput).slice(0, 8);
}

function getSessionTitle(hookInput: HookInput): string {
  return formatProjectName(hookInput.cwd || '');
}

function getSubject(hookInput: HookInput): string {
  return getSessionTitle(hookInput) || getShortSessionId(hookInput);
}

function buildContextFields(hookInput: HookInput): FieldEntry[] {
  const fields: FieldEntry[] = [];
  if (hookInput.cwd) fields.push({ label: 'cwd', value: hookInput.cwd });
  if (hookInput.git_info?.branch) {
    fields.push({ label: 'branch', value: hookInput.git_info.branch });
  }
  return fields;
}

/**
 * Whether a Stop hook should emit a notification.
 * User-initiated exits and interrupts are silenced.
 */
export function shouldNotifyStop(hookInput: HookInput): boolean {
  return hookInput.reason !== 'user_exit' && hookInput.reason !== 'interrupt';
}

export function createSessionCompletedNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const reason = hookInput.reason || 'completed';
  const lastMessage = hookInput.last_assistant_message || '';
  const model = hookInput.stop_details?.model;
  const totalTokens = hookInput.stop_details?.total_tokens;

  const stats: StatEntry[] = [{ label: 'status', value: reason }];
  if (model) stats.push({ label: 'model', value: model });
  if (typeof totalTokens === 'number') {
    stats.push({ label: 'tokens', value: totalTokens });
  }

  const fields = buildContextFields(hookInput);

  const blocks: Block[] = [block.stats(stats)];
  if (fields.length > 0) blocks.push(block.fields(fields));
  if (lastMessage) blocks.push(block.paragraph(truncateText(lastMessage)));

  return createNotification({
    agent: 'claude',
    kind: 'session_complete',
    intent: 'completion',
    severity: 'info',
    requiresAction: false,
    subject: getSubject(hookInput),
    blocks,
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

export function createSessionErrorNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const errorMessage = hookInput.error || 'Unknown error';
  const fields = buildContextFields(hookInput);

  const blocks: Block[] = [];
  if (fields.length > 0) blocks.push(block.fields(fields));
  blocks.push(block.code(truncateText(errorMessage)));

  return createNotification({
    agent: 'claude',
    kind: 'error',
    intent: 'error',
    severity: 'critical',
    requiresAction: true,
    subject: getSubject(hookInput),
    blocks,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      error: errorMessage,
    },
  });
}

export function createPermissionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const permissionTitle = hookInput.title || hookInput.permission?.title || '';
  const toolName =
    hookInput.tool_name || hookInput.tool || hookInput.tool_use?.name || '';
  const fields = buildContextFields(hookInput);
  if (toolName) fields.unshift({ label: 'tool', value: toolName });

  const blocks: Block[] = [];
  if (permissionTitle) {
    blocks.push(block.paragraph(truncateText(permissionTitle)));
  }
  if (fields.length > 0) blocks.push(block.fields(fields));

  return createNotification({
    agent: 'claude',
    kind: 'permission',
    intent: 'permission',
    severity: 'warning',
    requiresAction: true,
    subject: getSubject(hookInput),
    blocks,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      permissionTitle,
      toolName,
    },
  });
}

export function createQuestionNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const question = hookInput.prompt || hookInput.message || '';
  const fields = buildContextFields(hookInput);

  const blocks: Block[] = [];
  if (question) blocks.push(block.paragraph(truncateText(question)));
  if (fields.length > 0) blocks.push(block.fields(fields));

  return createNotification({
    agent: 'claude',
    kind: 'question',
    intent: 'question',
    severity: 'info',
    requiresAction: true,
    subject: getSubject(hookInput),
    blocks,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
    },
  });
}

export function createToolFailureNotification(
  hookInput: HookInput,
): Notification {
  const sessionId = getSessionId(hookInput);
  const project = getSessionTitle(hookInput);
  const toolName =
    hookInput.tool_name || hookInput.tool || hookInput.tool_use?.name || '';
  const errorMessage =
    hookInput.result?.error ||
    hookInput.error ||
    hookInput.result?.message ||
    '';
  const fields = buildContextFields(hookInput);
  if (toolName) fields.unshift({ label: 'tool', value: toolName });

  const blocks: Block[] = [];
  if (fields.length > 0) blocks.push(block.fields(fields));
  if (errorMessage) blocks.push(block.code(truncateText(errorMessage)));

  return createNotification({
    agent: 'claude',
    kind: 'tool_failure',
    intent: 'tool_failure',
    severity: 'warning',
    requiresAction: true,
    subject: getSubject(hookInput),
    blocks,
    metadata: {
      sessionId,
      fullSessionId: sessionId,
      project,
      toolName,
      error: errorMessage,
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

export function createApproveResponse(): ApproveResponse {
  return {
    decision: 'approve',
    reason: '',
    systemMessage: '',
  };
}
