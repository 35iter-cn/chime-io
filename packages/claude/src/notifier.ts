/**
 * Shared notification utilities for Claude Code hooks
 */

interface NotificationPayload {
  text: string;
}

interface HookInput {
  priority?: string;
  notification?: {
    priority?: string;
    title?: string;
    message?: string;
    type?: string;
  };
  notification_type?: string;
  reason?: string;
  prompt?: string;
  message?: string;
  tool_name?: string;
  tool?: string;
  hook_event_name?: string;
  last_assistant_message?: string;
  session_id?: string;
  sessionID?: string;
  stop_details?: {
    model?: string;
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  git_info?: {
    branch?: string;
    dirty?: boolean;
  };
  cwd?: string;
  permission_mode?: string;
  title?: string;
  permission?: {
    title?: string;
  };
  tool_input?: Record<string, unknown>;
  auto_mode_classification?: {
    risk_level?: string;
    confidence?: number;
  };
  turn_count?: number;
  total_tokens?: number;
  context_window_size?: number;
  is_slash_command?: boolean;
  command_name?: string;
  execution_time_ms?: number;
  error?: string;
  tool_error?: string;
  agent_type?: string;
}

/**
 * @returns {Promise<void>}
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_USER_ID;
  const parseMode = process.env.TELEGRAM_PARSE_MODE || 'HTML';

  if (!token || !userId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const body = {
    chat_id: userId,
    text: payload.text,
    parse_mode: parseMode,
    disable_notification: process.env.TELEGRAM_SILENT === '1',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

interface ApproveResponse {
  decision: 'approve';
  reason: string;
  systemMessage: string;
}

/**
 * @returns {ApproveResponse}
 */
export function createApproveResponse(): ApproveResponse {
  return {
    decision: 'approve',
    reason: '',
    systemMessage: '',
  };
}

/**
 * Escape HTML special characters for Telegram HTML parse mode
 * @returns {string}
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Truncate text to max length
 * @returns {string}
 */
export function truncateText(text: string, maxLength = 160): string {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

/**
 * @returns {string}
 */
export function capitalizeWord(value: string): string {
  if (!value) return '';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 * @returns {string}
 */
export function formatTokenCount(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return String(value);
}

/**
 * @returns {string}
 */
export function formatProjectName(cwd: string): string {
  if (!cwd) return '';
  const parts = String(cwd).split('/').filter(Boolean);
  return parts.at(-1) ?? String(cwd);
}

/**
 * @returns {string}
 */
export function stringifySummary(value: unknown, maxLength = 160): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return truncateText(value, maxLength);

  try {
    return truncateText(JSON.stringify(value), maxLength);
  } catch {
    return '';
  }
}

/**
 * @returns {string}
 */
export function formatPercent(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return `${Math.round(value)}%`;
}

/**
 * @returns {string}
 */
export function formatDurationMs(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

/**
 * @returns {string}
 */
export function formatDurationSeconds(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return `${Math.round(value)}s`;
}

/**
 * @returns {'low' | 'medium' | 'high'}
 */
export function getDetailLevel(): 'low' | 'medium' | 'high' {
  const value = String(process.env.CLAUDE_NOTIFY_DETAIL_LEVEL || 'medium').toLowerCase();
  return value === 'low' || value === 'high' ? value : 'medium';
}

/**
 * @returns {boolean}
 */
export function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return !['0', 'false', 'no'].includes(String(value).toLowerCase());
}

/**
 * @returns {boolean}
 */
export function shouldIncludeStats(): boolean {
  return getBooleanEnv('CLAUDE_NOTIFY_INCLUDE_STATS', true);
}

/**
 * @returns {boolean}
 */
export function shouldIncludeGit(): boolean {
  return getBooleanEnv('CLAUDE_NOTIFY_INCLUDE_GIT', true);
}

/**
 * @returns {boolean}
 */
export function isHighSignalText(text: string): boolean {
  if (!text) return false;
  return /issue|error|fail|warning|problem|fix|found|todo|blocked|问题|错误|失败|警告|阻塞|发现|修复/i.test(text);
}

/**
 * @returns {boolean}
 */
export function shouldNotifyNotification(hookInput: HookInput): boolean {
  const priority = hookInput.priority || hookInput.notification?.priority;
  return priority !== 'low' && priority !== 'info' && priority !== 'normal';
}

/**
 * @returns {boolean}
 */
export function shouldNotifyStop(hookInput: HookInput): boolean {
  return hookInput.reason !== 'user_exit' && hookInput.reason !== 'interrupt';
}

/**
 * @returns {boolean}
 */
export function shouldNotifyQuestion(hookInput: HookInput): boolean {
  const prompt = hookInput.prompt || hookInput.message || '';
  return /\?|什么时候|怎么样|为什么|如何|请问/.test(prompt);
}

/**
 * @returns {boolean}
 */
export function shouldNotifyToolFailure(hookInput: HookInput): boolean {
  const filter = process.env.CLAUDE_NOTIFY_TOOL_FILTER;
  const toolName = hookInput.tool_name || hookInput.tool || '';

  if (!filter) return true;

  try {
    return new RegExp(filter).test(String(toolName));
  } catch {
    return true;
  }
}

/**
 * @returns {boolean}
 */
export function shouldNotifySubagent(hookInput: HookInput): boolean {
  if (hookInput.hook_event_name === 'SubagentStart') return false;
  return isHighSignalText(hookInput.last_assistant_message || '');
}

/**
 * Format a notification for session completion
 * @returns {string}
 */
export function formatSessionCompleted(hookInput: HookInput): string {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const reason = hookInput.reason || 'completed';
  const model = hookInput.stop_details?.model;
  const totalTokens = formatTokenCount(hookInput.stop_details?.total_tokens || 0);
  const branch = hookInput.git_info?.branch;
  const dirty = hookInput.git_info?.dirty ? '*' : '';
  const project = formatProjectName(hookInput.cwd || '');
  const promptTokens = formatTokenCount(hookInput.stop_details?.prompt_tokens || 0);
  const completionTokens = formatTokenCount(hookInput.stop_details?.completion_tokens || 0);
  const includeStats = shouldIncludeStats();
  const includeGit = shouldIncludeGit();
  const detailLevel = getDetailLevel();
  const projectSummary = branch && includeGit
    ? `${project} (${branch}${dirty})`
    : project;

  return [
    '<b>Claude Code · Session Completed</b>',
    '',
    `Session: <code>${escapeHtml(shortId)}</code>`,
    `Status: ${escapeHtml(reason)}`,
    hookInput.permission_mode ? `Mode: ${escapeHtml(String(hookInput.permission_mode))}` : '',
    model ? `Model: ${escapeHtml(model)}` : '',
    includeStats && detailLevel === 'high' && promptTokens ? `Input tokens: ${escapeHtml(promptTokens)}` : '',
    includeStats && detailLevel === 'high' && completionTokens ? `Output tokens: ${escapeHtml(completionTokens)}` : '',
    includeStats && totalTokens ? `Tokens: ${escapeHtml(totalTokens)} total` : '',
    project ? `Project: ${escapeHtml(projectSummary)}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Format a notification for permission request
 * @returns {string}
 */
export function formatPermissionRequest(hookInput: HookInput): string {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const title = hookInput.title || hookInput.permission?.title || 'Action required';
  const toolName = hookInput.tool_name || hookInput.tool || 'Unknown';
  const toolInput = stringifySummary(hookInput.tool_input, 160);
  const riskLevel = hookInput.auto_mode_classification?.risk_level;
  const confidence = hookInput.auto_mode_classification?.confidence;
  const detailLevel = getDetailLevel();

  return [
    '<b>Claude Code · Permission Required</b>',
    '',
    `Session: <code>${escapeHtml(shortId)}</code>`,
    `Title: ${escapeHtml(truncateText(title, 200))}`,
    `Tool: ${escapeHtml(toolName)}`,
    detailLevel === 'high' && toolInput ? `Input: ${escapeHtml(toolInput)}` : '',
    riskLevel ? `Risk: ${escapeHtml(capitalizeWord(riskLevel))}` : '',
    typeof confidence === 'number' ? `Confidence: ${escapeHtml(String(confidence))}%` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Format a notification for general notification
 * @returns {string}
 */
export function formatNotification(hookInput: HookInput): string {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const priority = String(hookInput.priority || hookInput.notification?.priority || 'info').toUpperCase();
  const title = hookInput.title || hookInput.notification?.title;
  const message = hookInput.message || hookInput.notification?.message || 'New notification';
  const type = hookInput.notification_type || hookInput.notification?.type;

  return [
    `<b>Claude Code · Notification [${escapeHtml(priority)}]</b>`,
    '',
    `Session: <code>${escapeHtml(shortId)}</code>`,
    title ? `Title: ${escapeHtml(truncateText(title, 120))}` : '',
    `Message: ${escapeHtml(truncateText(message, 200))}`,
    type ? `Type: ${escapeHtml(type)}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Format a notification for user question
 * @returns {string}
 */
export function formatQuestion(hookInput: HookInput): string {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const prompt = hookInput.prompt || hookInput.message || 'Waiting for input';
  const usagePercent =
    typeof hookInput.total_tokens === 'number' && typeof hookInput.context_window_size === 'number' && hookInput.context_window_size > 0
      ? formatPercent((hookInput.total_tokens / hookInput.context_window_size) * 100)
      : '';
  const commandName = hookInput.is_slash_command ? hookInput.command_name || 'yes' : 'No';
  const project = formatProjectName(hookInput.cwd || '');
  const branch = hookInput.git_info?.branch;
  const projectSummary = branch && shouldIncludeGit()
    ? `${project} (${branch})`
    : project;

  return [
    '<b>Claude Code · User Prompt</b>',
    '',
    `Session: <code>${escapeHtml(shortId)}</code>`,
    typeof hookInput.turn_count === 'number' ? `Turn #${hookInput.turn_count}` : '',
    usagePercent ? `Context: ${escapeHtml(String(hookInput.total_tokens))} / ${escapeHtml(String(hookInput.context_window_size))} (${escapeHtml(usagePercent)})` : '',
    `Command: ${escapeHtml(String(commandName))}`,
    `Prompt: ${escapeHtml(truncateText(prompt, 200))}`,
    project ? `Project: ${escapeHtml(projectSummary)}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * @returns {string}
 */
export function formatToolFailure(hookInput: HookInput): string {
  const toolName = hookInput.tool_name || hookInput.tool || 'Unknown';
  const toolInput = getDetailLevel() === 'high' ? stringifySummary(hookInput.tool_input, 160) : '';
  const duration = formatDurationMs(hookInput.execution_time_ms || 0);
  const error = hookInput.error || hookInput.tool_error;

  return [
    '<b>Claude Code · Tool Failed</b>',
    '',
    `Tool: ${escapeHtml(String(toolName))}`,
    toolInput ? `Input: ${escapeHtml(toolInput)}` : '',
    error ? `Error: ${escapeHtml(truncateText(String(error), 200))}` : '',
    duration ? `Duration: ${escapeHtml(duration)}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * @returns {string}
 */
export function formatSubagentNotification(hookInput: HookInput): string {
  const summary = hookInput.last_assistant_message || '';

  return [
    '<b>Claude Code · Subagent Completed</b>',
    '',
    `Agent: ${escapeHtml(String(hookInput.agent_type || 'unknown'))}`,
    summary ? `Summary: ${escapeHtml(truncateText(String(summary), 200))}` : '',
  ].filter(Boolean).join('\n');
}
