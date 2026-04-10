#!/usr/bin/env node
/**
 * Hook: PostToolUseFailure - Notify when a tool execution fails
 */

import {
  createApproveResponse,
  formatToolFailure,
  sendNotification,
  shouldNotifyToolFailure,
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

    if (!shouldNotifyToolFailure(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    await sendNotification({ text: formatToolFailure(hookInput) });
    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-tool-use hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
