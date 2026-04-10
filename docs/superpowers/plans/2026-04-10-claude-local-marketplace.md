# Claude 本地 Marketplace 实施计划（中文翻译）

> **面向执行者：** 建议使用 subagent-driven-development（推荐）或 executing-plans 来逐任务执行。本计划使用复选框（`- [ ]`）标记步骤进度。

**目标：** 使仓库能够以仓库根目录作为 Claude Code 的本地 marketplace（遵循 superpowers 的做法）进行安装，且不移动现有的 `packages/claude/hooks/` 目录。

**架构简介：** 在仓库根创建 `.claude-plugin/marketplace.json`，将 `packages/claude` 列为插件源（plugin source）。确保 `packages/claude/.claude-plugin/plugin.json` 中引用 hooks 的路径对插件根目录有效（例如 `../hooks/hooks.json`），这样当以仓库根作为 marketplace 添加时，Claude 能正确解析并找到 hooks。

**技术栈：** Node.js（hook 脚本）、JSON manifest（`.claude-plugin/`）、以及 claude CLI（用于 `/plugin marketplace add` 与 TUI 安装）。

---

### 任务 1：在仓库根添加 marketplace 描述文件

**文件：**
- 新建：`/.claude-plugin/marketplace.json`（仓库根下的隐藏目录）

- [ ] **步骤 1：在仓库根创建 marketplace.json**

在仓库根创建文件：`.claude-plugin/marketplace.json`，内容如下：

```json
{
  "name": "telnotify-dev",
  "description": "Local marketplace for TelNotify Claude plugins",
  "owner": {
    "name": "TelNotify",
    "email": "devnull@telnotify.local"
  },
  "plugins": [
    {
      "name": "chime-io-notifier",
      "description": "Send notifications to Telegram when Claude Code sessions complete or need attention",
      "version": "1.0.0",
      "source": "packages/claude",
      "author": { "name": "chime-io", "email": "noreply@chime-io.local" }
    }
  ]
}
```

预期：文件创建在仓库根的 `.claude-plugin/marketplace.json`。

---

### 任务 2：确保插件 manifest（plugin.json）对 hooks 的引用相对于插件根正确

**文件：**
- 修改：`packages/claude/.claude-plugin/plugin.json`

- [ ] **步骤 1：确认 plugin.json 中 `hooks.configPath` 为 `../hooks/hooks.json`**

打开 `packages/claude/.claude-plugin/plugin.json`，确认 `hooks.configPath` 设置为 `../hooks/hooks.json`（相对于 `packages/claude/.claude-plugin`）。示例片段如下：

```json
{
  "name": "chime-io-notifier",
  "version": "1.0.0",
  "description": "...",
  "author": { "name": "chime-io", "email": "noreply@chime-io.local" },
  "hooks": {
    "configPath": "../hooks/hooks.json"
  }
}
```

如果当前 `configPath` 指向其它位置（例如 `hooks/hooks.json`），请改为 `../hooks/hooks.json`，这样当插件根为 `packages/claude` 时会使用 `packages/claude/hooks/hooks.json`。

进行快速 JSON 校验（打开文件肉眼检查或用 JSON 验证工具）以确保格式正确。

---

### 任务 3：验证 hooks JSON 与脚本

**文件：**
- 阅读：`packages/claude/hooks/hooks.json`
- 阅读：`packages/claude/hooks/*.js` 脚本文件

- [ ] **步骤 1：确认 hooks.json 格式**

确保 `packages/claude/hooks/hooks.json` 包含顶层 `hooks` 对象，以事件名为键映射到 matcher/hook 列表，例如：

```json
{
  "description": "...",
  "hooks": {
    "Stop": [ { "matcher": "*", "hooks": [ { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/notify-stop.js", "async": true } ] } ]
  }
}
```

- [ ] **步骤 2：确保脚本带 shebang，并在本地测试时具备可执行权限**

文件 `packages/claude/hooks/notify-*.js` 应以 `#!/usr/bin/env node` 开头。若在本机测试需要执行权限，可运行：

```bash
chmod +x packages/claude/hooks/*.js
```

---

### 任务 4：在 README 添加安装说明（仓库根）

**文件：**
- 修改或新建：`README.md`（仓库根）或 `.claude-plugin/README.md`

- [ ] **步骤 1：添加安装与验证步骤**

添加如下指令：

```text
# 本地安装（开发用）

1. 确保以非 root 用户运行 claude CLI。
2. 在仓库根执行添加 marketplace：
   /root/.local/bin/claude /plugin marketplace add /path/to/repo
3. 在 claude 的 /plugin 界面中找到并安装 "chime-io-notifier"（来自 "telnotify-dev"）。
4. 通过运行示例会话并检查 Telegram 消息或 /plugin 列表确认安装成功。
```

---

### 任务 5：本地安装（手动步骤，需非 root）

**文件：** 无 — 操作步骤

- [ ] **步骤 1：在非 root 终端执行以下命令：**

```bash
# 以非 root 用户执行
/root/.local/bin/claude /plugin marketplace add /root/code/telnotify/.worktrees/claude-plugin
# 然后在 claude /plugin 中通过 UI 安装该插件
```

预期：在 `/plugin` 中能看到 marketplace `telnotify-dev`，插件 `chime-io-notifier` 可供安装且安装通过，不再出现 manifest 校验错误。

---

### 任务 6：安装失败时的排查清单

- [ ] 确认 claude CLI 不是以 root 身份运行（最常见问题）。
- [ ] 如果 manifest 校验失败，检查 `packages/claude/.claude-plugin/plugin.json` 中：
  - `name` 为 kebab-case（短横命名）
  - `author` 为对象并包含 `name`（可选 `email`）
  - `version` 为 sem义化版本字符串（semver）
  - `hooks.configPath` 指向 `../hooks/hooks.json`
- [ ] 验证 `packages/claude/hooks/hooks.json` 存在且为有效 JSON。
- [ ] 若 hooks 引用脚本，确保这些脚本存在于 `packages/claude/hooks/` 且以 `#!/usr/bin/env node` 开头。
- [ ] 如果你更倾向插件自包含于 `.claude-plugin`，可将 `packages/claude/hooks/*` 复制到 `packages/claude/.claude-plugin/hooks/`（工作区内已做为回退实现）；但该做法会造成副本，不利于单一数据源管理。

---

### 自检（Self-review）

1. 规格覆盖：本计划确保在仓库根存在 marketplace 元数据并将 `packages/claude` 作为插件源，同时确保 plugin.json 对 hooks 的引用相对于插件根有效并验证 hooks 结构。覆盖完备。
2. 占位符检查：无占位符；所有步骤均给出文件内容或精确示例。
3. 类型一致性：JSON 字段名与 superpowers 中的示例保持一致。

---

计划已保存于 `docs/superpowers/plans/2026-04-10-claude-local-marketplace.md`。

执行选项：
1. Subagent-Driven（推荐）— 为每个任务派生子代理逐一执行并复审。
2. Inline Execution — 如果你允许我在当前环境创建/使用非 root 用户，我可以在本会话内执行非 root 的安装步骤。

你选择哪种方式？请回复 `subagent` 或 `inline`（如果 `inline`，请同时允许非 root 执行或在本地运行步骤 5）。
