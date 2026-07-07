import type {
  ChannelRenderer,
  NotificationChannel,
  ResolveAgent,
} from '@chime-io/core';

import { postJson, type JsonPost } from '../transport/https.js';
import { createTelegramHtmlRenderer } from '../render.js';

export interface TelegramSendResult {
  message_id: number;
}

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result: TelegramSendResult;
}

export interface CreateTelegramChannelOptions {
  token: string;
  userId: string;
  parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  silent?: boolean;
  /** Custom renderer. Defaults to the HTML channel renderer. */
  renderer?: ChannelRenderer<string>;
  /**
   * Resolves an agent id to its descriptor. Defaults to a resolver that
   * always returns `undefined`, in which case the renderer falls back to
   * the raw agent id.
   */
  resolveAgent?: ResolveAgent;
  post?: JsonPost;
}

const defaultResolveAgent: ResolveAgent = () => undefined;

export function createTelegramChannel({
  token,
  userId,
  parseMode = 'HTML',
  silent = false,
  renderer,
  resolveAgent = defaultResolveAgent,
  post = postJson,
}: CreateTelegramChannelOptions): NotificationChannel {
  if (!token) {
    throw new Error('Telegram bot token is required');
  }

  if (!userId) {
    throw new Error('Telegram user ID is required');
  }

  const renderMessage = renderer ?? createTelegramHtmlRenderer();

  return {
    id: 'telegram',
    async send(notification) {
      const text = renderMessage(notification, resolveAgent);
      const response = await post<TelegramApiResponse>({
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        body: {
          chat_id: userId,
          text,
          parse_mode: parseMode,
          disable_notification: silent,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Telegram API Error: ${response.description ?? 'Unknown error'}`,
        );
      }

      return response.result;
    },
  };
}
