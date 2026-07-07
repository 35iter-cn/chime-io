import assert from 'node:assert/strict';
import test from 'node:test';

import {
  block,
  createAgentRegistry,
  createNotification,
} from '@chime-io/core';

import { createTelegramChannel } from '../channels/telegram.ts';
import type { JsonPost, JsonPostRequest } from '../transport/https.ts';

test('createTelegramChannel validates token and userId', () => {
  assert.throws(
    () => createTelegramChannel({ token: '', userId: '42' }),
    /Telegram bot token is required/,
  );
  assert.throws(
    () => createTelegramChannel({ token: 'token', userId: '' }),
    /Telegram user ID is required/,
  );
});

test('createTelegramChannel sends HTML-rendered payload using descriptor', async () => {
  const calls: JsonPostRequest[] = [];
  const mockPost = (async (request: JsonPostRequest) => {
    calls.push(request);
    return { ok: true, result: { message_id: 99 } };
  }) as JsonPost;

  const registry = createAgentRegistry([
    { id: 'cli', displayName: 'CLI', defaultEmoji: '💬' },
  ]);

  const channel = createTelegramChannel({
    token: 'token',
    userId: '42',
    post: mockPost,
    resolveAgent: (id) => registry.lookup(id),
  });

  const result = await channel.send(
    createNotification({
      agent: 'cli',
      kind: 'manual.message',
      intent: 'completion',
      severity: 'info',
      requiresAction: false,
      subject: 'Hello',
      blocks: [block.paragraph('World')],
    }),
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.hostname, 'api.telegram.org');
  assert.equal(calls[0]!.path, '/bottoken/sendMessage');
  assert.equal(calls[0]!.body.chat_id, '42');
  assert.equal(calls[0]!.body.parse_mode, 'HTML');
  assert.equal(calls[0]!.body.disable_notification, false);
  const text = calls[0]!.body.text as string;
  assert.match(text, /<b>✅ CLI · 会话完成<\/b>/);
  assert.match(text, /<b>Hello<\/b>/);
  assert.match(text, /World/);
  assert.deepEqual(result, { message_id: 99 });
});

test('createTelegramChannel supports custom renderer override', async () => {
  const calls: JsonPostRequest[] = [];
  const mockPost = (async (request: JsonPostRequest) => {
    calls.push(request);
    return { ok: true, result: { message_id: 1 } };
  }) as JsonPost;

  const channel = createTelegramChannel({
    token: 'token',
    userId: '42',
    post: mockPost,
    renderer: () => 'plain text override',
  });

  await channel.send(
    createNotification({
      agent: 'cli',
      kind: 'manual.message',
      intent: 'completion',
      severity: 'info',
      requiresAction: false,
      subject: 'Hello',
    }),
  );

  assert.equal(calls[0]!.body.text, 'plain text override');
});

test('createTelegramChannel falls back gracefully with no resolver', async () => {
  const calls: JsonPostRequest[] = [];
  const mockPost = (async (request: JsonPostRequest) => {
    calls.push(request);
    return { ok: true, result: { message_id: 3 } };
  }) as JsonPost;

  const channel = createTelegramChannel({
    token: 'token',
    userId: '42',
    post: mockPost,
  });

  await channel.send(
    createNotification({
      agent: 'ghost',
      kind: 'noop',
      intent: 'completion',
      severity: 'info',
      requiresAction: false,
      subject: 'Hello',
    }),
  );

  const text = calls[0]!.body.text as string;
  assert.match(text, /ghost · 会话完成/);
});
