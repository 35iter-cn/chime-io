import assert from 'node:assert/strict';
import test from 'node:test';

import { createNotification } from '@chime-io/core';

import { createTelegramChannel } from '../channels/telegram.ts';
import type { JsonPost, JsonPostRequest } from '../transport/https.ts';

test('createTelegramChannel validates token and userId', () => {
  assert.throws(() => createTelegramChannel({ token: '', userId: '42' }), /Telegram bot token is required/);
  assert.throws(() => createTelegramChannel({ token: 'token', userId: '' }), /Telegram user ID is required/);
});

test('createTelegramChannel sends HTML-rendered payload by default', async () => {
  const calls: Array<JsonPostRequest> = [];
  const mockPost = (async (request: JsonPostRequest) => {
    calls.push(request);
    return {
      ok: true,
      result: { message_id: 99 },
    };
  }) as JsonPost;
  const channel = createTelegramChannel({
    token: 'token',
    userId: '42',
    post: mockPost,
  });

  const result = await channel.send(
    createNotification({
      agent: 'cli',
      kind: 'manual.message',
      title: 'Hello',
      lines: ['World'],
    }),
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.hostname, 'api.telegram.org');
  assert.equal(calls[0]!.path, '/bottoken/sendMessage');
  assert.equal(calls[0]!.body.chat_id, '42');
  assert.equal(calls[0]!.body.parse_mode, 'HTML');
  assert.equal(calls[0]!.body.disable_notification, false);
  const text = calls[0]!.body.text as string;
  // 默认 HTML 渲染器对未知 kind 使用 📌 通知
  assert.match(text, /<b>📌 OpenCode · 通知<\/b>/);
  assert.match(text, /<b>Hello<\/b>/);
  assert.match(text, /World/);
  assert.deepEqual(result, { message_id: 99 });
});

test('createTelegramChannel supports custom renderer override', async () => {
  const calls: Array<JsonPostRequest> = [];
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
      title: 'Hello',
      lines: ['World'],
    }),
  );

  assert.equal(calls[0]!.body.text, 'plain text override');
});
