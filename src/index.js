const { createNotification } = require('./core/notification');
const { createNotifier } = require('./core/notifier');
const { createMessageRenderer } = require('./core/render');
const { createTelegramChannel } = require('./channels/telegram');
const { createOpenCodeNotifierPlugin } = require('./agents/opencode');

module.exports = {
  createMessageRenderer,
  createNotification,
  createNotifier,
  createOpenCodeNotifierPlugin,
  createTelegramChannel,
};
