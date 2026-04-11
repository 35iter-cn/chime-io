# Claude Code Hooks 参考文档

本文档记录 Claude Code hooks 的技术细节和本项目中的实现方式。

## 官方 Hooks 列表

根据 Claude Code 官方文档，有效的 hook 名称如下：

| Hook 名称 | 触发时机 | 支持 Matcher | 可阻止 |
|-----------|----------|--------------|--------|
| `SessionStart` | 会话开始或恢复时 | ✅ | ❌ |
| `UserPromptSubmit` | 用户提交 prompt 前 | ❌ | ✅ |
| `PreToolUse` | 工具调用执行前 | ✅ | ✅ |
| `PermissionRequest` | 权限对话框出现时 | ✅ | ✅ |
| `PermissionDenied` | 自动模式拒绝工具调用时 | ✅ | ❌ |
| `PostToolUse` | 工具调用成功后 | ✅ | ❌ |
| `PostToolUseFailure` | 工具调用失败后 | ✅ | ❌ |
| `Notification` | Claude Code 发送通知时 | ✅ | ❌ |
| `SubagentStart` | 子代理启动时 | ✅ | ❌ |
| `SubagentStop` | 子代理完成时 | ✅ | ✅ |
| `TaskCreated` | 任务被创建时 | ❌ | ✅ |
| `TaskCompleted` | 任务被标记为完成时 | ❌ | ✅ |
| `Stop` | Claude 完成响应时 | ❌ | ✅ |
| `StopFailure` | 因 API 错误导致回合结束时 | ❌ | ❌ |
| `TeammateIdle` | 队友即将空闲时 | ❌ | ✅ |
| `PreCompact` | 上下文压缩前 | ✅ | ❌ |
| `PostCompact` | 上下文压缩完成后 | ✅ | ❌ |
| `Elicitation` | MCP 服务器请求用户输入时 | ✅ | ✅ |
| `ElicitationResult` | 用户响应 MCP 询问后 | ✅ | ✅ |
| `SessionEnd` | 会话终止时 | ❌ | ❌ |
| `ConfigChange` | 配置文件变更时 | ✅ | ✅ |
| `CwdChanged` | 工作目录变更时 | ❌ | ❌ |
| `FileChanged` | 被监视文件变更时 | ✅ (文件名) | ❌ |
| `WorktreeCreate` | 创建工作树时 | ❌ | ✅ |
| `WorktreeRemove` | 移除工作树时 | ❌ | ❌ |
| `InstructionsLoaded` | CLAUDE.md 或规则文件加载时 | ✅ | ❌ |

**注意**：`Error` 不是有效的 hook 名称，会话失败应使用 `StopFailure`。

## Hook 输入字段

所有 hooks 都接收 JSON 输入，包含以下通用字段：

```typescript
interface HookInput {
  // 通用字段
  session_id?: string;      // 当前会话标识符
  transcript_path?: string; // 对话 JSON 文件路径
  cwd?: string;             // 当前工作目录
  permission_mode?: string; // 权限模式
  hook_event_name?: string; // 触发的事件名
  
  // 子代理相关（仅在子代理中触发时存在）
  agent_id?: string;        // 子代理唯一标识
  agent_type?: string;      // 代理名称（如 "Explore"）
  
  // Git 信息
  git_info?: {
    branch?: string;        // Git 分支名
  };
  
  // Stop/StopFailure 特有
  reason?: string;          // 停止原因
  stop_details?: {
    model?: string;         // 模型名称
    total_tokens?: number;  // 总 token 数
  };
  last_assistant_message?: string; // 最后一条助手消息
  
  // 错误相关
  error?: string;           // 错误信息
  
  // 权限请求相关
  title?: string;           // 权限标题
  permission?: {
    title?: string;
  };
  tool_name?: string;       // 工具名
  tool?: string;            // 工具名（备选）
  tool_input?: Record<string, unknown>; // 工具输入参数
  
  // 工具使用相关
  tool_use?: {
    name?: string;
    input?: Record<string, unknown>;
  };
  result?: {
    error?: string;
    message?: string;
  };
  
  // 用户提问相关
  prompt?: string;          // 用户输入
  message?: string;         // 消息内容（备选）
  turn_count?: number;      // 回合数
}
```

**重要限制**：Claude Code hooks **不提供**会话名称字段，只能使用 `cwd` 提取项目名作为标题。

## 本项目实现

### 已配置的 Hooks

当前 `packages/claude/hooks/hooks.json` 中配置的 hooks：

| Hook | 处理脚本 | 说明 |
|------|----------|------|
| `Stop` | `notify-stop.cjs` | 会话正常完成时通知 |
| `StopFailure` | `notify-error.cjs` | 会话失败时通知 |
| `PermissionRequest` | `notify-permission.cjs` | 需要用户权限时通知 |
| `PostToolUseFailure` | `notify-tool-failure.cjs` | 工具执行失败时通知 |

### 已移除的 Hooks

- `UserPromptSubmit` - 用户发送消息时触发，但用户不需要收到自己的消息通知
- `Notification` - 原配置指向 `notifier.cjs`（库文件，无 `main()` 函数），无效

### 消息格式规范

所有通知遵循统一格式：

```
标题: Claude · <项目名>

内容:
- 状态/错误/权限描述
- 📁 <工作路径> · 🌿 <分支名>
- 详细消息（如有）
```

**示例**：

```
Claude · telnotify

completed · claude-3-7-sonnet · 10800 tokens
📁 /root/code/telnotify · 🌿 feat/demo
这是最后一条助手消息...
```

### 源码结构

```
packages/claude/src/
├── notifier.ts              # 核心：消息格式化函数
├── notify-stop.ts           # Stop hook 处理
├── notify-error.ts          # StopFailure hook 处理
├── notify-permission.ts     # PermissionRequest hook 处理
├── notify-tool-failure.ts   # PostToolUseFailure hook 处理
├── notify-question.ts       # （已停用）UserPromptSubmit 处理
└── test/
    └── notifier.test.ts     # 单元测试
```

## 决策响应

所有 hook 脚本必须返回以下 JSON 响应：

```typescript
interface ApproveResponse {
  decision: 'approve';
  reason: string;
  systemMessage: string;
}
```

即使通知发送失败，也必须返回 `decision: 'approve'`，以确保不影响 Claude Code 的正常工作流程。

## 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram Bot Token |
| `TELEGRAM_USER_ID` | ✅ | Telegram 用户 ID |
| `TELEGRAM_SILENT` | ❌ | 设为 `1` 启用静默消息 |

## 参考链接

- [Claude Code Hooks 官方文档](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Claude Code Hooks 指南](https://docs.anthropic.com/en/docs/claude-code/hooks-guide)

---

*最后更新: 2026-04-11*