import assert from 'node:assert/strict';
import test from 'node:test';

import {
  block,
  createAgentRegistry,
  createNotification,
  type AgentDescriptor,
  type NotificationInput,
} from '@chime-io/core';

import { createTelegramHtmlRenderer } from '../render.ts';

const claudeDescriptor: AgentDescriptor = {
  id: 'claude',
  displayName: 'Claude',
  defaultEmoji: '🤖',
};

const opencodeDescriptor: AgentDescriptor = {
  id: 'opencode',
  displayName: 'OpenCode',
  defaultEmoji: '🧑‍💻',
};

function resolverFor(...descriptors: AgentDescriptor[]) {
  const registry = createAgentRegistry(descriptors);
  return (id: string) => registry.lookup(id);
}

function build(overrides: Partial<NotificationInput> = {}) {
  const input: NotificationInput = {
    agent: 'opencode',
    kind: 'session.completed',
    intent: 'completion',
    severity: 'info',
    requiresAction: false,
    subject: 'feature-flow',
    ...overrides,
  };
  return createNotification(input);
}

test('renders completion intent with descriptor display name and emoji', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      blocks: [
        block.stats([
          { label: 'additions', value: 7 },
          { label: 'deletions', value: 1 },
          { label: 'files', value: 2 },
        ]),
        block.paragraph('任务已完成'),
      ],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /<b>✅ OpenCode · 会话完成<\/b>/);
  assert.match(result, /<b>feature-flow<\/b>/);
  assert.match(
    result,
    /<code>additions: 7 · deletions: 1 · files: 2<\/code>/,
  );
  assert.match(result, /任务已完成/);
});

test('renders error intent with code block from block content', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      kind: 'session.error',
      intent: 'error',
      severity: 'critical',
      requiresAction: true,
      blocks: [block.code('TypeError: Cannot read properties of undefined')],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /<b>🚨 OpenCode · 会话出错<\/b>/);
  assert.match(
    result,
    /<code>TypeError: Cannot read properties of undefined<\/code>/,
  );
});

test('renders question intent header and content', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      kind: 'interaction.question',
      intent: 'question',
      severity: 'info',
      requiresAction: true,
      subject: 'refactor-db',
      blocks: [block.paragraph('你希望使用哪种数据库？')],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /<b>❓ OpenCode · 等待回答<\/b>/);
  assert.match(result, /<b>refactor-db<\/b>/);
  assert.match(result, /你希望使用哪种数据库？/);
});

test('renders permission intent header and content', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      kind: 'interaction.permission',
      intent: 'permission',
      severity: 'warning',
      requiresAction: true,
      subject: 'refactor-db',
      blocks: [block.paragraph('edit src/index.ts')],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /<b>⚡ OpenCode · 操作待确认<\/b>/);
  assert.match(result, /edit src\/index\.ts/);
});

test('renders tool_failure intent with dedicated header', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      agent: 'claude',
      kind: 'tool_failure',
      intent: 'tool_failure',
      severity: 'warning',
      requiresAction: true,
      subject: 'telnotify',
      blocks: [
        block.fields([{ label: 'tool', value: 'Bash' }]),
        block.code('Command not found: invalid-command'),
      ],
    }),
    resolverFor(claudeDescriptor),
  );

  assert.match(result, /<b>🔧 Claude · 工具失败<\/b>/);
  assert.match(result, /<b>tool:<\/b> Bash/);
  assert.match(result, /<code>Command not found: invalid-command<\/code>/);
});

test('escapes HTML special characters in subject and blocks', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      subject: '<script>alert(1)</script>',
      intent: 'error',
      severity: 'critical',
      requiresAction: true,
      blocks: [block.paragraph('error <b>with</b> & ampersand')],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(result, /error &lt;b&gt;with&lt;\/b&gt; &amp; ampersand/);
  assert.doesNotMatch(result, /<script>/);
});

test('falls back to raw agent id when descriptor is missing', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({ agent: 'ghost', subject: 'unknown' }),
    () => undefined,
  );

  assert.match(result, /<b>✅ ghost · 会话完成<\/b>/);
});

test('renders list block as bullet lines', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    build({
      intent: 'permission',
      severity: 'warning',
      requiresAction: true,
      blocks: [block.list(['read /tmp/a', 'write /tmp/b'])],
    }),
    resolverFor(opencodeDescriptor),
  );

  assert.match(result, /• read \/tmp\/a\n• write \/tmp\/b/);
});
