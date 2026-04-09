import { createNotifier } from "@telnotify/core";
import { createTelegramChannel } from "@telnotify/telegram";

import {
  createOpenCodeNotifierPlugin,
  type Logger,
  type OpenCodeClient,
} from "./notifier-plugin.js";

function createLogger(client: OpenCodeClient): Logger {
  return {
    async warn(message, extra) {
      if (!client.app?.log) return;
      await client.app.log({
        body: {
          service: "telnotify-opencode-plugin",
          level: "warn",
          message,
          ...(extra ? { extra } : {}),
        },
      });
    },
  };
}

export async function OpenCodeTelegramPlugin({
  client,
}: {
  client: OpenCodeClient;
}): Promise<ReturnType<typeof createOpenCodeNotifierPlugin>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_USER_ID;
  const parseMode =
    process.env.TELEGRAM_PARSE_MODE === "MarkdownV2"
      ? "MarkdownV2"
      : process.env.TELEGRAM_PARSE_MODE === "Markdown"
        ? "Markdown"
        : "HTML";
  const silent = process.env.TELEGRAM_SILENT === "1";

  const notifier = createNotifier({
    channels: [
      createTelegramChannel({
        token: token ?? "",
        userId: userId ?? "",
        parseMode,
        silent,
      }),
    ],
  });

  return createOpenCodeNotifierPlugin({
    client,
    notifier,
    logger: createLogger(client),
  });
}

export default OpenCodeTelegramPlugin;
