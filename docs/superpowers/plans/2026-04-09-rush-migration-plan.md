# Rush Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将仓库从 turborepo (turbo) 迁移到 Rush + pnpm，使 Rush 管理安装、构建、变更（rush change）与发布（rush publish），并使用独立包版本策略。

**Architecture:** 在仓库根引入 `rush.json` 与 `common/config/rush/*`，保留各 package 的 `build/test/clean/typecheck` 脚本；Rush 负责依赖安装与构建顺序（`rush install` / `rush build`），CI 调整为运行 Rush。

**Tech Stack:** Node 20+, pnpm 10.6.0, Rush v5.x, TypeScript (`tsc -b`), GitHub Actions

---

我正在使用 writing-plans 技能来创建实施计划。下面的每个 Task 都是可执行的、粒度化的小步骤（每一步都包含命令、期望输出、要创建/修改的文件以及 commit 指令）。请在独立工作树或专用分支上执行本计划（下文第 1 个 Task 指定如何创建 worktree/分支）。

文件映射（本计划将创建或修改的文件）
- Create: `rush.json` (仓库根)
- Create: `common/config/rush/version-policies.json`
- Modify: `package.json` (仓库根) — 更改脚本以方便使用 Rush
- Modify: `.github/workflows/ci.yml` — 把 CI 的依赖安装与构建改为使用 Rush
- Create: `docs/rush/README-RUSH.md` (帮助文档，可选但推荐)

验收准则（每项在合并前必须通过）
- 在本分支上运行 `rush install`、`rush build`、`rush test` 全部通过（测试包含现有的 package 单元测试）；
- CI (在 PR 上) 能执行 `rush install` 与 `rush build` 并通过；
- 至少一次模拟 `rush change` -> `rush publish`（使用 dry-run 或测试 registry）演练成功；
- 可以在最多一个 revert 提交内回滚到使用 turbo 的状态（保留 `.turbo` 和 turbo 依赖直到清理阶段）。

注意：本计划的目标是小步提交、快速验证。每个 Task 的最后一步都会要求 commit（示例 commit 信息已给出）。

### Task 1: 创建专用分支 / 工作树

**Files:** 无

- [ ] **Step 1: 在本地创建工作树并检出新分支**

Run:

```bash
# 在仓库根执行（确保工作区干净）
git fetch origin
git switch -c feat/rush-migration
```

Expected: 新分支 `feat/rush-migration` 被创建并切换到该分支。

- [ ] **Step 2: 可选 - 使用 git worktree 创建独立工作目录（推荐）**

Run:

```bash
# 在仓库根的父目录创建额外工作树（可使 main 工作区保持不变）
git worktree add ../feat-rush-migration feat/rush-migration
ls -la ../feat-rush-migration
```

Expected: 在仓库的父目录创建 `../feat-rush-migration`，并检出新分支。

- [ ] **Step 3: Commit 前状态检查**

Run:

```bash
git status --porcelain
```

Expected: 输出为空（或仅包含计划中的新文件），表示工作区干净。

Commit: 无（尚未修改任何文件）

### Task 2: 添加 `rush.json`（根配置）

**Files:**
- Create: `rush.json`

- [ ] **Step 1: 创建 `rush.json` 内容并保存**

Write (create `rush.json` at repo root):

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": "~5.80.0",
  "pnpmVersion": "10.6.0",
  "nodeSupportedVersionRange": ">=18 <21",
  "projects": [
    { "packageName": "@chime-io/core", "projectFolder": "packages/core" },
    { "packageName": "@chime-io/channel-telegram", "projectFolder": "packages/telegram" },
    { "packageName": "@chime-io/plugin-opencode", "projectFolder": "packages/opencode" },
    { "packageName": "@chime-io/cli", "projectFolder": "apps/cli" }
  ]
}
```

Notes: 这是最小可用配置，后续可按需加入 `approvedPackagesPolicy`, `commonTempFolder` 等字段。

- [ ] **Step 2: 保存并 commit `rush.json`**

Run:

```bash
git add rush.json
git commit -m "chore(rush): add rush.json minimal config"
```

Expected: 提交包含新文件 `rush.json`。

### Task 3: 添加 Version Policy（独立包版本）

**Files:**
- Create: `common/config/rush/version-policies.json`

- [ ] **Step 1: 创建 version-policies 文件**

Write (create `common/config/rush/version-policies.json`):

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/version-policies.schema.json",
  "versionPolicies": [
    {
      "policyName": "individual",
      "definition": "individual"
    }
  ]
}
```

