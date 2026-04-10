#!/usr/bin/env node
/**
 * Hook: Stop - Notify when Claude Code session stops
 */

import {
  createApproveResponse,
  formatSessionCompleted,
  sendNotification,
  shouldNotifyStop,
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

    if (!shouldNotifyStop(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    const text = formatSessionCompleted(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-stop hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
