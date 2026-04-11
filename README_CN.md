# Chime IO — Claude Code 通知与移动端提醒

<p align="center">
  <a href="README.md">English</a> | <a href="README_CN.md">中文</a>
</p>

<!-- Hero Image 占位 - 推荐：1200x600px 展示 Telegram 通知预览，背景为代码编辑器 -->
<!-- <p align="center">
  <img src=".knowledge/docs/images/hero-banner.svg" alt="Chime IO - AI 编码通知工具" width="800">
</p> -->

<p align="center">
  <strong>当 Claude Code 完成任务、报错或需要您关注时，立即获得手机通知。</strong><br>
  不再错过任何 AI 编码里程碑。随时随地与开发工作流保持连接。
</p>

<p align="center">
  <a href="#快速开始"><strong>快速开始</strong></a> •
  <a href="#安装"><strong>安装</strong></a> •
  <a href="#配置"><strong>配置</strong></a> •
  <a href="#功能特性"><strong>功能特性</strong></a>
</p>

---

## 🎯 痛点：您正在错过关键的 AI 编码时刻

使用 **Claude Code** 或 **OpenCode** 进行开发时：

- 🕐 **长时间运行的会话** — AI 需要 10 多分钟完成任务，您需要不断检查
- ❌ **静默失败** — 错误发生时，您可能不在电脑前
- 🔧 **权限请求** — AI 需要您的批准，但您正在 AFK（远离键盘）
- 📱 **移动端盲区** — 如果不盯着屏幕，就无法知道发生了什么

**代价是什么？** 时间损失、错过截止日期、不断的上下文切换。

---

## ✨ 解决方案：Chime IO — AI 编码专用开发者通知工具

**Chime IO** 将您的 AI 编码助手与 Telegram 连接，为以下场景提供**实时移动端通知**：

- ✅ 任务完成提醒
- 🚨 错误和失败通知
- ⚡ 权限请求提醒
- 📊 会话统计和 Git 上下文

专为希望 **在 AFK 时保持高效** 的开发者打造。

---

## 🚀 快速开始（3-30-3 法则）

### ⚡ 3 秒：了解
> *"从 Claude Code 和 OpenCode 获取 Telegram 通知"*

### ⚙️ 30 秒：安装

**方式 A：OpenCode 插件**（推荐）
```bash
# 安装插件
opencode plugin install @chime-io/plugin-opencode

# 设置 Telegram 凭证
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
```

**方式 B：Claude Code 插件**
```bash
# 复制插件到 Claude Code
cp -r packages/claude ~/.claude/plugins/chime-io-notifier
claude config set enabledPlugins '["chime-io-notifier"]'
```

**方式 C：CLI 工具**
```bash
# 全局安装 CLI
npm install -g @chime-io/cli

# 发送测试通知
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "Hello from Chime IO!"
```

### 🎓 3 分钟：配置

在 `~/.bashrc`、`~/.zshrc` 或当前会话中设置环境变量：

```bash
# 必需
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
export TELEGRAM_USER_ID="123456789"

# 可选 - 自定义行为
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
```

