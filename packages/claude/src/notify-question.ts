#!/usr/bin/env node
/**
 * Hook: UserPromptSubmit - Notify when user input is submitted (for tracking)
 * Note: This is primarily for logging, not for immediate notification
 */

import {
  createApproveResponse,
  formatQuestion,
  sendNotification,
  shouldNotifyQuestion,
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

    if (!shouldNotifyQuestion(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    const text = formatQuestion(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-question hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
