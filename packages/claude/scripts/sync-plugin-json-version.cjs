#!/usr/bin/env node
/**
 * Sync .claude-plugin/plugin.json version with package.json version.
 * Runs during `npm publish` via the `prepublishOnly` lifecycle script.
 */

const fs = require('node:fs');
const path = require('node:path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const pluginJsonPath = path.resolve(__dirname, '../.claude-plugin/plugin.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));

if (pluginJson.version !== packageJson.version) {
  pluginJson.version = packageJson.version;
  fs.writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2) + '\n');
  console.log(`Synced plugin.json version to ${packageJson.version}`);
} else {
  console.log(`plugin.json version already synced (${packageJson.version})`);
}
