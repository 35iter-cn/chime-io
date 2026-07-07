import type { Block } from './blocks.js';

export type Intent =
  | 'completion'
  | 'error'
  | 'question'
  | 'permission'
  | 'tool_failure';

export type Severity = 'info' | 'warning' | 'critical';

export interface Notification {
  agent: string;
  kind: string;
  intent: Intent;
  severity: Severity;
  requiresAction: boolean;
  subject: string;
  deepLink?: string;
  blocks: Block[];
  metadata: Record<string, unknown>;
}

export interface NotificationInput {
  agent: string;
  kind: string;
  intent: Intent;
  severity: Severity;
  requiresAction: boolean;
  subject: string;
  deepLink?: string;
  blocks?: Block[];
  metadata?: Record<string, unknown>;
}

const VALID_INTENTS = new Set<Intent>([
  'completion',
  'error',
  'question',
  'permission',
  'tool_failure',
]);

const VALID_SEVERITIES = new Set<Severity>(['info', 'warning', 'critical']);

const VALID_BLOCK_TYPES: ReadonlySet<Block['type']> = new Set<Block['type']>([
  'paragraph',
  'code',
  'list',
  'fields',
  'stats',
]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeBlock(input: Block): Block | null {
  if (!input || typeof input !== 'object') return null;
  if (!VALID_BLOCK_TYPES.has(input.type)) return null;

  switch (input.type) {
    case 'paragraph': {
      const content = typeof input.content === 'string' ? input.content.trim() : '';
      if (!content) return null;
      return input.style === undefined
        ? { type: 'paragraph', content }
        : { type: 'paragraph', content, style: input.style };
    }
    case 'code': {
      const content = typeof input.content === 'string' ? input.content : '';
      if (!content.trim()) return null;
      return input.language === undefined
        ? { type: 'code', content }
        : { type: 'code', content, language: input.language };
    }
    case 'list': {
      const items = Array.isArray(input.items)
        ? input.items.filter(isNonEmptyString).map((item) => item.trim())
        : [];
      if (items.length === 0) return null;
      return { type: 'list', items };
    }
    case 'fields': {
      const fields = Array.isArray(input.fields)
        ? input.fields.filter(
            (field) =>
              field &&
              typeof field.label === 'string' &&
              field.label.trim().length > 0 &&
              typeof field.value === 'string' &&
              field.value.trim().length > 0,
          )
        : [];
      if (fields.length === 0) return null;
      return { type: 'fields', fields };
    }
    case 'stats': {
      const stats = Array.isArray(input.stats)
        ? input.stats.filter(
            (stat) =>
              stat &&
              typeof stat.label === 'string' &&
              stat.label.trim().length > 0 &&
              (typeof stat.value === 'string' || typeof stat.value === 'number'),
          )
        : [];
      if (stats.length === 0) return null;
      return { type: 'stats', stats };
    }
  }
}

/**
 * Build a validated {@link Notification} from input.
 *
 * - Rejects unknown `intent` or `severity` values.
 * - Drops unknown block types and blocks that reduce to empty content.
 * - Trims `subject`.
 */
export function createNotification(input: NotificationInput): Notification {
  if (!VALID_INTENTS.has(input.intent)) {
    throw new Error(`Invalid notification intent: ${String(input.intent)}`);
  }
  if (!VALID_SEVERITIES.has(input.severity)) {
    throw new Error(`Invalid notification severity: ${String(input.severity)}`);
  }

  const blocks = Array.isArray(input.blocks)
    ? input.blocks
        .map((entry) => normalizeBlock(entry))
        .filter((entry): entry is Block => entry !== null)
    : [];

  const notification: Notification = {
    agent: input.agent,
    kind: input.kind,
    intent: input.intent,
    severity: input.severity,
    requiresAction: Boolean(input.requiresAction),
    subject: typeof input.subject === 'string' ? input.subject.trim() : '',
    blocks,
    metadata: input.metadata ?? {},
  };

  if (typeof input.deepLink === 'string' && input.deepLink.trim().length > 0) {
    notification.deepLink = input.deepLink;
  }

  return notification;
}
