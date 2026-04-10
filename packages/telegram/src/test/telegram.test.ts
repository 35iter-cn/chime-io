import assert from 'node:assert/strict';
import test from 'node:test';

import { createNotification } from '@chime-io/core';

import { createTelegramChannel } from '../../dist/index.cjs';

test('createTelegramChannel validates token and userId', () => {
  assert.throws(() => createTelegramChannel({ token: '', userId: '42' }), /Telegram bot token is required/);
  assert.throws(() => createTelegramChannel({ token: 'token', userId: '' }), /Telegram user ID is required/);
});

test('createTelegramChannel sends rendered payload', async () => {
  const calls: Array<Record<string, unknown>> = [];
  const channel = createTelegramChannel({
    token: 'token',
    userId: '42',
    post: async (request) => {
      calls.push(request as Record<string, unknown>);
      return {
        ok: true,
        result: { message_id: 99 },
      };
    },
  });

  const result = await channel.send(
    createNotification({
      agent: 'cli',
      kind: 'manual.message',
      title: 'Hello',
      lines: ['World'],
    }),
  );

  assert.deepEqual(calls, [
    {
      hostname: 'api.telegram.org',
      path: '/bottoken/sendMessage',
      body: {
        chat_id: '42',
        text: 'Hello\nWorld',
        parse_mode: 'HTML',
        disable_notification: false,
      },
    },
  ]);
  assert.deepEqual(result, { message_id: 99 });
});
