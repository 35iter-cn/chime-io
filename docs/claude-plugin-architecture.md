# Claude Code 插件调研与实现文档

## 调研总结

### Claude Code 插件机制

Claude Code 提供以下扩展机制：

| 机制 | 说明 | 适用场景 |
|------|------|----------|
| **Hooks** | 事件拦截系统 | 会话生命周期、工具调用、权限请求等 |
| **MCP** | Model Context Protocol | 外部工具集成 |
| **Skills** | 上下文指导模块 | 自动或手动触发的能力扩展 |
| **Remote Triggers** | 远程 API 触发 | 自动化工作流、CI/CD 集成 |

### Hooks 系统详解

支持的事件类型：
- `SessionStart` - 会话开始
- `PreToolUse` - 工具使用前
- `PostToolUse` - 工具使用后
- `Stop` - 会话停止
- `UserPromptSubmit` - 用户提交提示
- `Notification` - 通知事件
- `PermissionRequest` - 权限请求

钩子配置格式：
```json
{
  "description": "插件描述",
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/notify.js",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### OpenCode vs Claude Code 插件对比

| 特性 | OpenCode | Claude Code |
|------|----------|-------------|
| 插件配置 | `opencode.json` | `.claude-plugin/plugin.json` + `hooks.json` |
| 事件机制 | `tool.execute.before/after`, `event` | `Hooks` 系统 |
| 会话信息 | 通过 `client.session.get()` | 通过 hook input 传递 |
| 通知触发 | 需轮询/监听事件 | 钩子自动触发 |
| 安装方式 | 配置路径指向 | 复制到插件目录 + settings.json 启用 |

## 实现结构

### 目录结构

```
packages/claude/
├── .claude-plugin/
│   └── plugin.json          # 插件元数据
├── hooks/
│   ├── hooks.json           # 钩子配置
│   ├── lib/
│   │   └── notifier.js      # 共享通知逻辑
│   ├── notify-stop.js       # Stop 钩子
│   ├── notify-permission.js # PermissionRequest 钩子
│   ├── notify-notification.js # Notification 钩子
│   └── notify-question.js   # UserPromptSubmit 钩子
├── src/
│   ├── index.ts             # 主入口
│   └── types.ts             # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

### 钩子实现模式

所有钩子遵循相同的模式：

1. **接收输入**: 从 stdin 读取 JSON 格式的 hook input
2. **处理逻辑**: 解析输入，提取相关信息
3. **发送通知**: 调用 Telegram API 发送消息
4. **返回响应**: 通过 stdout 返回 JSON 格式的 hook output

示例：
```javascript
async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookInput = JSON.parse(input);

  // 发送通知
  await sendNotification({ text: formatMessage(hookInput) });

  // 返回成功响应
  console.log(JSON.stringify({
    decision: 'approve',
    reason: '',
    systemMessage: ''
  }));
}
```

## 安装与配置

### 1. 构建插件

```bash
pnpm build
```

### 2. 安装到 Claude Code

```bash
cp -r packages/claude ~/.claude/plugins/chime-io-notifier
```

### 3. 启用插件

编辑 `~/.claude/settings.json`：

```json
{
  "enabledPlugins": ["chime-io-notifier"]
}
```

或使用 CLI：

```bash
claude config set enabledPlugins '["chime-io-notifier"]'
```

### 4. 配置环境变量

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
```

## 注意事项

1. **异步执行**: 钩子配置中设置 `"async": true`，避免阻塞主流程
2. **错误处理**: 钩子失败不应影响 Claude Code 的正常使用
3. **环境变量**: 与 OpenCode 插件共用相同的环境变量
4. **Hook 决策**: 即使通知失败，也应返回 `decision: 'approve'`
