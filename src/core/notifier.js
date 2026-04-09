function createNotifier({ channels }) {
  const resolvedChannels = Array.isArray(channels) ? channels.filter(Boolean) : [];

  return {
    async notify(notification) {
      for (const channel of resolvedChannels) {
        await channel.send(notification);
      }
    },
  };
}

module.exports = {
  createNotifier,
};
