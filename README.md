# chime-io

See README_RELEASE.md for release and publish instructions.

通知桥项目已经调整为 `pnpm workspace + Rush` 的 TypeScript monorepo。

## Workspace

- `packages/core`: 通知模型、renderer、notifier、logger
- `packages/channel-telegram`: Telegram channel 和 HTTP transport
- `packages/opencode`: OpenCode formatter 与插件入口
- `packages/claude`: Claude Code hooks 实现
- `packages/cli`: `chime` CLI

## 开发命令

```bash
pnpm rush:install
pnpm rush:build
pnpm rush:rebuild
pnpm rush:test
pnpm rush:typecheck
pnpm rush:change:verify
pnpm rush:publish:pack
```

以上命令统一通过根 `package.json` 暴露的 `rush:*` 脚本调用 Rush。`rush:publish:pack` 会执行 `rush publish --pack`，用于本地验证发布产物而不真正发布。

## 运行 CLI

```bash
pnpm --filter @chime-io/cli build
pnpm --filter @chime-io/cli exec chime -t <token> -u <user_id> -m "Hello"
```

也可以直接执行产物：

```bash
node packages/cli/dist/index.cjs -t <token> -u <user_id> -m "Hello"
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

## Claude Code 插件入口

构建后插件目录在：

```text
packages/claude/.claude-plugin/
```

安装到 Claude Code：

```bash
# 复制插件到 Claude Code 插件目录
cp -r packages/claude ~/.claude/plugins/chime-io-notifier

# 在 settings.json 中启用
claude config set enabledPlugins '["chime-io-notifier"]'
```

依赖环境变量：

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
export CLAUDE_NOTIFY_TOOL_FILTER="Bash|Edit"
```

支持的事件钩子：
- `Stop` - 会话完成时通知（包含最后一条 Agent 消息）
- `Error` - 会话报错时通知（包含错误详情）
- `PermissionRequest` - 需要用户确认时通知
- `UserPromptSubmit` - 用户提问时通知

消息内容包含：Agent 名称、会话标题、完整 sessionId、详细消息内容

### 通过本地 Marketplace 安装（推荐开发用）

1. 确保以非 root 用户运行 claude CLI
2. 在仓库根目录执行添加 marketplace：
   ```bash
   claude /plugin marketplace add /path/to/this/repo
   ```
3. 在 claude 的 `/plugin` 界面中找到并安装 "chime-io-notifier"（来自 "telnotify-dev"）
4. 通过运行示例会话并检查 Telegram 消息或 `/plugin` 列表确认安装成功

## 构建目标

- 所有源码使用 TypeScript
- workspace 之间通过显式依赖连接
- `tsc` 输出可直接运行的 JavaScript 到 `dist/`
- 保留 Node 原生测试，测试通过 `tsx --test` 直接跑 TS 源码
