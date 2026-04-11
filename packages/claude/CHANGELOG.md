# Change Log - @chime-io/plugin-claude

This log was last generated on Sat, 11 Apr 2026 07:59:59 GMT and should not be manually modified.

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

