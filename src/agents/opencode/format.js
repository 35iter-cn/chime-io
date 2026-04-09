const MAX_RESULT_LENGTH = 160;

function normalizeSummaryText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncateText(value, maxLength = MAX_RESULT_LENGTH) {
  const normalized = normalizeSummaryText(value);
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatChangeSummary(session) {
  if (!session || !session.summary) return '';

  const { additions = 0, deletions = 0, files = 0 } = session.summary;
  const parts = [];

  if (additions > 0) parts.push(`+${additions}`);
  if (deletions > 0) parts.push(`-${deletions}`);
  if (files > 0) parts.push(`${files} file${files === 1 ? '' : 's'}`);

  return parts.join(' · ');
}

function extractErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return truncateText(error);

  const dataMessage = error && error.data && error.data.message;
  if (typeof dataMessage === 'string' && dataMessage.trim()) {
    return truncateText(dataMessage);
  }

  const directMessage = error && error.message;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return truncateText(directMessage);
  }

  const errorName = error && error.name;
  if (typeof errorName === 'string' && errorName.trim()) {
    return truncateText(errorName);
  }

  return truncateText(String(error));
}

function extractLastResultFromMessages(messages) {
  if (!Array.isArray(messages)) return '';

  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const message = messages[messageIndex];
    if (!message || !message.info || message.info.role !== 'assistant') continue;

    const parts = Array.isArray(message.parts) ? message.parts : [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex];

      if (part && part.type === 'text' && part.text) {
        const text = truncateText(part.text);
        if (text) return text;
      }

      if (part && part.type === 'tool' && part.state && part.state.status === 'completed' && part.state.title) {
        return truncateText(`工具：${part.state.title}`);
      }

      if (part && part.type === 'patch' && Array.isArray(part.files) && part.files.length > 0) {
        const listedFiles = part.files.slice(0, 2).join(', ');
        const remainder = part.files.length > 2 ? ` 等${part.files.length}个文件` : '';
        return truncateText(`修改：${listedFiles}${remainder}`);
      }
    }
  }

  return '';
}

function extractLastErrorFromMessages(messages) {
  if (!Array.isArray(messages)) return '';

  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const message = messages[messageIndex];
    if (!message || !message.info || message.info.role !== 'assistant') continue;

    const assistantError = extractErrorMessage(message.info.error);
    if (assistantError) return assistantError;

    const parts = Array.isArray(message.parts) ? message.parts : [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex];

      if (part && part.type === 'tool' && part.state && part.state.status === 'error') {
        const toolError = extractErrorMessage(part.state.error);
        if (toolError) return toolError;
        if (part.state.title) return truncateText(`工具失败：${part.state.title}`);
      }
    }
  }

  return '';
}

function getShortSessionId(sessionId) {
  return String(sessionId || '').slice(0, 8);
}

function createOpenCodeEventFormatter({ listMessages }) {
  return {
    async formatSessionCompleted(session) {
      const messages = await listMessages(session.id);
      const changeSummary = formatChangeSummary(session);
      const lastResult = extractLastResultFromMessages(messages);

      return {
        agent: 'opencode',
        kind: 'session.completed',
        title: `OpenCode · ${session.title || session.slug || getShortSessionId(session.id)}`,
        lines: [changeSummary || `主会话已完成 · session ${getShortSessionId(session.id)}`, lastResult].filter(Boolean),
        metadata: { sessionId: session.id },
      };
    },

    async formatSessionError(session, errorMessage) {
      const messages = await listMessages(session.id);
      const resolvedError = errorMessage || extractLastErrorFromMessages(messages);

      return {
        agent: 'opencode',
        kind: 'session.error',
        title: `OpenCode · ${session.title || session.slug || getShortSessionId(session.id)}`,
        lines: [`出错啦：${resolvedError || 'Unknown error'}`],
        metadata: { sessionId: session.id },
      };
    },

    formatQuestion(session, questionText) {
      return {
        agent: 'opencode',
        kind: 'interaction.question',
        title: `OpenCode · ${session.title || session.slug || getShortSessionId(session.id)}`,
        lines: [questionText ? `Agent 正在等你回答：${truncateText(questionText)}` : 'Agent 正在等你回答'],
        metadata: { sessionId: session.id },
      };
    },

    formatPermission(session, title) {
      return {
        agent: 'opencode',
        kind: 'interaction.permission',
        title: `OpenCode · ${session.title || session.slug || getShortSessionId(session.id)}`,
        lines: [title ? `Agent 需要你的确认：${truncateText(title)}` : 'Agent 需要你的确认'],
        metadata: { sessionId: session.id },
      };
    },
  };
}

module.exports = {
  createOpenCodeEventFormatter,
  extractErrorMessage,
  extractLastErrorFromMessages,
  extractLastResultFromMessages,
  formatChangeSummary,
  truncateText,
};