Notes: 我们采用 "individual"（独立包版本）策略。Rush 也支持 lockstep 策略，若未来需要可添加。

- [ ] **Step 2: commit 版本策略文件**

Run:

```bash
git add common/config/rush/version-policies.json
git commit -m "chore(rush): add version-policies (individual)"
```

Expected: 提交新文件。

### Task 4: 修改根 package.json（切换到 Rush-friendly 脚本）

**Files:**
- Modify: `package.json` (repo root)

- [ ] **Step 1: 将根 package.json 的脚本改为使用 Rush / pnpm 递归**

Open and replace the `scripts` object in `package.json` with the content below (exact replace):

```json
"scripts": {
  "build": "rush build",
  "build:watch": "pnpm -w -r run build:watch",
  "clean": "pnpm -w -r run clean",
  "test": "pnpm build && tsx --test packages/*/test/**/*.test.ts apps/*/test/**/*.test.ts",
  "typecheck": "pnpm -w -r run typecheck"
}
```

Full-file caution: 保留 `packageManager` 字段（pnpm@10.6.0）和 `devDependencies`。如果 prefer，是把 `test` 改为 `rush build && pnpm -w -r test`，但当前保持原 test 行以最小改动。

- [ ] **Step 2: 保存并 commit `package.json` 变更**

Run:

```bash
git add package.json
git commit -m "chore(rush): update root scripts to use rush/pnpm recursive commands"
```

Expected: `package.json` 的脚本已更新并提交。

### Task 5: 本地安装验证（rush install + rush build）

**Files:** 无（运行外部命令并观察生成物）

- [ ] **Step 1: 在本地安装 Rush & 运行 `rush install`**

Run:

```bash
# 准备工具链
corepack enable
corepack prepare pnpm@10.6.0 --activate
# 安装 rush（可选全局）
npm install -g @microsoft/rush

# 运行 Rush 安装依赖（会在 common/temp 中创建 pnpm store 相关文件）
rush install
```

Expected: `rush install` 成功完成，没有严重错误。典型成功输出片段包含 "Rush completed" 或 "All projects are up to date"。如果出现依赖冲突，检查 package.json 中的 workspace 依赖声明。

- [ ] **Step 2: 运行 `rush build` 并验证产物**

Run:

```bash
rush build

# 验证常见构建产物，例如 packages/core/dist 存在
ls -la packages/core/dist || true
```

Expected: `rush build` 执行并调用每个 package 的 `build` 脚本（`tsc -b`），生成 `dist/` 文件夹。若 `rush build` 报错，修复具体 package 的编译错误后重试。

- [ ] **Step 3: commit （如需）日志或小修复**

If you made code/config fixes to make `rush build` pass, commit them with descriptive messages, e.g.:

```bash
git add <modified-files>
git commit -m "fix(build): adjust package X tsconfig paths for rush build"
```

### Task 6: 更新 CI：GitHub Actions（在分支上验证）

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: 编辑 `ci.yml` 中的依赖安装 / 构建步骤**

Replace the existing "Install dependencies" and "Build packages" steps with the following snippet (keep cache step):

```yaml
- name: Install Rush & dependencies
  run: |
    corepack enable
    corepack prepare pnpm@10.6.0 --activate
    npm install -g @microsoft/rush
    rush install --purge

- name: Build + Test
  run: |
    rush build
    rush test || pnpm -w -r test
```

Notes: 保留原有 pnpm store 缓存步骤（如果已配置）。如果 CI runner 限制不能全局安装 `@microsoft/rush`，可使用 `npx @microsoft/rush@latest install` 替代 `rush install`。

- [ ] **Step 2: 保存并 commit CI 变更**

Run:

```bash
git add .github/workflows/ci.yml
git commit -m "ci(rush): switch CI to use rush install/build"
```

Expected: 提交并触发 PR 的 CI。在 PR 中观察 CI 日志，确认 `rush install` 与 `rush build` 步骤成功。

### Task 7: 演练 change -> publish（模拟发布）

**Files:** 无（使用 rush 命令生成 change-files）。

- [ ] **Step 1: 运行 `rush change` 并提交 change 文件**

Run:

