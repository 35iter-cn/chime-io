# Claude Hooks 配置清理设计

## 背景

当前 `packages/claude/hooks/hooks.json` 中存在多余的 hook 配置项，需要清理以简化配置。

## 变更范围

删除以下 3 个 hook 配置项：

| Hook | 删除原因 |
|------|---------|
| `SubagentStart` | 当前为空数组 `[]`，无实际处理脚本 |
| `SubagentStop` | 当前为空数组 `[]`，无实际处理脚本 |
| `PostToolUseFailure` | 用户不再需要 tool failure 通知 |

## 保留的 Hook

以下 3 个 hook 继续保留：

| Hook | 处理脚本 |
|------|---------|
| `Stop` | `notify-stop.cjs` |
| `StopFailure` | `notify-error.cjs` |
| `PermissionRequest` | `notify-permission.cjs` |

## 文件变更

仅修改 `packages/claude/hooks/hooks.json`。

## 验收标准

- `hooks.json` 中不再包含 `SubagentStart`、`SubagentStop`、`PostToolUseFailure`
- 保留的 3 个 hook 配置格式不变
- 文件 JSON 格式合法
