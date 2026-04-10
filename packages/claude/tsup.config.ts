import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'notify-stop': 'src/notify-stop.ts',
    'notify-error': 'src/notify-error.ts',
    'notify-permission': 'src/notify-permission.ts',
    'notify-question': 'src/notify-question.ts',
    'notifier': 'src/notifier.ts',
  },
  outDir: 'dist',
  format: 'cjs',
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
