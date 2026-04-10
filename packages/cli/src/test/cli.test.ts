import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs } from '../index.ts';

test('parseArgs reads flags and env defaults', () => {
  const options = parseArgs(['-u', '42', '-m', 'Hello\\nWorld'], {
    TELEGRAM_BOT_TOKEN: 'token-from-env',
  });

  assert.deepEqual(options, {
    token: 'token-from-env',
    userId: '42',
    message: 'Hello\nWorld',
    parseMode: 'HTML',
    silent: false,
    help: false,
  });
});

test('parseArgs marks help when requested', () => {
  const options = parseArgs(['--help'], {});
  assert.equal(options.help, true);
});
