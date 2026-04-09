# chime-io

See README_RELEASE.md for release and publish instructions.

通知桥项目已经调整为 `pnpm workspace + Rush` 的 TypeScript monorepo。

## Workspace

- `packages/core`: 通知模型、renderer、notifier
- `packages/telegram`: Telegram channel 和 HTTP transport
- `packages/opencode`: OpenCode formatter 与插件入口
- `apps/cli`: `telme` CLI

## 开发命令

```bash
node common/scripts/install-run-rush.js install
pnpm build
pnpm build:watch
pnpm test
pnpm typecheck
pnpm release:dry-run
```

`build` 通过 Rush 调度，`test` 会先触发仓库级构建，然后再用 `tsx --test` 运行测试。`release:dry-run` 会走 `rush publish --pack`，用于本地验证发布产物而不真正发布。

## 运行 CLI

```bash
pnpm --filter telme build
pnpm --filter telme exec telme -t <token> -u <user_id> -m "Hello"
```

也可以直接执行产物：

```bash
node apps/cli/dist/index.js -t <token> -u <user_id> -m "Hello"
```

## OpenCode 插件入口

构建后入口在：

```text
packages/opencode/dist/plugin.js
```

依赖环境变量：

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
```

## 构建目标

- 所有源码使用 TypeScript
- workspace 之间通过显式依赖连接
- `tsc` 输出可直接运行的 JavaScript 到 `dist/`
- 保留 Node 原生测试，测试通过 `tsx --test` 直接跑 TS 源码
