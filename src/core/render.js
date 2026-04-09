function createMessageRenderer() {
  return (notification) => [notification.title, ...(notification.lines || [])].join('\n');
}

module.exports = {
  createMessageRenderer,
};
