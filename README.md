# telme

一个可扩展的通知桥接工具。

当前已支持两种使用方式：

- 作为 CLI，直接向 Telegram 用户发消息
- 作为 OpenCode 插件，把 OpenCode 事件推送到 Telegram

核心目标是把系统拆成 `agent adapter -> notifier -> channel adapter` 三层，后续可以继续接入 Claude Code、Hermes Agent，以及更多消息渠道。

## 安装

```bash
npm install -g telme
```

或使用 npx（无需安装）：

```bash
npx telme -t <token> -u <user_id> -m "Hello"
```

## 架构

### 分层设计

- `src/core`: 统一通知模型、消息渲染、分发器
- `src/agents`: 不同 agent 的事件适配器，当前提供 OpenCode
- `src/channels`: 不同发送通道，当前提供 Telegram
- `plugins/opencode-telegram.mjs`: OpenCode 插件入口

### 数据流

```text
OpenCode -> OpenCode Adapter -> Notification -> Notifier -> Telegram Channel -> User
```

后续增加新 agent 时，只需要增加新的 `src/agents/<name>`；增加新通道时，只需要增加新的 `src/channels/<name>.js`。

## CLI 用法

```bash
telme -t <bot_token> -u <user_id> -m "message"
```

### 选项

- `-t, --token <token>` - Telegram Bot Token
- `-u, --user <user_id>` - 目标用户 ID
- `-m, --message <text>` - 消息内容
- `--html` - 使用 HTML 格式（默认）
- `--silent` - 静默发送（无通知）
- `-h, --help` - 显示帮助

### 环境变量

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"

telme -m "Hello World"
```

## 消息格式

### HTML（默认）

```bash
telme -t <token> -u <id> -m "<b>Bold</b> <i>italic</i>" --html
```

| 格式 | 标签 |
|------|------|
| 粗体 | `<b>`, `<strong>` |
| 斜体 | `<i>`, `<em>` |
| 下划线 | `<u>`, `<ins>` |
| 删除线 | `<s>`, `<strike>`, `<del>` |
| 等宽 | `<code>`, `<pre>` |
| 链接 | `<a href="url">text</a>` |

## OpenCode 插件接入

### 需要的环境变量

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
```

### 插件入口

```text
plugins/opencode-telegram.mjs
```

### 插件职责

- 监听 OpenCode 的 `session.status`、`session.error`、`session.idle`
- 监听提问工具事件，发送“等待用户回答”通知
- 监听 permission 事件，发送“等待用户确认”通知
- 只把 OpenCode 事件转成标准通知对象，真正发送由 Telegram channel 负责

## 示例

### 基础消息
```bash
telme -t 123456:ABC-DEF -u 12345678 -m "Hello from CLI"
```

### OpenCode 完成通知

Telegram 收到的消息形态大致如下：

```text
OpenCode · feature-flow
+7 · -1 · 2 files
任务已完成
```

### OpenCode 提问通知

```text
OpenCode · feature-flow
Agent 正在等你回答：是否继续发布？
```

### OpenCode 权限确认通知

```text
OpenCode · feature-flow
Agent 需要你的确认：Run git push?
```

### CLI 直接发消息
```bash
telme -t <token> -u <id> -m "<b>标题</b>\n详情内容" --html
```

### 静默发送
```bash
telme -t <token> -u <id> -m "Background notification" --silent
```

## 获取 Bot Token 和 User ID

1. **Bot Token**: 在 Telegram 中找 [@BotFather](https://t.me/botfather)，创建新 bot
2. **User ID**: 发送消息给 [@userinfobot](https://t.me/userinfobot) 或 [@getidsbot](https://t.me/getidsbot)

## License

MIT
