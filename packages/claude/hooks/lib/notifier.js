/**
 * Shared notification utilities for Claude Code hooks
 */

/**
 * @param {object} payload
 * @returns {Promise<void>}
 */
export async function sendNotification(payload) {
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

/**
 * Escape HTML special characters for Telegram HTML parse mode
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Truncate text to max length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 160) {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

/**
 * Format a notification for session completion
 * @param {object} hookInput
 * @returns {string}
 */
export function formatSessionCompleted(hookInput) {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const reason = hookInput.reason || 'completed';

  return `<b>Claude Code · Session Completed</b>\n\nSession: <code>${escapeHtml(shortId)}</code>\nStatus: ${escapeHtml(reason)}`;
}

/**
 * Format a notification for permission request
 * @param {object} hookInput
 * @returns {string}
 */
export function formatPermissionRequest(hookInput) {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const title = hookInput.title || hookInput.permission?.title || 'Action required';

  return `<b>Claude Code · Permission Required</b>\n\nSession: <code>${escapeHtml(shortId)}</code>\n\n${escapeHtml(truncateText(title, 200))}`;
}

/**
 * Format a notification for general notification
 * @param {object} hookInput
 * @returns {string}
 */
export function formatNotification(hookInput) {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const message = hookInput.message || hookInput.notification?.message || 'New notification';

  return `<b>Claude Code · Notification</b>\n\nSession: <code>${escapeHtml(shortId)}</code>\n\n${escapeHtml(truncateText(message, 200))}`;
}

/**
 * Format a notification for user question
 * @param {object} hookInput
 * @returns {string}
 */
export function formatQuestion(hookInput) {
  const sessionId = hookInput.session_id || hookInput.sessionID || 'unknown';
  const shortId = String(sessionId).slice(0, 8);
  const prompt = hookInput.prompt || hookInput.message || 'Waiting for input';

  return `<b>Claude Code · Waiting for Input</b>\n\nSession: <code>${escapeHtml(shortId)}</code>\n\n${escapeHtml(truncateText(prompt, 200))}`;
}
