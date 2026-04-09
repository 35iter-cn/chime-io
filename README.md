# telme

通过 CLI 向 Telegram 用户发送消息。

## 安装

```bash
npm install -g telme
```

或使用 npx（无需安装）：

```bash
npx telme -t <token> -u <user_id> -m "Hello"
```

## 用法

```bash
telme -t <bot_token> -u <user_id> -m "message"
```

### 选项

- `-t, --token <token>` - Telegram Bot Token
- `-u, --user <user_id>` - 目标用户 ID
- `-m, --message <text>` - 消息内容
- `--html` - 使用 HTML 格式（默认: MarkdownV2）
- `--silent` - 静默发送（无通知）
- `-h, --help` - 显示帮助

### 环境变量

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"

telme -m "Hello World"
```

## 消息格式

### MarkdownV2（默认）

```bash
telme -t <token> -u <id> -m "*Bold* _italic_ ~strikethrough~"
```

| 格式 | 语法 | 示例 |
|------|------|------|
| 粗体 | `*text*` | `*Bold*` |
| 斜体 | `_text_` | `_italic_` |
| 下划线 | `__text__` | `__underline__` |
| 删除线 | `~text~` | `~strikethrough~` |
| 等宽 | `` `code` `` | `` `inline code` `` |
| 代码块 | ``` ```code``` ``` | - |
| 链接 | `[text](url)` | `[Google](https://google.com)` |
| 剧透 | `||text||` | `||spoiler||` |
| 引用 | `>text` | `>Quote` |

**特殊字符转义**: `_ * [ ] ( ) ~ \` > # + - = | { } . !` 前需加 `\`

### HTML

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

## 示例

### 基础消息
```bash
telme -t 123456:ABC-DEF -u 12345678 -m "Hello from CLI"
```

### 格式化消息（MarkdownV2）
```bash
telme -t <token> -u <id> -m "*标题*\n\n_重点信息_\n\n详情内容"
```

### HTML 格式
```bash
telme -t <token> -u <id> -m "<b>标题</b><i>重点</i>" --html
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
