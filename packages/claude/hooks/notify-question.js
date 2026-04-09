#!/usr/bin/env node
/**
 * Hook: UserPromptSubmit - Notify when user input is submitted (for tracking)
 * Note: This is primarily for logging, not for immediate notification
 */

import { sendNotification, formatQuestion } from './lib/notifier.js';

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);

    // Only notify for question-like prompts
    const prompt = hookInput.prompt || hookInput.message || '';
    const isQuestion = /\?|什么时候|怎么样|为什么|如何|请问/.test(prompt);

    if (!isQuestion) {
      process.exit(0);
    }

    const text = formatQuestion(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  } catch (error) {
    console.error('Error in notify-question hook:', error);
    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  }
}

main();
