import type { Notification } from '@chime-io/core';

/**
 * HTML 渲染器类型
 */
export type HtmlRenderer = (notification: Notification) => string;

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface KindConfig {
  emoji: string;
  label: string;
  hint: string;
}

const KIND_CONFIG: Record<string, KindConfig> = {
  'session.completed': {
    emoji: '✅',
    label: '会话完成',
    hint: '无需立即处理，可稍后查看',
  },
  'session.error': {
    emoji: '🚨',
    label: '会话出错',
    hint: '建议立即检查，可能需要人工干预',
  },
  'interaction.question': {
    emoji: '❓',
    label: '等待回答',
    hint: '需要你回复后 Agent 才能继续',
  },
  'interaction.permission': {
    emoji: '⚡',
    label: '操作待确认',
    hint: '请回到 OpenCode 确认或取消此操作',
  },
};

function getKindConfig(kind: string): KindConfig {
  return KIND_CONFIG[kind] ?? { emoji: '📌', label: '通知', hint: '' };
}

/**
 * 从 Notification.title 提取会话标题
 * title 格式为 "OpenCode · {sessionTitle}"
 */
function extractSessionTitle(title: string): string {
  const separator = ' · ';
  const index = title.indexOf(separator);
  if (index === -1) return title;
  return title.slice(index + separator.length);
}

/**
 * 创建 Telegram HTML 消息渲染器
 *
 * 输出格式：
 * - 通知气泡预览：纯文本摘要（Telegram 自动取首行）
 * - 展开后：HTML 富文本，含 emoji 图标、粗体标题、等宽代码、引用提示
 */
export function createTelegramHtmlRenderer(): HtmlRenderer {
  return (notification) => {
    const config = getKindConfig(notification.kind);
    const sessionTitle = escapeHtml(extractSessionTitle(notification.title));
    const lines = notification.lines.filter((line): line is string => Boolean(line));

    const parts: string[] = [];

    // 标题行：emoji + 粗体标签
    parts.push(`<b>${config.emoji} OpenCode · ${config.label}</b>`);
    parts.push('');
    parts.push(`<b>${sessionTitle}</b>`);

    // 内容行
    for (const line of lines) {
      const escaped = escapeHtml(line);
      // 变更摘要（+/-/files 模式）用等宽字体
      if (/^\+?\d*\s*·\s*-?\d*\s*·\s*\d+\s*files?/.test(line)) {
        parts.push(`<code>${escaped}</code>`);
      } else if (notification.kind === 'session.error') {
        parts.push(`<code>${escaped}</code>`);
      } else {
        parts.push(escaped);
      }
    }

    // 提示行
    if (config.hint) {
      parts.push('');
      parts.push(`<blockquote>${escapeHtml(config.hint)}</blockquote>`);
    }

    return parts.join('\n');
  };
}