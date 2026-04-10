# Claude Code Hooks 调研报告与优化计划

## 调研背景
当前 telnotify 项目中的 Claude Code hooks 仅展示了非常简单的信息：
```
Claude Code · Session Completed
Session: 85823fdd
Status: completed
```

用户希望丰富消息内容展示，需要调研 hooks 实际能接收到的所有可用字段。

## Claude Code Hooks 可用字段分析

### 1. 通用输入字段（所有事件都有）

根据官方文档，**所有 hook 事件**都会收到以下通用字段：

| 字段 | 类型 | 说明 | 当前使用情况 |
|------|------|------|-------------|
| `session_id` | string | 当前会话标识符 | ✅ 已使用（显示前8位） |
| `transcript_path` | string | 对话 JSON 文件路径 | ❌ 未使用 |
| `cwd` | string | 当前工作目录 | ❌ 未使用 |
| `permission_mode` | string | 当前权限模式 | ❌ 未使用 |
| `hook_event_name` | string | 触发的事件名称 | ❌ 未使用 |

**子代理运行时额外字段：**
| 字段 | 类型 | 说明 | 当前使用情况 |
|------|------|------|-------------|
| `agent_id` | string | 子代理唯一标识 | ❌ 未使用 |
| `agent_type` | string | 代理名称 | ❌ 未使用 |

### 2. 各 Hook 事件特有字段

#### SessionStart / SessionEnd
```typescript
{
  start_reason?: "startup" | "resume" | "clear" | "compact";
  end_reason?: "clear" | "resume" | "logout" | "prompt_input_exit" | "bypass_permissions_disabled" | "other";
  // 工作区信息
  worktree_created?: boolean;
  worktree_path?: string;
  git_info?: {
    branch?: string;
    commit?: string;
    dirty?: boolean;
  };
  project_dir?: string;
}
```

#### UserPromptSubmit
```typescript
{
  prompt: string;                    // 用户输入的完整文本
  prompt_hash?: string;              // 输入内容的哈希值
  prompt_length?: number;            // 字符长度
  // 历史上下文
  turn_count?: number;               // 当前是第几轮对话
  total_tokens?: number;             // 对话总 token 数
  context_window_size?: number;      // 上下文窗口大小
  // 命令检测
  is_slash_command?: boolean;        // 是否是 / 命令
  command_name?: string;             // 如果是命令，命令名称
}
```

#### Stop / StopFailure
```typescript
{
  reason?: string;                   // 停止原因
  stop_details?: {
    finish_reason?: "stop" | "length" | "tool_calls" | "content_filter";
    model?: string;                  // 使用的模型
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  // 如果是错误停止
  error_type?: "rate_limit" | "authentication_failed" | "billing_error" | "invalid_request" | "server_error" | "max_output_tokens" | "unknown";
  error_message?: string;
}
```

#### Notification
```typescript
{
  notification_type: string;         // 通知类型
  priority?: "low" | "medium" | "high" | "info";
  title?: string;                    // 通知标题
  message: string;                   // 通知内容
  source?: string;                   // 来源
  // 会话统计
  session_stats?: {
    duration_minutes?: number;
    total_turns?: number;
    tools_used?: number;
  };
}
```

#### PermissionRequest
```typescript
{
  permission_type: string;           // 权限类型
  title: string;                     // 权限请求标题
  description?: string;              // 详细描述
  tool_name?: string;                // 请求权限的工具名
  tool_input?: Record<string, any>;  // 工具输入参数
  // 自动模式相关信息
  auto_mode_classification?: {
    confidence?: number;             // AI 对安全性的信心分数
    risk_level?: "low" | "medium" | "high";
  };
}
```

#### PreToolUse / PostToolUse / PostToolUseFailure
```typescript
{
  tool_name: string;                 // 工具名称
  tool_input: Record<string, any>;   // 工具输入
  tool_output?: any;                 // 工具输出（PostToolUse）
  tool_error?: string;               // 错误信息（PostToolUseFailure）
  execution_time_ms?: number;        // 执行耗时
  // 文件操作特有
  file_path?: string;                // 操作的文件路径
  file_size?: number;                // 文件大小
  lines_changed?: number;            // 行数变化
}
```

#### SubagentStart / SubagentStop
```typescript
{
  agent_name: string;                // 子代理名称
  agent_description?: string;        // 子代理描述
  task_description?: string;         // 任务描述
  parent_agent_id?: string;          // 父代理ID
  // 执行结果（Stop时）
  result_summary?: string;
  success?: boolean;
  execution_time_seconds?: number;
}
```

#### TaskCreated / TaskCompleted
```typescript
{
  task_id: string;                   // 任务ID
  task_description: string;          // 任务描述
  parent_task_id?: string;           // 父任务ID
  created_at?: string;               // ISO 时间戳
  // Completed 特有
  completed_at?: string;
  result_summary?: string;
}
```

