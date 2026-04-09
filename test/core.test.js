const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createNotification,
  createNotifier,
  createMessageRenderer,
} = require('../src');

test('createMessageRenderer renders title and body lines', () => {
  const render = createMessageRenderer();

  const result = render(
    createNotification({
      agent: 'opencode',
      kind: 'session.completed',
      title: 'OpenCode · feature-1234',
      lines: ['+12 · -3 · 2 files', '修改：src/a.js, src/b.js'],
    }),
  );

  assert.equal(result, 'OpenCode · feature-1234\n+12 · -3 · 2 files\n修改：src/a.js, src/b.js');
});

test('createNotifier dispatches to all channels', async () => {
  const sent = [];
  const notifier = createNotifier({
    channels: [
      {
        id: 'telegram',
        send: async (notification) => {
          sent.push(['telegram', notification.kind]);
        },
      },
      {
        id: 'webhook',
        send: async (notification) => {
          sent.push(['webhook', notification.kind]);
        },
      },
    ],
  });

  await notifier.notify(
    createNotification({
      agent: 'opencode',
      kind: 'session.completed',
      title: 'OpenCode · task',
      lines: ['done'],
    }),
  );

  assert.deepEqual(sent, [
    ['telegram', 'session.completed'],
    ['webhook', 'session.completed'],
  ]);
});
