import type { AgentDescriptor } from '@chime-io/core';

/**
 * Descriptor used by channels to render OpenCode-branded notifications
 * without leaking OpenCode-specific copy into any channel package.
 */
export const opencodeDescriptor: AgentDescriptor = {
  id: 'opencode',
  displayName: 'OpenCode',
  defaultEmoji: '🧑‍💻',
  deepLinkTemplate: (metadata) => {
    const sessionId = metadata['sessionId'];
    return typeof sessionId === 'string' && sessionId.length > 0
      ? `opencode://session/${sessionId}`
      : undefined;
  },
};
