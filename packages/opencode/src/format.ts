const MAX_RESULT_LENGTH = 160;

export interface SessionSummary {
  additions?: number;
  deletions?: number;
  files?: number;
}

export interface OpenCodeSession {
  id: string;
  title?: string;
  slug?: string;
  parentID?: string | null;
  summary?: SessionSummary;
}

export interface OpenCodeErrorLike {
  message?: string;
  name?: string;
  data?: {
    message?: string;
  };
}

export interface OpenCodeAssistantInfo {
  role?: string;
  error?: OpenCodeErrorLike | string;
}

export interface OpenCodeTextPart {
  type: 'text';
  text?: string;
}

export interface OpenCodeToolPart {
  type: 'tool';
  state?: {
    status?: string;
    title?: string;
    error?: OpenCodeErrorLike | string;
  };
}

export interface OpenCodePatchPart {
  type: 'patch';
  files?: string[];
}

export type OpenCodeMessagePart =
  | OpenCodeTextPart
  | OpenCodeToolPart
  | OpenCodePatchPart;

export interface OpenCodeConversationMessage {
  info?: OpenCodeAssistantInfo;
  parts?: OpenCodeMessagePart[];
}

export interface OpenCodeNotification {
  agent: 'opencode';
  kind: 'session.completed' | 'session.error' | 'interaction.question' | 'interaction.permission';
  title: string;
  lines: string[];
  metadata: { sessionId: string };
}

export interface OpenCodeEventFormatter {
  formatSessionCompleted(session: OpenCodeSession): Promise<OpenCodeNotification>;
  formatSessionError(session: OpenCodeSession, errorMessage?: string): Promise<OpenCodeNotification>;
  formatQuestion(session: OpenCodeSession, questionText?: string): OpenCodeNotification;
  formatPermission(session: OpenCodeSession, title?: string): OpenCodeNotification;
}

export interface CreateOpenCodeEventFormatterOptions {
  listMessages(sessionId: string): Promise<OpenCodeConversationMessage[]>;
}

function normalizeSummaryText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function truncateText(value: unknown, maxLength = MAX_RESULT_LENGTH): string {
  const normalized = normalizeSummaryText(value);
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function formatChangeSummary(session: Pick<OpenCodeSession, 'summary'>): string {
  if (!session.summary) return '';

  const { additions = 0, deletions = 0, files = 0 } = session.summary;
  const parts: string[] = [];

  if (additions > 0) parts.push(`+${additions}`);
  if (deletions > 0) parts.push(`-${deletions}`);
  if (files > 0) parts.push(`${files} file${files === 1 ? '' : 's'}`);

  return parts.join(' · ');
}

export function extractErrorMessage(error: OpenCodeErrorLike | string | null | undefined): string {
  if (!error) return '';
  if (typeof error === 'string') return truncateText(error);

  if (typeof error.data?.message === 'string' && error.data.message.trim()) {
    return truncateText(error.data.message);
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return truncateText(error.message);
  }

  if (typeof error.name === 'string' && error.name.trim()) {
    return truncateText(error.name);
  }

  return truncateText(String(error));
}

export function extractLastResultFromMessages(messages: OpenCodeConversationMessage[]): string {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const message = messages[messageIndex];
    if (message?.info?.role !== 'assistant') continue;

    const parts = Array.isArray(message.parts) ? message.parts : [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex];

      if (part?.type === 'text' && part.text) {
        const text = truncateText(part.text);
        if (text) return text;
      }

      if (
        part?.type === 'tool' &&
        part.state?.status === 'completed' &&
        part.state.title
      ) {
        return truncateText(`工具：${part.state.title}`);
      }

      if (
        part?.type === 'patch' &&
        Array.isArray(part.files) &&
        part.files.length > 0
      ) {
        const listedFiles = part.files.slice(0, 2).join(', ');
        const remainder = part.files.length > 2 ? ` 等${part.files.length}个文件` : '';
        return truncateText(`修改：${listedFiles}${remainder}`);
      }
    }
  }

  return '';
}

export function extractLastErrorFromMessages(messages: OpenCodeConversationMessage[]): string {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const message = messages[messageIndex];
    if (message?.info?.role !== 'assistant') continue;

    const assistantError = extractErrorMessage(message.info.error);
    if (assistantError) return assistantError;

    const parts = Array.isArray(message.parts) ? message.parts : [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex];

      if (part?.type === 'tool' && part.state?.status === 'error') {
        const toolError = extractErrorMessage(part.state.error);
        if (toolError) return toolError;
        if (part.state.title) return truncateText(`工具失败：${part.state.title}`);
      }
    }
  }

  return '';
}

function getShortSessionId(sessionId: string): string {
  return String(sessionId).slice(0, 8);
}

export function createOpenCodeEventFormatter({
  listMessages,
}: CreateOpenCodeEventFormatterOptions): OpenCodeEventFormatter {
  return {
    async formatSessionCompleted(session) {
      const messages = await listMessages(session.id);
      const changeSummary = formatChangeSummary(session);
      const lastResult = extractLastResultFromMessages(messages);

      return {
        agent: 'opencode',
        kind: 'session.completed',
        title: `OpenCode · ${session.title ?? session.slug ?? getShortSessionId(session.id)}`,
        lines: [
          changeSummary || `主会话已完成 · session ${getShortSessionId(session.id)}`,
          lastResult,
        ].filter((line): line is string => Boolean(line)),
        metadata: { sessionId: session.id },
      };
    },

    async formatSessionError(session, errorMessage) {
      const messages = await listMessages(session.id);
      const resolvedError = errorMessage || extractLastErrorFromMessages(messages);

      return {
        agent: 'opencode',
        kind: 'session.error',
        title: `OpenCode · ${session.title ?? session.slug ?? getShortSessionId(session.id)}`,
        lines: [`出错啦：${resolvedError || 'Unknown error'}`],
        metadata: { sessionId: session.id },
      };
    },

    formatQuestion(session, questionText) {
      return {
        agent: 'opencode',
        kind: 'interaction.question',
        title: `OpenCode · ${session.title ?? session.slug ?? getShortSessionId(session.id)}`,
        lines: [
          questionText
            ? `Agent 正在等你回答：${truncateText(questionText)}`
            : 'Agent 正在等你回答',
        ],
        metadata: { sessionId: session.id },
      };
    },

    formatPermission(session, title) {
      return {
        agent: 'opencode',
        kind: 'interaction.permission',
        title: `OpenCode · ${session.title ?? session.slug ?? getShortSessionId(session.id)}`,
        lines: [
          title
            ? `Agent 需要你的确认：${truncateText(title)}`
            : 'Agent 需要你的确认',
        ],
        metadata: { sessionId: session.id },
      };
    },
  };
}
