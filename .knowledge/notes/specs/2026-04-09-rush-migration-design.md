# Rush 迁移设计（2026-04-09）

## 概要

目标：将仓库从 turborepo (turbo) 迁移到 Rush + pnpm，并让 Rush 负责构建、变更管理与发布（你已选择）。使用独立包版本策略（每个 package 独立版本）。本设计覆盖架构、逐步迁移计划、CI 变更、回滚与验证策略，以及风险与缓解措施。

成功标准：

- CI（main 分支）能够使用 Rush 完整执行 `install`、`build`、`test`；
- 本地开发者可用 `rush install` / `rush build` 替代现有 pnpm/turbo 工作流；
- 发布流程通过 `rush change` + `rush publish`（或等效自动化）完成，并且独立包可以单独发布；
- 在回滚情形下可在一两个提交内恢复到原来的 turborepo 工作流。

## 范围（包含 / 不包含）

包含：

- 在仓库根添加 Rush 配置（rush.json、common/config/rush/*）；
- 配置 Rush 使用 pnpm（与当前 pnpm 版本保持兼容）；
- 配置 version policy 为独立包版本；
- 更新 CI（GitHub Actions）以安装并使用 Rush；
- 在文档中替换使用说明（README、release 指南）；
- 提供验证/回滚步骤供 QA 与 CI 使用。

不包含（此阶段刻意排除）：

- 复杂发布自动化（如发布到私有 npm 镜像或企业仓库的高级策略）——可作为后续任务；
- 大规模重构 package 拆分/合并；
- 迁移期间的源码修改（仅限配置与文档）。

## 假设与约束

- 你已选择 Rush 完全管理构建与发布；
- 使用独立包版本策略（每个 package 独立版本）；
- 当前仓库使用 pnpm（package.json 指定 pnpm@10.6.0）与 TypeScript 的 tsbuild 构建；
- 迁移应尽量保守，先验证再切换生产 CI 流水线。

## 推荐方案（已选）

方案 B（全面 Rush）——在仓库中引入 Rush，使用 Rush 的 `install`、`build`、`change` 与 `publish` 能力；保留各 package 现有的 `build` / `test` 脚本（Rush 调用它们）。

优点：集中化的发布/变更管理、Rush 的增量/并行构建与缓存、未来可扩展到 monorepo 发布策略。缺点：初期配置与 CI 修改成本较高，团队需学习 Rush 基本操作（`rush install`、`rush change`、`rush publish`）。

鉴于你已经明确要 Rush 管理发布与构建，并偏好长期可维护性，推荐直接采用方案 B。

## 高层架构变化

- 新增文件：`rush.json`（根），`common/config/rush/version-policies/**/*.json`（版本策略），`common/config/rush/pnpm-*.json`（pnpm 相关配置，按需要）；
- Rush 将使用与 pnpm-workspace.yaml 保持一致的包匹配（`apps/*` 与 `packages/*`）；
- 保留每个 package 的 `scripts.build` / `scripts.test`，Rush 在执行 `rush build` 时会调用包内的 `build` 脚本；
- 根 package.json 脚本从 `turbo run build` 切换为 `rush build`（或通过 CI 直接运行 rush）；
- CI 工作流替换为：安装 Node + corepack + pnpm（激活）→ 安装 Rush → `rush install` → `rush build` → `rush test`。

## 详细迁移步骤（逐步、可回滚）

前置：在新分支上执行迁移（例如 `feat/rush-migration`），确保在变更合并到 main 前 CI 可以在分支上通过。

1. 本地准备
   - 确保工作区干净（commit 所有未提交更改）；
   - Node 与 pnpm 版本锁定（使用与 CI 相同版本，当前 repo 用 pnpm@10.6.0）；

2. 添加 Rush 基础配置（不立即启用 CI）
   - 在根创建 `rush.json`（packages 指向 `apps/*` 与 `packages/*`）与 `common/` 目录结构；
   - 在 `common/config/rush` 中准备 `version-policies`（为采用独立包策略预留）；
   - 示例（概念性）：

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": "~5.80.0",
  "pnpmVersion": "10.6.0",
  "projects": [
    { "packageName": "@chime-io/core", "projectFolder": "packages/core" },
    { "packageName": "@chime-io/channel-telegram", "projectFolder": "packages/telegram" },
    { "packageName": "@chime-io/plugin-opencode", "projectFolder": "packages/opencode" },
    { "packageName": "@chime-io/cli", "projectFolder": "apps/cli" }
  ]
}
```

   - 注：上例仅作说明，实际 `rush.json` 会包含更多字段（commonTempFolder、repository intent 等）。

3. 配置 Version Policy（独立包版本）
   - 在 `common/config/rush/version-policies` 创建独立策略文件；
   - 给每个 package 指定 `versionPolicyName` 为 `individual` 或通过 `package.json` 注明；

4. 本地安装与验证（dry-run）
   - 运行 `rush install`（产生 `common/temp`），并观察是否有冲突；
   - 运行 `rush build`，修复任何因路径或构建序列产生的问题；

5. CI 变更（在分支上先验证）
   - 更新 `.github/workflows/ci.yml` 的构建步骤：
     - 安装 Node、corepack、pnpm（与本地一致）；
     - 安装 Rush：`npm install -g @microsoft/rush`（或使用 npx/rushx 方案）；
     - 执行 `rush install --purge`（或 `rush install`）→ `rush build` → `rush test`；
   - 在 PR 中观察 CI，先在分支上确保 CI 通过。

6. 引入 change 流程与发布演练
   - 在团队内部指导下使用 `rush change` 生成 change-files；
   - 走一次发布演练（`rush publish` 或 模拟发布）以验证 `change` → `publish` 流程；

7. 切换 main CI
   - 当分支验证通过后，在合并到 main 时替换 CI 使用 Rush（将测试通过的分支合并到 main 并观察 CI）；

8. 清理（可选、在稳定后）
   - 移除 turbo 相关依赖（`turbo` devDependency）、`.turbo` 缓存目录以及 turbo 配置；
   - 更新仓库 README、release 文档（保留旧流程说明直至团队确认切换完成）。

## CI 示例变更（GitHub Actions）

在现有 `ci.yml` 中，把 `Install dependencies` 与 `Build packages` 步骤替换为类似：

```yaml
- name: Install Rush & dependencies
  run: |
    corepack enable
    corepack prepare pnpm@10.6.0 --activate
    npm install -g @microsoft/rush
    rush install

- name: Build + Test
  run: |
    rush build
    rush test
```

并把 pnpm store 缓存步骤保留（如当前 workflow 所做），同时缓存 `common/temp` 与 `common/config/rush` 生成内容（按需）。

## 发布与 change 流程

- 开发者在本地做变更后运行 `rush change`，生成 change 文件；
- 在合并 PR 时，CI 可运行 `rush change` 校验（或由维护者合并前执行 `rush change`）；
- 发布由 `rush publish` 管理（或使用内部脚本包装 `rush publish` 并对接 npm token）；
- 因采用独立版本，单个 package 的小修复可以单独发布。

## 验证与回滚策略

验证：

- 在迁移分支上通过 CI（完整的 `rush install`、`rush build`、`rush test`）；
- 执行一次模拟发布以验证 change → publish 的完整链路；
- 让 1-2 名开发者在本地按照新流程（`rush install`、`rush build`）验证开发体验。

回滚策略：

1. 如果 CI 在分支上失败：修复分支或取消合并；
2. 如果合并后 main CI 出现严重问题：回滚合并提交（`git revert <merge-commit>`）恢复到使用 turbo 的状态；
3. 在清理 turbo 之前保留原有 turbo 配置与 `.turbo` 缓存，便于一键恢复。

## 风险与缓解

- 风险：pnpm 版本或 lockfile 导致依赖解析差异 → 缓解：在本地与 CI使用相同 pnpm 版本，运行 `rush install` 并审查 lockfile 变更；
- 风险：CI 缓存策略需要调整导致慢速构建 → 缓解：先在分支上观察构建时间并优化 cache key；
- 风险：团队对 Rush 操作不熟悉 → 缓解：准备一页快速上手指南（常用命令：`rush install`、`rush build`、`rush change`、`rush publish`）；
- 风险：发布凭据/权限问题 → 缓解：在测试仓库或使用 dry-run 演练发布流程，确保 npm token 授权正确。

## 里程碑与预估时间

1. 预研与准备（1 天）：确认 pnpm/node 版本、备份当前工作区、创建分支；
2. Rush 配置与本地验证（1-2 天）：创建 rush.json、version policies，执行 `rush install`、`rush build`；
3. CI 调整与分支验证（1-2 天）：修改 GitHub Actions、运行多次 PR 验证；
4. 发布演练（0.5-1 天）：`rush change` + 模拟发布；
5. 切换主线与清理（0.5-1 天）：合并到 main、移除 turbo（可选，分阶段）。

总计预估：大约 3-6 个工作日，取决于 CI 报错修复量与团队并行速度。

## 下一步（我已替你执行）

- 我会把本设计存入 `.knowledge/notes/specs/2026-04-09-rush-migration-design.md`，并在仓库中提交一条文档提交；
- 请你审阅文档，确认是否需要修改（或直接批准）。在你确认后，我会调用 `writing-plans` 技能根据本设计生成详细的实施计划并开始实现步骤。

---

文档作者：OpenCode 自动生成（基于你的选择：全面 Rush + 独立包版本）
