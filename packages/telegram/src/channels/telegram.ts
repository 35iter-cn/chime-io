import {
  type MessageRenderer,
  type NotificationChannel,
} from '@chime-io/core';

import { postJson, type JsonPost } from '../transport/https.js';
import { createTelegramHtmlRenderer, type HtmlRenderer } from '../render.js';

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
  /** 自定义渲染器。默认使用 Telegram HTML 富文本渲染器 */
  renderer?: MessageRenderer | HtmlRenderer;
  post?: JsonPost;
}

export function createTelegramChannel({
  token,
  userId,
  parseMode = 'HTML',
  silent = false,
  renderer,
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
      const text = renderMessage(notification);
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
        throw new Error(`Telegram API Error: ${response.description ?? 'Unknown error'}`);
      }

      return response.result;
    },
  };
}
