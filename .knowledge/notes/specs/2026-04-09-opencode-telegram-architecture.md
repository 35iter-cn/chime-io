# OpenCode Telegram Notify 架构说明

## 目标

把 OpenCode 运行事件转成统一通知，再通过 Telegram 发送给用户，同时为后续接入 Claude Code、Hermes Agent 和更多消息渠道保留清晰扩展点。

## 分层

### 1. Core

- `src/core/notification.js`: 统一通知对象 `Notification`
- `src/core/notifier.js`: 将通知广播给多个 channel
- `src/core/render.js`: 把通知渲染成文本消息

这一层不关心 OpenCode、Telegram 或其他外部系统。

### 2. Agent Adapter

- `src/agents/opencode/format.js`: 把 OpenCode session/message/tool/error 组装成统一通知文案
- `src/agents/opencode/plugin.js`: 监听 OpenCode 事件，维护 root session 状态，并把事件交给 notifier

这一层只负责“某个 agent 如何变成标准通知”。后续接入 Claude Code 或 Hermes Agent 时，新增各自 adapter 即可。

### 3. Channel Adapter

- `src/channels/telegram.js`: 负责调用 Telegram Bot API

这一层只负责“标准通知如何发出去”。后续增加 Slack、Webhook、Email 时，新增 channel 即可。

## 数据流

`OpenCode event -> OpenCode adapter -> Notification -> Notifier -> Telegram channel -> User`

同一套 `Notification` 也可以被多个 channel 复用，实现一份事件，多路发送。

## 当前支持的通知类型

- `session.completed`
- `session.error`
- `interaction.question`
- `interaction.permission`

## 扩展原则

- 新 agent: 只新增 `src/agents/<agent>/`
- 新 channel: 只新增 `src/channels/<channel>.js`
- Core 不依赖任何具体 agent / channel
- CLI 与 OpenCode 插件共用 Telegram channel，避免重复实现 API 调用
