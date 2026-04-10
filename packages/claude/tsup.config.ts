import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'notify-stop': 'src/notify-stop.ts',
    'notify-permission': 'src/notify-permission.ts',
    'notify-notification': 'src/notify-notification.ts',
    'notify-question': 'src/notify-question.ts',
    'notify-tool-use': 'src/notify-tool-use.ts',
    'notify-subagent': 'src/notify-subagent.ts',
    'notifier': 'src/notifier.ts',
  },
  outDir: 'dist',
  format: 'esm',
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
});
