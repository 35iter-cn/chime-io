/**
 * Claude Code plugin types for Chime IO notifier
 */

/** Hook event names supported by Claude Code */
export type HookEventName =
  | 'SessionStart'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'UserPromptSubmit'
  | 'Notification'
  | 'PermissionRequest';

/** Hook input structure */
export interface HookInput {
  /** The hook event name */
  hook_event_name: HookEventName;
  /** Matcher pattern that triggered this hook */
  matcher: string;
  /** Session ID */
  session_id?: string;
  sessionID?: string;
  /** Reason for the event */
  reason?: string;
  /** Permission details */
  permission?: {
    id?: string;
    title?: string;
    description?: string;
  };
  /** Notification details */
  notification?: {
    message?: string;
    priority?: 'low' | 'normal' | 'high';
    type?: string;
  };
  /** User prompt */
  prompt?: string;
  message?: string;
  /** Tool information */
  tool?: string;
  tool_input?: Record<string, unknown>;
}

/** Hook output structure */
export interface HookOutput {
  /** Decision: 'approve', 'reject', or 'modify' */
  decision: 'approve' | 'reject' | 'modify';
  /** Reason for the decision */
  reason?: string;
  /** Modified content (if decision is 'modify') */
  systemMessage?: string;
  /** Modified tool input (for PreToolUse) */
  modified_tool_input?: Record<string, unknown>;
}

/** Plugin configuration */
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  minClaudeVersion: string;
  hooks: {
    configPath: string;
  };
}

/** Telegram notification payload */
export interface TelegramPayload {
  text: string;
}

/** Environment configuration */
export interface EnvConfig {
  token: string;
  userId: string;
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  silent: boolean;
}
