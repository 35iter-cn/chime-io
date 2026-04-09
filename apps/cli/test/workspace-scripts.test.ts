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
    readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
  ) as WorkspacePackageJson;

  assert.equal(
    packageJson.scripts?.test,
    'node common/scripts/install-run-rush.js build && node common/scripts/install-run.js tsx@4.19.3 tsx --test packages/*/test/*.test.ts apps/*/test/*.test.ts',
  );
});
