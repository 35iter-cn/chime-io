import assert from 'node:assert/strict';
import test from 'node:test';

import {
  block,
  createAgentRegistry,
  createNotification,
  createNotifier,
  type Block,
  type Notification,
} from '../index.ts';

function baseInput(overrides: Partial<Parameters<typeof createNotification>[0]> = {}) {
  return {
    agent: 'claude',
    kind: 'session_complete',
    intent: 'completion' as const,
    severity: 'info' as const,
    requiresAction: false,
    subject: 'demo',
    ...overrides,
  };
}

test('createNotification requires a known intent', () => {
  assert.throws(
    () =>
      createNotification({
        ...baseInput(),
        intent: 'unknown' as unknown as 'completion',
      }),
    /Invalid notification intent/,
  );
});

test('createNotification requires a known severity', () => {
  assert.throws(
    () =>
      createNotification({
        ...baseInput(),
        severity: 'urgent' as unknown as 'info',
      }),
    /Invalid notification severity/,
  );
});

test('createNotification trims subject and defaults blocks/metadata', () => {
  const notification = createNotification({
    ...baseInput(),
    subject: '   feature-flow   ',
  });

  assert.equal(notification.subject, 'feature-flow');
  assert.deepEqual(notification.blocks, []);
  assert.deepEqual(notification.metadata, {});
  assert.equal(notification.requiresAction, false);
  assert.equal('deepLink' in notification, false);
});

test('createNotification drops empty and unknown blocks', () => {
  const notification = createNotification({
    ...baseInput(),
    blocks: [
      block.paragraph('   '),
      block.paragraph('hello world'),
      block.code('   '),
      block.code('throw new Error()'),
      block.list(['', '  ', 'kept']),
      block.fields([{ label: '', value: 'ignored' }, { label: 'cwd', value: '/tmp' }]),
      block.stats([]),
      { type: 'unknown', content: 'x' } as unknown as Block,
    ],
  });

  assert.deepEqual(notification.blocks, [
    { type: 'paragraph', content: 'hello world' },
    { type: 'code', content: 'throw new Error()' },
    { type: 'list', items: ['kept'] },
    { type: 'fields', fields: [{ label: 'cwd', value: '/tmp' }] },
  ]);
});

test('createNotification keeps deepLink and metadata when provided', () => {
  const notification = createNotification({
    ...baseInput(),
    deepLink: 'claude://session/abc',
    metadata: { fullSessionId: 'abc' },
  });

  assert.equal(notification.deepLink, 'claude://session/abc');
  assert.deepEqual(notification.metadata, { fullSessionId: 'abc' });
});

test('block helpers produce expected shapes', () => {
  assert.deepEqual(block.paragraph('hi'), { type: 'paragraph', content: 'hi' });
  assert.deepEqual(block.paragraph('hi', 'muted'), {
    type: 'paragraph',
    content: 'hi',
    style: 'muted',
  });
  assert.deepEqual(block.code('code'), { type: 'code', content: 'code' });
  assert.deepEqual(block.code('code', 'ts'), {
    type: 'code',
    content: 'code',
    language: 'ts',
  });
  assert.deepEqual(block.list(['a', 'b']), { type: 'list', items: ['a', 'b'] });
  assert.deepEqual(
    block.fields([{ label: 'k', value: 'v' }]),
    { type: 'fields', fields: [{ label: 'k', value: 'v' }] },
  );
  assert.deepEqual(
    block.stats([{ label: 'tokens', value: 100 }]),
    { type: 'stats', stats: [{ label: 'tokens', value: 100 }] },
  );
});

test('createAgentRegistry looks up registered descriptors', () => {
  const registry = createAgentRegistry([
    { id: 'claude', displayName: 'Claude', defaultEmoji: '🤖' },
  ]);

  registry.register({ id: 'opencode', displayName: 'OpenCode', defaultEmoji: '🧑‍💻' });

  assert.equal(registry.lookup('claude')?.displayName, 'Claude');
  assert.equal(registry.lookup('opencode')?.displayName, 'OpenCode');
  assert.equal(registry.lookup('missing'), undefined);
});

test('createNotifier aggregates per-channel results', async () => {
  const notifier = createNotifier({
    channels: [
      { id: 'telegram', send: async () => ({ message_id: 1 }) },
      { id: 'webhook', send: async () => ({ status: 'ok' }) },
    ],
  });

  const results = await notifier.notify(
    createNotification(baseInput({ subject: 'task' })),
  );

  assert.equal(results.length, 2);
  assert.equal(results[0]?.channelId, 'telegram');
  assert.equal(results[0]?.status, 'fulfilled');
  assert.deepEqual(results[0]?.value, { message_id: 1 });
  assert.equal(results[1]?.status, 'fulfilled');
});

test('createNotifier isolates failing channels from healthy ones', async () => {
  const delivered: Array<[string, Notification]> = [];
  const notifier = createNotifier({
    channels: [
      {
        id: 'broken',
        send: async () => {
          throw new Error('boom');
        },
      },
      {
        id: 'healthy',
        send: async (notification) => {
          delivered.push(['healthy', notification]);
          return 'ok';
        },
      },
    ],
  });

  const notification = createNotification(baseInput());
  const results = await notifier.notify(notification);

  assert.equal(results.length, 2);
  assert.equal(results[0]?.channelId, 'broken');
  assert.equal(results[0]?.status, 'rejected');
  assert.match(String((results[0]?.reason as Error)?.message), /boom/);

  assert.equal(results[1]?.channelId, 'healthy');
  assert.equal(results[1]?.status, 'fulfilled');
  assert.equal(results[1]?.value, 'ok');
  assert.equal(delivered.length, 1);
});
