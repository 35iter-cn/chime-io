import telnotify from '../src/index.js';

const { createNotifier, createOpenCodeNotifierPlugin, createTelegramChannel } = telnotify;

function createLogger(client) {
  return {
    async warn(message, extra) {
      if (!client.app || !client.app.log) return;
      await client.app.log({
        body: {
          service: 'telnotify-opencode-plugin',
          level: 'warn',
          message,
          extra,
        },
      });
    },
  };
}

export const OpenCodeTelegramPlugin = async ({ client }) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_USER_ID;
  const parseMode = process.env.TELEGRAM_PARSE_MODE || 'HTML';
  const silent = process.env.TELEGRAM_SILENT === '1';

  const notifier = createNotifier({
    channels: [
      createTelegramChannel({
        token,
        userId,
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
};
