const { postJson } = require('../transport/https');
const { createMessageRenderer } = require('../core/render');

function createTelegramChannel({ token, userId, parseMode = 'HTML', silent = false, renderer }) {
  if (!token) {
    throw new Error('Telegram bot token is required');
  }

  if (!userId) {
    throw new Error('Telegram user ID is required');
  }

  const renderMessage = renderer || createMessageRenderer();

  return {
    id: 'telegram',
    async send(notification) {
      const response = await postJson({
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        body: {
          chat_id: userId,
          text: renderMessage(notification),
          parse_mode: parseMode,
          disable_notification: silent,
        },
      });

      if (!response.ok) {
        throw new Error(`Telegram API Error: ${response.description}`);
      }

      return response.result;
    },
  };
}

module.exports = {
  createTelegramChannel,
};
