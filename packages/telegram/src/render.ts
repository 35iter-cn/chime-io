import type {
  Block,
  ChannelRenderer,
  Intent,
} from '@chime-io/core';

/**
 * Escape HTML special characters for Telegram HTML parse mode.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface IntentConfig {
  emoji: string;
  label: string;
}

const INTENT_CONFIG: Record<Intent, IntentConfig> = {
  completion: {
    emoji: '✅',
    label: '会话完成',
  },
  error: {
    emoji: '🚨',
    label: '会话出错',
  },
  question: {
    emoji: '❓',
    label: '等待回答',
  },
  permission: {
    emoji: '⚡',
    label: '操作待确认',
  },
  tool_failure: {
    emoji: '🔧',
    label: '工具失败',
  },
};

const FALLBACK_INTENT_CONFIG: IntentConfig = {
  emoji: '📌',
  label: '通知',
};

function getIntentConfig(intent: Intent): IntentConfig {
  return INTENT_CONFIG[intent] ?? FALLBACK_INTENT_CONFIG;
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'paragraph': {
      const content = escapeHtml(block.content);
      return block.style === 'muted' ? `<i>${content}</i>` : content;
    }
    case 'code': {
      return `<code>${escapeHtml(block.content)}</code>`;
    }
    case 'list': {
      return block.items
        .map((item) => `• ${escapeHtml(item)}`)
        .join('\n');
    }
    case 'fields': {
      return block.fields
        .map(
          (field) =>
            `<b>${escapeHtml(field.label)}:</b> ${escapeHtml(field.value)}`,
        )
        .join('\n');
    }
    case 'stats': {
      const inline = block.stats
        .map(
          (stat) =>
            `${escapeHtml(stat.label)}: ${escapeHtml(String(stat.value))}`,
        )
        .join(' · ');
      return `<code>${inline}</code>`;
    }
  }
}

/**
 * Create a Telegram HTML {@link ChannelRenderer}.
 *
 * The renderer composes the header (emoji + agent display name + intent label)
 * from the resolved {@link AgentDescriptor} plus the notification's `intent`,
 * then serializes each channel-neutral block into Telegram HTML.
 */
export function createTelegramHtmlRenderer(): ChannelRenderer<string> {
  return (notification, resolveAgent) => {
    const descriptor = resolveAgent(notification.agent);
    const displayName = descriptor?.displayName ?? notification.agent;
    const config = getIntentConfig(notification.intent);
    const emoji = config === FALLBACK_INTENT_CONFIG
      ? descriptor?.defaultEmoji ?? config.emoji
      : config.emoji;

    const parts: string[] = [];
    parts.push(
      `<b>${emoji} ${escapeHtml(displayName)} · ${escapeHtml(config.label)}</b>`,
    );
    parts.push('');

    if (notification.subject) {
      parts.push(`<b>${escapeHtml(notification.subject)}</b>`);
    }

    for (const block of notification.blocks) {
      parts.push(renderBlock(block));
    }

    return parts.join('\n');
  };
}
