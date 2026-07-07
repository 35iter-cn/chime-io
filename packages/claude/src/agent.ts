import type { AgentDescriptor } from '@chime-io/core';

/**
 * Descriptor used by channels to render Claude-branded notifications
 * without leaking Claude-specific copy into any channel package.
 */
export const claudeDescriptor: AgentDescriptor = {
  id: 'claude',
  displayName: 'Claude',
  defaultEmoji: '🤖',
  deepLinkTemplate: (metadata) => {
    const sessionId = metadata['fullSessionId'];
    return typeof sessionId === 'string' && sessionId.length > 0
      ? `claude://session/${sessionId}`
      : undefined;
  },
};