#### ConfigChange
```typescript
{
  config_source: string;             // 配置来源
  changed_keys: string[];            // 变更的键
  previous_values?: Record<string, any>;
  new_values?: Record<string, any>;
}
```

#### FileChanged / CwdChanged
```typescript
{
  changed_file?: string;             // 变更的文件路径
  change_type?: "created" | "modified" | "deleted";
  file_size_delta?: number;          // 文件大小变化
  // CwdChanged
  previous_cwd?: string;
  new_cwd?: string;
}
```

#### PreCompact / PostCompact
```typescript
{
  compaction_reason: "manual" | "auto";
  messages_before?: number;          // 压缩前消息数
  messages_after?: number;           // 压缩后消息数
  tokens_before?: number;
  tokens_after?: number;
}
```

#### Elicitation / ElicitationResult
```typescript
{
  mcp_server: string;                // MCP 服务器名称
  tool_name: string;
  prompt: string;                    // 向用户提出的问题
  // Result 特有
  user_response?: string;
  response_type?: "text" | "confirm" | "select";
}
```

#### WorktreeCreate / WorktreeRemove
```typescript
{
  worktree_path: string;             // 工作树路径
  parent_repo?: string;              // 父仓库路径
  branch_name?: string;              // 分支名
  commit_hash?: string;              // 提交哈希
}
```

### 3. 当前项目使用状况分析

**目前实现的 Hooks：**
- `notify-stop.js` - SessionStop
- `notify-notification.js` - Notification  
- `notify-permission.js` - PermissionRequest
- `notify-question.js` - UserPromptSubmit

**每个 hook 只使用了极少的字段：**
- `session_id` (截断为8位)
- `reason` / `message` / `title` / `prompt` (基本文本)

**大量有价值信息被忽略：**
- 会话统计信息（时长、轮次）
- 模型信息（使用的模型、token 消耗）
- Git 信息（分支、提交状态）
- 工具调用详情（工具名、耗时、参数）
- 权限风险评估（置信度、风险等级）
- 上下文窗口使用情况
- 文件操作详情（路径、大小、行数变化）
- 工作区/分支信息

## 优化计划

### 阶段 1: 基础信息增强

**目标**：在现有消息中增加最有价值的字段

#### 1.1 Stop Hook 增强
**当前：**
```
Claude Code · Session Completed
Session: 85823fdd
Status: completed
```

**优化后：**
```
Claude Code · Session Completed ✅

📊 Session: 85823fdd | ⏱️ 45 min | 💬 12 turns
🤖 Model: claude-3-7-sonnet-20250219
📈 Tokens: 8.5k sent / 2.3k received / 10.8k total
📂 Project: /home/user/myproject (main*)
💻 Mode: default
```

**新增字段：**
- 会话时长 (`session_stats.duration_minutes`)
- 对话轮次 (`turn_count`)
- 模型信息 (`stop_details.model`)
- Token 消耗统计
- 工作目录 (`cwd`)
- Git 分支信息 (`git_info.branch`, `dirty` 标记)
- 权限模式 (`permission_mode`)

#### 1.2 PermissionRequest Hook 增强
**当前：**
```
Claude Code · Permission Required
Session: 85823fdd
Action required
```

**优化后：**
```
Claude Code · Permission Required ⚠️

🛠️ Tool: Bash (rm -rf /tmp/*)
📊 Risk: High (AI confidence: 15%)
⏱️ Auto-approve: Disabled
💡 Tip: Use /y to allow once, /ya to always allow this pattern
```

**新增字段：**
- 工具名称和输入 (`tool_name`, `tool_input`)
- AI 风险评估 (`auto_mode_classification.risk_level`, `confidence`)
- 权限类型 (`permission_type`)

#### 1.3 Notification Hook 增强
**当前：**
```
Claude Code · Notification
Session: 85823fdd
New notification
```

**优化后：**
```
Claude Code · Notification 📢 [HIGH]

📝 Title: Claude is ready
📄 Message: Analysis complete. Found 3 potential issues...
🔔 Type: idle_prompt
⏱️ Session time: 23 min
```

**新增字段：**
- 优先级标记 (`priority`)
- 完整标题和内容 (`title`, `message`)
- 通知类型 (`notification_type`)

#### 1.4 UserPromptSubmit Hook 增强
**当前：**
```
Claude Code · Waiting for Input
Session: 85823fdd
Waiting for input
```

**优化后：**
```
Claude Code · User Prompt 📝

💬 Turn #7 | 📊 Context: 8.2k / 200k tokens (4%)
🔍 Command: No (/ask detected)
📝 Prompt: "帮我优化这段代码的性能..."
📂 Project: myproject (feature-branch)
```