查看 [配置](#配置) 章节了解所有选项。

---

## 🔥 功能特性

| 功能 | 描述 | Claude Code | OpenCode | CLI |
|------|------|:-----------:|:--------:|:---:|
| **停止通知** | AI 完成时收到通知 | ✅ | ✅ | ✅ |
| **错误提醒** | 即时错误和失败通知 | ✅ | ✅ | ✅ |
| **权限请求** | 知道何时需要批准 | ✅ | ✅ | ✅ |
| **会话统计** | Token 使用、时长、成本 | ✅ | ✅ | ❌ |
| **Git 上下文** | 分支、提交、仓库信息 | ✅ | ✅ | ❌ |
| **自定义过滤** | 按工具类型过滤通知 | ✅ | ❌ | ❌ |
| **静音模式** | 发送无声音通知 | ✅ | ✅ | ✅ |

### 为什么选择 Chime IO？

- 🔌 **即插即用** — 开箱即用，支持 Claude Code 和 OpenCode
- 📱 **移动优先** — 为 Telegram 设计，适用于所有设备
- 🛠️ **开发者导向** — 每条通知都包含丰富的技术上下文
- 🔒 **隐私保护** — 除 Telegram 外，数据不会离开您的机器
- ⚡ **零延迟** — 直接 Webhook 投递，无中间件

---

## 📦 安装

### 方法 1：OpenCode 插件（推荐）

**OpenCode 插件**是开始使用 AI 编码通知的最简单方式。

```bash
# 从源码构建（monorepo）
pnpm rush:install
pnpm rush:build

# 或从 npm 安装（发布后）
opencode plugin install @chime-io/plugin-opencode
```

**入口点：** `packages/opencode/dist/plugin.js`

### 方法 2：Claude Code 插件

安装 **Claude Code Telegram** 通知器，获得丰富的移动端通知。

```bash
# 1. 构建插件
pnpm --filter @chime-io/plugin-claude build

# 2. 复制到 Claude Code 插件目录
cp -r packages/claude ~/.claude/plugins/chime-io-notifier

# 3. 启用插件
claude config set enabledPlugins '["chime-io-notifier"]'
```

**替代方式：本地 Marketplace（开发模式）**
```bash
# 添加本地 marketplace（仅限非 root 用户）
claude /plugin marketplace add /path/to/this/repo

# 从 /plugin 界面安装
```

### 方法 3：CLI 工具

使用独立的**开发者通知工具**进行自定义集成。

```bash
# 全局安装
npm install -g @chime-io/cli

# 或使用 npx
npx @chime-io/cli -t <token> -u <user_id> -m "您的消息"
```

**从源码构建：**
```bash
pnpm --filter @chime-io/cli build
pnpm --filter @chime-io/cli exec chime -t <token> -u <user_id> -m "Hello"
```

---

## ⚙️ 配置

### 环境变量

| 变量 | 必需 | 默认值 | 描述 |
|------|------|--------|------|
| `TELEGRAM_BOT_TOKEN` | ✅ | - | Telegram Bot Token（从 [@BotFather](https://t.me/botfather) 获取） |
| `TELEGRAM_USER_ID` | ✅ | - | Telegram 用户 ID（从 [@userinfobot](https://t.me/userinfobot) 获取） |
| `TELEGRAM_PARSE_MODE` | ❌ | `HTML` | 消息格式：`HTML`、`Markdown` 或 `MarkdownV2` |
| `TELEGRAM_SILENT` | ❌ | `0` | `1` 表示发送无声音通知 |
| `CLAUDE_NOTIFY_DETAIL_LEVEL` | ❌ | `medium` | 详细程度：`low`、`medium`、`high` |
| `CLAUDE_NOTIFY_INCLUDE_STATS` | ❌ | `true` | 包含会话统计 |
| `CLAUDE_NOTIFY_INCLUDE_GIT` | ❌ | `true` | 包含 Git 上下文 |
| `CLAUDE_NOTIFY_TOOL_FILTER` | ❌ | - | 按工具过滤：`Bash\|Edit` |

### Telegram Bot 设置

1. **使用 [@BotFather](https://t.me/botfather) 创建 Bot**：
   - 发送 `/newbot`
   - 选择名称和用户名
   - 保存 Token

2. **从 [@userinfobot](https://t.me/userinfobot) 获取用户 ID**：
   - 启动 Bot
   - 您的 ID 将显示

3. **启动您的 Bot**：
   - 打开 `https://t.me/your_bot_username`
   - 点击 "Start"

### 持久化配置

添加到您的 Shell 配置文件（`~/.bashrc`、`~/.zshrc` 或 `~/.config/fish/config.fish`）：

```bash
# Chime IO 配置
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
export TELEGRAM_USER_ID="123456789"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
```

---

## 💡 使用场景

### 1. 长时间重构
```bash
# 启动复杂的重构会话
claude refactor the entire codebase to TypeScript

# 走开吧——完成时您会收到通知！
```

### 2. CI/CD 集成
```bash
# 在部署脚本中
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "🚀 部署开始: $PROJECT_NAME"
./deploy.sh
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "✅ 部署完成: $PROJECT_NAME"
```

### 3. 批处理
```bash
# 处理数千个文件
for file in data/*.csv; do
  python process.py "$file"
  chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "📊 已处理: $file"
done
```

### 4. 远程服务器监控
```bash
# 在您的 VPS 上
export TELEGRAM_BOT_TOKEN="xxx"
export TELEGRAM_USER_ID="xxx"

# 设置定时任务
echo "0 */6 * * * chime -m '服务器签到: $(date)'" | crontab -
```

---

## 🏗️ 架构

Chime IO 是一个为可扩展性而设计的**模块化 monorepo**：

```
packages/
├── core/          # 通知模型、渲染器和日志器
├── telegram/      # Telegram 频道和 HTTP 传输
├── claude/        # Claude Code hooks 实现
├── opencode/      # OpenCode 插件与格式化器
└── cli/           # 独立 CLI 工具
```

每个包可以独立使用，也可以组合使用以获得最大灵活性。

---

## 🤝 贡献

我们欢迎贡献！详情请参阅我们的 [贡献指南](CONTRIBUTING.md)。

```bash
# 设置开发环境
pnpm rush:install
pnpm rush:build

# 运行测试
pnpm rush:test

# 验证变更
pnpm rush:change:verify
```

---

## 📄 许可证

MIT 许可证 — 详见 [LICENSE](LICENSE)。

---

## 🔗 相关链接

- [Claude Code](https://claude.ai/code) — AI 驱动的编码助手
- [OpenCode](https://opencode.ai) — 开放式 AI 编码平台
- [Telegram Bot API](https://core.telegram.org/bots/api) — Telegram Bot 文档

---

<p align="center">
  <strong>不再错过 AI 编码旅程中的任何时刻。</strong><br>
  <sub>为珍惜时间的开发者打造 ❤️</sub>
</p>
