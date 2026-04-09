function createNotification(input) {
  return {
    agent: input.agent,
    kind: input.kind,
    title: input.title,
    lines: Array.isArray(input.lines) ? input.lines.filter(Boolean) : [],
    metadata: input.metadata || {},
  };
}

module.exports = {
  createNotification,
};
