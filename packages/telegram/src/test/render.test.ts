import assert from 'node:assert/strict';
import test from 'node:test';

import { createNotification } from '@chime-io/core';

import { createTelegramHtmlRenderer } from '../render.ts';

test('createTelegramHtmlRenderer renders session.completed with emoji and code block', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'session.completed',
      title: 'OpenCode · feature-flow',
      lines: ['+7 · -1 · 2 files', '任务已完成'],
    }),
  );

  assert.match(result, /<b>✅ OpenCode · 会话完成<\/b>/);
  assert.match(result, /<b>feature-flow<\/b>/);
  assert.match(result, /<code>\+7 · -1 · 2 files<\/code>/);
  assert.match(result, /任务已完成/);
  assert.match(result, /<blockquote>无需立即处理/);
});

test('createTelegramHtmlRenderer renders session.error with error in code block', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'session.error',
      title: 'OpenCode · feature-flow',
      lines: ['TypeError: Cannot read properties of undefined'],
    }),
  );

  assert.match(result, /<b>🚨 OpenCode · 会话出错<\/b>/);
  assert.match(result, /<code>TypeError: Cannot read properties of undefined<\/code>/);
  assert.match(result, /<blockquote>建议立即检查/);
});

test('createTelegramHtmlRenderer renders interaction.question', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'interaction.question',
      title: 'OpenCode · refactor-db',
      lines: ['你希望使用哪种数据库？'],
    }),
  );

  assert.match(result, /<b>❓ OpenCode · 等待回答<\/b>/);
  assert.match(result, /<b>refactor-db<\/b>/);
  assert.match(result, /你希望使用哪种数据库？/);
  assert.match(result, /<blockquote>需要你回复后/);
});

test('createTelegramHtmlRenderer renders interaction.permission', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'interaction.permission',
      title: 'OpenCode · refactor-db',
      lines: ['edit src/index.ts'],
    }),
  );

  assert.match(result, /<b>⚡ OpenCode · 操作待确认<\/b>/);
  assert.match(result, /edit src\/index\.ts/);
  assert.match(result, /<blockquote>请回到 OpenCode/);
});

test('createTelegramHtmlRenderer escapes HTML special characters', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'session.error',
      title: 'OpenCode · <script>alert(1)</script>',
      lines: ['error <b>with</b> & ampersand'],
    }),
  );

  // title 中的 < > 应被转义
  assert.match(result, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  // lines 中的 < > & 应被转义
  assert.match(result, /error &lt;b&gt;with&lt;\/b&gt; &amp; ampersand/);
  // 不应出现未转义的 <script>
  assert.doesNotMatch(result, /<script>/);
});

test('createTelegramHtmlRenderer handles unknown kind with fallback', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'unknown.kind',
      title: 'OpenCode · test',
      lines: ['content'],
    }),
  );

  assert.match(result, /<b>📌 OpenCode · 通知<\/b>/);
});

test('createTelegramHtmlRenderer skips empty lines', () => {
  const renderer = createTelegramHtmlRenderer();
  const result = renderer(
    createNotification({
      agent: 'opencode',
      kind: 'interaction.question',
      title: 'OpenCode · test',
      lines: ['', 'actual content'],
    }),
  );

  assert.doesNotMatch(result, /\n\n\n/);
  assert.match(result, /actual content/);
});