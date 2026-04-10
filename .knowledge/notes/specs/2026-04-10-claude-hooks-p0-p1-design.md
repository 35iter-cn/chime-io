# Claude Hooks P0 P1 增强设计

## 目标

在 `@chime-io/plugin-claude` 中把 Claude Code hooks 通知从极简状态文本升级为信息更完整、默认低噪音的 Telegram 通知，并补上 `P0 + P1` 范围内的测试、配置和文档。

成功标准：

- 现有 4 个 hook 能在 Claude 官方 hooks 文档允许的输入范围内展示更高价值字段：会话、模型、token、cwd、git、权限和通知优先级。
- 新增 tool-use 与 subagent hooks，并默认仅发送失败或高信号事件。
- 过滤逻辑、格式化逻辑和环境变量解析集中在共享层，避免分散在各个 hook 脚本中。
- `packages/claude` 补充可执行的 Node 原生测试，并覆盖新增格式化与过滤行为。

## 范围

包含：

- 增强 `Stop`、`PermissionRequest`、`Notification`、`UserPromptSubmit`。
- 新增 `PostToolUseFailure`、`SubagentStart`、`SubagentStop` 支持。
- 更新 `hooks.json` 注册上述事件。
- 增加环境变量控制 detail level、git/stats 开关、tool 过滤。
- 更新 `packages/claude/README.md` 与仓库根 `README.md` 的 Claude 插件说明。

不包含：

- `ConfigChange` hook。
- session summary 聚合通知。
- Telegram 交互按钮。
- 任何会影响 Claude Code hook 决策的逻辑变更；通知失败仍必须返回 `approve`。

## 推荐实现

采用“轻量重构后扩展”方案：

- 保留 `packages/claude/hooks/` 目录结构和每个事件一个入口脚本的模式。
- 把字段提取、格式化、过滤、环境变量解析集中到 `packages/claude/hooks/lib/notifier.js`。
- 各 hook 文件只负责读取 stdin、解析 JSON、调用共享函数、发送消息并返回标准 approve 响应。

这样做能在不引入额外框架的前提下，把逻辑从脚本层抽离出来，便于补测试和继续扩展 `ConfigChange` / summary 等后续阶段。

## 事件策略

### Stop

- 默认发送。
- 继续跳过明显无价值的结束原因，例如 `user_exit` 和 `interrupt`。
- 文案包含：session 短 ID、结束原因、模型、prompt/completion/total tokens、cwd 派生的项目名、permission mode、git 分支及 dirty 标记。

### PermissionRequest

- 默认发送，不做降噪。
- 文案包含：session 短 ID、title 摘要、tool 名称、tool input 摘要、风险等级、confidence。

### Notification

- 默认只发送 `medium/high`，跳过 `low/info`。
- 文案包含：priority、notification type、title、message。

### UserPromptSubmit

- 保留当前“只通知问题型 prompt”的策略，避免每次输入都推送。
- 文案在字段存在时包含：turn count、context usage（total/context window 及占比）、slash command 检测、prompt 摘要、项目名和 git 摘要。

### Tool Use

- 仅注册并默认发送 `PostToolUseFailure`。
- `PreToolUse` 和成功 `PostToolUse` 这次不注册，避免噪音；格式化函数和环境变量接口可以为后续留好扩展位，但不在本次 hooks.json 中启用。
- 失败通知包含：tool name、tool input 摘要、error 文本、执行耗时（若存在）。

### Subagent

- 注册 `SubagentStart` 与 `SubagentStop`。
- 默认策略：
  - `SubagentStart` 不发送。
  - `SubagentStop` 仅在 `last_assistant_message` 呈现高信号总结时发送。
- 文案包含：agent type 与 `last_assistant_message` 摘要。

## 消息格式

- 继续使用 Telegram `HTML` parse mode。
- 标题统一为 `<b>Claude Code · ...</b>`。
- 内容统一采用“1 行状态 + 2 到 5 行关键信息”的紧凑布局。
- 对任意外部输入都执行 HTML escape。
- 对长文本统一走共享的摘要函数，默认压缩空白并截断，避免 Telegram 消息过长。
- 对对象类输入（如 `tool_input`）统一序列化并截断，避免在每个 formatter 里各写一套逻辑。

## 环境变量

新增以下环境变量，全部保持可选：

- `CLAUDE_NOTIFY_DETAIL_LEVEL=low|medium|high`
  - `medium` 作为默认值。
  - 控制是否展示扩展行，例如 token 细分、tool input 详情、result summary。
- `CLAUDE_NOTIFY_INCLUDE_STATS=true|false`
  - 默认 `true`。
  - 控制时长、turn、token、context usage 这类统计行。
- `CLAUDE_NOTIFY_INCLUDE_GIT=true|false`
  - 默认 `true`。
  - 控制 git branch / dirty 展示。
- `CLAUDE_NOTIFY_TOOL_FILTER=<regex>`
  - 默认空。
  - 仅对 tool-use 事件生效；若配置则只有匹配工具名的失败事件才发送。

默认策略遵循“只通知重要事件”：

- 权限请求和 stop 默认发。
- notification 只发中高优先级。
- question 只发问题型 prompt。
- tool-use 只发失败。
- subagent 只发高信号总结事件。

## 代码结构

### 保持的文件

- `packages/claude/hooks/notify-stop.js`
- `packages/claude/hooks/notify-permission.js`
- `packages/claude/hooks/notify-notification.js`
- `packages/claude/hooks/notify-question.js`

### 新增文件

- `packages/claude/hooks/notify-tool-use.js`
- `packages/claude/hooks/notify-subagent.js`
- `packages/claude/test/notifier.test.ts`

### 主要修改点

- `packages/claude/hooks/lib/notifier.js`
  - 新增配置读取、字段摘要、过滤函数、tool/subagent formatter。
- `packages/claude/hooks/hooks.json`
  - 注册 `PostToolUseFailure`、`SubagentStart`、`SubagentStop`。
- `packages/claude/package.json`
  - 增加 `test` 脚本，沿用仓库中的 `tsx --test` 模式。
- `packages/claude/src/types.ts`
  - 扩展 hook 事件和输入字段类型，保持源码类型与 hooks 能力同步。
- `packages/claude/README.md` 与 `README.md`
  - 更新支持事件、环境变量和构建/测试命令。

## 测试策略

测试遵循 TDD，并使用 Node 原生 `node:test` + `assert/strict`，通过 `tsx --test` 运行 TS 测试源码。

测试覆盖最少包含：

- `Stop` 文案能展示模型、token、git 信息并正确转义。
- `PermissionRequest` 文案能展示 tool/risk/confidence。
- `Notification` 低优先级会被过滤，高优先级文案包含类型和标题。
- `UserPromptSubmit` 对问题型 prompt 发送，对普通陈述不发送。
- `PostToolUseFailure` 默认发送，支持 tool filter，文案包含错误和耗时。
- `SubagentStop` 仅在 `last_assistant_message` 呈现高信号总结时发送。

## 错误处理

- 任何 hook 脚本在 JSON 解析失败或通知失败时，仍返回 `decision: "approve"`。
- 过滤命中的“不发送”分支也应输出标准 approve 响应，避免直接 `process.exit(0)` 导致行为不一致。
- 对未知字段一律容忍，不依赖字段必定存在。

## 文档与验收

验收命令以仓库现状为准：

- `pnpm --filter @chime-io/plugin-claude test`
- `pnpm --filter @chime-io/plugin-claude typecheck`

如需要更高信心，再补跑仓库级：

- `pnpm build`
- `pnpm test`

本次设计不要求改动 `dist/`，也不要求发布或提交 change file。