**新增字段：**
- 轮次计数 (`turn_count`)
- 上下文使用率 (`total_tokens`, `context_window_size`)
- 是否为命令 (`is_slash_command`, `command_name`)
- 实际输入内容摘要 (`prompt`)

### 阶段 2: 新增高价值 Hooks

#### 2.1 Tool Use Hooks (PreToolUse/PostToolUse)
**价值**：追踪 Claude 执行了哪些操作，耗时多久

**通知内容示例：**
```
Claude Code · Tool Executed 🛠️

⚡ Bash: npm test
⏱️ Duration: 12.3s
✅ Result: Success (exit 0)
📄 Output: 47 lines
```

#### 2.2 Subagent Hooks (SubagentStart/SubagentStop)
**价值**：了解 Claude 何时启动子代理完成任务

**通知内容示例：**
```
Claude Code · Subagent Started 🤖

🎯 Agent: code-reviewer
📝 Task: Review PR #234 for security issues
⏱️ Started: 14:32:05
```

#### 2.3 ConfigChange Hook
**价值**：监控配置变更（如权限模式切换）

**通知内容示例：**
```
Claude Code · Config Changed ⚙️

📁 Source: .claude/settings.local.json
🔑 Keys: permissionMode
📊 Before: default → After: auto
```

### 阶段 3: 交互式功能

#### 3.1 Quick Actions
在 Telegram 消息中添加快速操作按钮：
- Approve / Deny 按钮（PermissionRequest）
- View Details 链接（跳转到完整会话）
- Stop Session 命令

#### 3.2 Session Summary
当会话结束时发送统计摘要：
```
📊 Session Summary: 85823fdd

⏱️ Duration: 45 minutes
💬 Total Turns: 12
🛠️ Tools Used: 34
   - Bash: 15
   - Read: 10
   - Edit: 5
   - Write: 4
📁 Files Modified: 8
🤖 Models: claude-3-7-sonnet
💰 Est. Cost: $0.23
```

### 阶段 4: 技术实现计划

#### 4.1 更新 notifier.js
- 添加新的格式化函数
- 支持丰富的 Markdown/HTML 格式
- 添加字段提取和计算逻辑

#### 4.2 创建新的 hook 文件
- `notify-tool-use.js` - PreToolUse/PostToolUse
- `notify-subagent.js` - SubagentStart/SubagentStop
- `notify-config.js` - ConfigChange

#### 4.3 更新 hooks.json
添加新的 hook 配置，设置适当的过滤条件避免通知泛滥。

#### 4.4 环境变量配置
```bash
# 新增配置选项
CLAUDE_NOTIFY_DETAIL_LEVEL=high    # low/medium/high
CLAUDE_NOTIFY_INCLUDE_STATS=true   # 是否包含统计信息
CLAUDE_NOTIFY_INCLUDE_GIT=true     # 是否包含 git 信息
CLAUDE_NOTIFY_TOOL_FILTER=Bash|Edit|Write  # 只通知特定工具
```

## 优先级建议

### P0（立即实施）
1. 增强现有的 4 个 hooks，添加基础字段（时长、模型、token）
2. 改进消息格式化，使用更易读的布局

### P1（近期实施）
1. 添加 PreToolUse/PostToolUse hooks（最重要的可见性）
2. 添加 Subagent hooks
3. 实现 Git 信息显示

### P2（后续优化）
1. 添加 ConfigChange hook
2. 实现会话摘要功能
3. Telegram 交互按钮

## 实施检查清单

- [ ] 增强 Stop hook - 添加模型、token、时长、git 信息
- [ ] 增强 PermissionRequest hook - 添加工具详情、风险评估
- [ ] 增强 Notification hook - 添加优先级、类型标记
- [ ] 增强 UserPromptSubmit hook - 添加上下文使用率、轮次
- [ ] 创建 PreToolUse/PostToolUse hooks
- [ ] 创建 SubagentStart/SubagentStop hooks
- [ ] 更新 hooks.json 配置
- [ ] 添加环境变量控制
- [ ] 测试各种场景
- [ ] 更新文档

## 预期效果

通过实施以上优化，消息将从简单的状态通知转变为信息丰富的会话摘要：

**用户收益：**
1. 快速了解 Claude 的工作状态，无需查看完整会话
2. 掌握 token 消耗情况，便于成本控制
3. 识别高风险操作，及时处理权限请求
4. 追踪工具使用情况，了解 Claude 的决策过程
5. 可视化上下文使用情况，避免接近窗口限制

**实施难度：**
- 阶段 1：低（仅修改现有 hooks，增加字段使用）
- 阶段 2：中（新增 hooks，需要测试）
- 阶段 3：高（需要 Telegram Bot API 交互功能）

建议从阶段 1 开始，逐步推进。
