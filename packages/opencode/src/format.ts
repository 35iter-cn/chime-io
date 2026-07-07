import {
  block,
  createNotification,
  type Block,
  type FieldEntry,
  type Notification,
  type StatEntry,
} from '@chime-io/core';

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

export interface OpenCodeEventFormatter {
  formatSessionCompleted(session: OpenCodeSession): Promise<Notification>;
  formatSessionError(
    session: OpenCodeSession,
    errorMessage?: string,
  ): Promise<Notification>;
  formatQuestion(session: OpenCodeSession, questionText?: string): Notification;
  formatPermission(session: OpenCodeSession, title?: string): Notification;
}

export interface CreateOpenCodeEventFormatterOptions {
  listMessages(sessionId: string): Promise<OpenCodeConversationMessage[]>;
}

function normalizeSummaryText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(value: unknown, maxLength = MAX_RESULT_LENGTH): string {
  const normalized = normalizeSummaryText(value);
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function buildChangeStats(
  session: Pick<OpenCodeSession, 'summary'>,
): StatEntry[] {
  if (!session.summary) return [];

  const { additions = 0, deletions = 0, files = 0 } = session.summary;
  const stats: StatEntry[] = [];
  if (additions > 0) stats.push({ label: 'additions', value: additions });
  if (deletions > 0) stats.push({ label: 'deletions', value: deletions });
  if (files > 0) stats.push({ label: 'files', value: files });

  return stats;
}

export function extractErrorMessage(
  error: OpenCodeErrorLike | string | null | undefined,
): string {
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

export function extractLastResultFromMessages(
  messages: OpenCodeConversationMessage[],
): string {
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
        const remainder =
          part.files.length > 2 ? ` 等${part.files.length}个文件` : '';
        return truncateText(`修改：${listedFiles}${remainder}`);
      }
    }
  }

  return '';
}

export function extractLastErrorFromMessages(
  messages: OpenCodeConversationMessage[],
): string {
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

function getSubject(session: OpenCodeSession): string {
  return session.title ?? session.slug ?? getShortSessionId(session.id);
}

function buildSessionFields(session: OpenCodeSession): FieldEntry[] {
  const fields: FieldEntry[] = [];
  if (session.slug) fields.push({ label: 'slug', value: session.slug });
  if (session.parentID) fields.push({ label: 'parent', value: session.parentID });
  return fields;
}

export function createOpenCodeEventFormatter({
  listMessages,
}: CreateOpenCodeEventFormatterOptions): OpenCodeEventFormatter {
  return {
    async formatSessionCompleted(session) {
      const messages = await listMessages(session.id);
      const stats = buildChangeStats(session);
      const fields = buildSessionFields(session);
      const lastResult = extractLastResultFromMessages(messages);

      const blocks: Block[] = [];
      if (stats.length > 0) blocks.push(block.stats(stats));
      if (fields.length > 0) blocks.push(block.fields(fields));
      if (lastResult) {
        blocks.push(block.paragraph(lastResult));
      } else if (stats.length === 0) {
        blocks.push(
          block.paragraph(
            `主会话已完成 · session ${getShortSessionId(session.id)}`,
          ),
        );
      }

      return createNotification({
        agent: 'opencode',
        kind: 'session.completed',
        intent: 'completion',
        severity: 'info',
        requiresAction: false,
        subject: getSubject(session),
        blocks,
        metadata: { sessionId: session.id },
      });
    },

    async formatSessionError(session, errorMessage) {
      const messages = await listMessages(session.id);
      const resolvedError =
        errorMessage || extractLastErrorFromMessages(messages) || 'Unknown error';
      const fields = buildSessionFields(session);

      const blocks: Block[] = [];
      if (fields.length > 0) blocks.push(block.fields(fields));
      blocks.push(block.code(resolvedError));

      return createNotification({
        agent: 'opencode',
        kind: 'session.error',
        intent: 'error',
        severity: 'critical',
        requiresAction: true,
        subject: getSubject(session),
        blocks,
        metadata: { sessionId: session.id, error: resolvedError },
      });
    },

    formatQuestion(session, questionText) {
      const question = questionText ? truncateText(questionText) : '';
      const blocks: Block[] = [];
      if (question) blocks.push(block.paragraph(question));

      return createNotification({
        agent: 'opencode',
        kind: 'interaction.question',
        intent: 'question',
        severity: 'info',
        requiresAction: true,
        subject: getSubject(session),
        blocks,
        metadata: { sessionId: session.id },
      });
    },

    formatPermission(session, title) {
      const permissionTitle = title ? truncateText(title) : '';
      const blocks: Block[] = [];
      if (permissionTitle) blocks.push(block.paragraph(permissionTitle));

      return createNotification({
        agent: 'opencode',
        kind: 'interaction.permission',
        intent: 'permission',
        severity: 'warning',
        requiresAction: true,
        subject: getSubject(session),
        blocks,
        metadata: { sessionId: session.id, permissionTitle },
      });
    },
  };
}
