export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
  style?: 'normal' | 'muted';
}

export interface CodeBlock {
  type: 'code';
  content: string;
  language?: string;
}

export interface ListBlock {
  type: 'list';
  items: string[];
}

export interface FieldEntry {
  label: string;
  value: string;
  short?: boolean;
}

export interface FieldsBlock {
  type: 'fields';
  fields: FieldEntry[];
}

export interface StatEntry {
  label: string;
  value: string | number;
}

export interface StatsBlock {
  type: 'stats';
  stats: StatEntry[];
}

export type Block =
  | ParagraphBlock
  | CodeBlock
  | ListBlock
  | FieldsBlock
  | StatsBlock;

function makeParagraph(
  content: string,
  style?: ParagraphBlock['style'],
): ParagraphBlock {
  return style === undefined
    ? { type: 'paragraph', content }
    : { type: 'paragraph', content, style };
}

function makeCode(content: string, language?: string): CodeBlock {
  return language === undefined
    ? { type: 'code', content }
    : { type: 'code', content, language };
}

/**
 * Convenience factories for building channel-neutral notification blocks.
 */
export const block = {
  paragraph: (content: string, style?: ParagraphBlock['style']): ParagraphBlock =>
    makeParagraph(content, style),
  code: (content: string, language?: string): CodeBlock =>
    makeCode(content, language),
  list: (items: string[]): ListBlock => ({ type: 'list', items }),
  fields: (fields: FieldEntry[]): FieldsBlock => ({ type: 'fields', fields }),
  stats: (stats: StatEntry[]): StatsBlock => ({ type: 'stats', stats }),
};