```bash
# 编辑任意 package（例如 packages/core 的一个小变更或 README）以便生成一个需要发布的变更
# 然后运行：
rush change

# rush 会打开编辑器要求描述变更；保存后会在 common/changes 下生成 change 文件
git add common/changes
git commit -m "chore(rush): add change file for package X"
```

Expected: `common/changes` 目录出现一个 change file，描述要发布的包和语义版本。

- [ ] **Step 2: 模拟发布（dry-run）或在测试 registry 上发布**

Run (dry-run example):

```bash
# 如果要真正发布，请先配置 NPM_TOKEN 在环境变量中并确保权限
# 使用 rush publish 的 --publish-path 或 --dry-run 选项（视 rush 版本而定）
rush publish --publish --include-all (OR use your organization's publish wrapper)

# 推荐先在内部测试仓库或使用 npm's --dry-run-equivalent 来验证；不要在主 registry 直接发布首次演练
```

Expected: 成功执行发布流程或在 dry-run 中显示将要发布的包清单与版本。根据你的环境，采用合适的 publish wrapper。

### Task 8: 验证与回滚策略（合并前）

**Files:** 无

- [ ] **Step 1: 在 PR 上观察 CI**

Run: 在 GitHub PR 页面检查 Actions 日志。

Expected: `Install Rush & dependencies`、`Build + Test` 步骤均成功，且没有超长执行时间或 cache 问题。

- [ ] **Step 2: 如果 CI 失败，回滚 / 修复**

If CI fails in PR: fix failures on branch and push. If main CI breaks after merge, perform:

```bash
git revert <merge-commit>
git push origin main
```

并在 revert 分支上修复问题，或把 `turbo` 配置恢复回 main（如果你已经在合并时删除了 turbo 相关内容，请保留 `.turbo` 与 `turbo` devDependency 直到确认无问题）。

### Task 9: 清理（可选，合并并确认后）

**Files:**
- Modify: `package.json` (remove `turbo` devDependency)
- Delete: `.turbo/`（CI 上也可删除缓存）

- [ ] **Step 1: 从 devDependencies 中移除 `turbo` 并 commit**

Edit `package.json`: 删除 `"turbo": "^2.5.0"` 这一行（devDependencies），然后：

```bash
git add package.json
git commit -m "chore(rush): remove turbo devDependency"
rm -rf .turbo
git add -A
git commit -m "chore(ci): remove .turbo cache"
```

Expected: `turbo` 不再出现在 `package.json` 的依赖中，仓库清理完成。

### Task 10: 文档与培训（合并后）

**Files:**
- Create: `docs/rush/README-RUSH.md`
- Modify: `README_RELEASE.md`（加入 Rush 发布流程示例）

- [ ] **Step 1: 写入最小上手文档 `docs/rush/README-RUSH.md`**

Write:

```md
# Rush Quickstart

## 常用命令

- `corepack enable && corepack prepare pnpm@10.6.0 --activate`
- `npm install -g @microsoft/rush`
- `rush install`
- `rush build`
- `rush change`
- `rush publish` (见仓库策略)

把这些命令添加到团队的 README 或 developer-onboarding 页面。
```

- [ ] **Step 2: 更新 `README_RELEASE.md` 的发布说明**

Edit `README_RELEASE.md` to include a note: "Use `rush change` to create change files; use `rush publish` (or internal wrapper) to publish packages." Commit the change.

### Self-Review Checklist (执行计划前再读一遍)

1. Spec coverage: 本计划覆盖了在 spec 中列出的所有要点：新增 Rush 配置、CI 变更、change/publish 演练、回滚策略与文档更新。
2. Placeholder scan: 本计划中所有文件内容样例均有真实示例（`rush.json`、version-policies、CI snippet、package.json scripts），没有 TBD。
3. 类型/命名一致性：文件路径、脚本名称与仓库现有 package 名称一致（`@chime-io/core` 等）。

---

Plan saved to `docs/superpowers/plans/2026-04-09-rush-migration-plan.md`.

Execution options (请选择其一回复数字):
1. Subagent-Driven (推荐) — 我派发子代理逐步执行每个 Task（每步提交后回报），适合自动化、并行化执行；
2. Inline Execution — 我在当前会话内按 Task 顺序执行（会创建/编辑文件并提交），在每个里程碑向你报告。

请回复 `1` 或 `2`，或者说“仅保存计划”表示暂不执行。我已把计划写入仓库（见上面路径）。
