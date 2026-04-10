import { createNotifier, createLogger, createAgentLogger } from "@chime-io/core";
import { createTelegramChannel } from "@chime-io/channel-telegram";

import {
  createOpenCodeNotifierPlugin,
  type OpenCodeLogger,
  type OpenCodeClient,
} from "./notifier-plugin.js";

function createOpenCodeLogger(client: OpenCodeClient): OpenCodeLogger {
  const logFilePath = process.env.CHIME_LOG_FILE || "/tmp/chime-opencode.log";
  const timeZone = process.env.CHIME_LOG_TIMEZONE;

  const baseLogger = createLogger({
    logFilePath,
    timeZone,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxLines: 10000,
    maxBackups: 5,
    minLevel: "info",
  });

  const agentLogger = createAgentLogger(baseLogger, "opencode");

  return {
    async warn(message, extra) {
      await agentLogger.warn(message, extra);
      // 同时发送到 OpenCode 客户端日志（如果可用）
      if (client.app?.log) {
        await client.app.log({
          body: {
            service: "chime-opencode-plugin",
            level: "warn",
            message,
            ...(extra ? { extra } : {}),
          },
        });
      }
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
    logger: createOpenCodeLogger(client),
  });
}

export default OpenCodeTelegramPlugin;
