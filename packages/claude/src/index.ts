/**
 * Chime IO Notifier Plugin for Claude Code
 *
 * This plugin sends notifications to Telegram when Claude Code events occur:
 * - Session completed (Stop hook)
 * - Permission required (PermissionRequest hook)
 * - Important notifications (Notification hook)
 *
 * @module @chime-io/plugin-claude
 */

import type {
  EnvConfig,
  HookEventName,
  HookInput,
  HookOutput,
  PluginConfig,
  TelegramPayload,
} from './types.js';

export type {
  EnvConfig,
  HookEventName,
  HookInput,
  HookOutput,
  PluginConfig,
  TelegramPayload,
};

/** Plugin metadata */
export const PLUGIN_INFO = {
  id: 'chime-io-notifier',
  name: 'Chime IO Notifier',
  version: '1.0.0',
  description: 'Send notifications to Telegram when Claude Code sessions complete or need attention',
} as const;

/**
 * Get environment configuration
 * @returns Environment configuration for Telegram
 */
export function getEnvConfig(): EnvConfig {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    userId: process.env.TELEGRAM_USER_ID ?? '',
    parseMode: (process.env.TELEGRAM_PARSE_MODE as EnvConfig['parseMode']) ?? 'HTML',
    silent: process.env.TELEGRAM_SILENT === '1',
  };
}

/**
 * Validate environment configuration
 * @param config Environment configuration
 * @returns True if valid, false otherwise
 */
export function validateConfig(config: EnvConfig): boolean {
  return Boolean(config.token && config.userId);
}
