# Change Log - @chime-io/plugin-claude

This log was last generated on Tue, 07 Jul 2026 06:30:34 GMT and should not be manually modified.

## 2.0.3
Tue, 07 Jul 2026 06:30:34 GMT

### Patches

- Add prepublishOnly script to sync plugin.json version with package.json

## 2.0.2
Tue, 07 Jul 2026 06:18:10 GMT

### Patches

- Bundle @chime-io dependencies into dist and sync plugin.json version

## 2.0.1
Tue, 07 Jul 2026 03:56:09 GMT

### Patches

- Update README installation to use remote marketplace and trim local marketplace manifest

## 2.0.0
Tue, 07 Jul 2026 02:32:46 GMT

### Breaking changes

- Channel-neutral notification architecture with typed blocks, shared semantics, and AgentDescriptor

## 1.2.2
Sun, 05 Jul 2026 13:51:25 GMT

_Version update only_

## 1.2.1
Thu, 14 May 2026 03:48:54 GMT

### Patches

- 清理 hooks 配置：移除 PostToolUseFailure、SubagentStart、SubagentStop

## 1.2.0
Sat, 11 Apr 2026 07:59:59 GMT

### Minor changes

- 优化 Claude 插件通知消息格式：修复 hooks 配置（移除无效 UserPromptSubmit，添加 StopFailure），更新消息格式（添加工作路径和分支信息），统一消息风格

## 1.1.0
Fri, 10 Apr 2026 22:11:22 GMT

### Minor changes

- Refactor to tsup build with CJS output and standardized test structure
- Refactor to use Core layer interfaces, streamline to 4 hooks (stop, error, permission, question) with structured notifications

## 1.0.1
Fri, 10 Apr 2026 02:39:54 GMT

### Patches

- intro claude plugin

