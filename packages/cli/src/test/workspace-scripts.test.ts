import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type WorkspacePackageJson = {
  scripts?: {
    test?: string;
  };
};

test('workspace test script builds via Rush directly before running tests', () => {
  const packageJson = JSON.parse(
    readFileSync(new URL('../../../../package.json', import.meta.url), 'utf8'),
  ) as WorkspacePackageJson;

  assert.equal(
    packageJson.scripts?.test,
    'pnpm exec rush build && pnpm exec tsx --test packages/*/src/test/**/*.test.ts',
  );
});
