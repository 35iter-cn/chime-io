#!/usr/bin/env node
/**
 * Hook: PermissionRequest - Notify when Claude Code needs user permission
 */

import {
  createApproveResponse,
  formatPermissionRequest,
  sendNotification,
} from './notifier.js';

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);
    const text = formatPermissionRequest(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-permission hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
