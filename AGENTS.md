# AGENTS.md

## 先信可执行配置
- 优先信 `package.json`、`rush.json`、`common/config/rush/`、CI workflow；如果文档与这些配置冲突，以可执行配置为准。
- 例子：根仓库统一通过 `pnpm rush:*` 脚本暴露 Rush 命令；`packages/cli/package.json` 的 bin 是 `chime`，但部分源码和文档里仍可能残留 `telme`。

## 仓库结构
- 这是一个 pnpm + Rush monorepo，Node 版本要求是 `>=20 <25`。
- 根 `package.json` 当前声明 `pnpm@10.12.1`，`rush.json` / CI 当前固定 `pnpm@10.6.0`；处理版本差异时优先信实际执行环境。
- Rush 项目边界在 `rush.json`：`packages/core`、`packages/telegram`、`packages/opencode`、`packages/claude`、`packages/cli`。
- 关键入口：`packages/opencode/src/index.ts`、`packages/claude/src/index.ts`、`packages/cli/src/index.ts`。

## 常用命令
- 安装依赖：`pnpm rush:install`
- 全量构建：`pnpm rush:build`
- 全量重建：`pnpm rush:rebuild`
- 全量测试：`pnpm rush:test`
- 全量类型检查：`pnpm rush:typecheck`
- 变更文件校验：`pnpm rush:change:verify`
- 发布前 dry-run：`pnpm rush:publish:pack`

## CI 实际校验顺序
- PR workflow 先跑 `pnpm rush:change:verify`，再 `pnpm rush:install`、`pnpm rush:rebuild`、`pnpm rush:test`。
- 改了可发布包却没补 change file，PR 会直接失败。

## 创建PR前必做检查
1. **执行 `pnpm rush:change:verify`** — 确保所有修改的包都有对应的 change file
2. **如缺少 change file，运行 `pnpm rush change`** — 按提示选择变更类型（major/minor/patch）并填写描述
3. **提交并推送生成的 change file** — 位于 `common/changes/` 目录下
4. **再次验证** — 重新运行 `pnpm rush:change:verify` 确认通过

## 单包与定向验证
- 单包构建/类型检查用真实包名过滤，例如：`pnpm --filter @chime-io/core build`、`pnpm --filter @chime-io/cli typecheck`。
- 目前五个包都定义了 `test` 脚本，可按包执行，例如：`pnpm --filter @chime-io/plugin-opencode test`。
- 如果只想跑某个测试文件，直接用 `pnpm exec tsx --test <path-to-test>`。

## 测试与构建陷阱
- **测试必须从源码导入**：测试文件应直接从源码导入（如 `../index.ts`），而不是从 `dist/` 导入。这确保测试的是最新源码，而非过期的构建产物。
- **TypeScript 导入扩展名**：使用 `.ts` 扩展名导入 TypeScript 源码（需启用 `allowImportingTsExtensions` + `noEmit`）。这是 ESM 规范要求，也是区分源码和构建产物的清晰方式。
- `rush test` 在 `common/config/rush/command-line.json` 里配置了 `ignoreMissingScript: true`，所以没有 `test` 脚本的项目会被静默跳过。

## Monorepo 架构原则
- **统一构建工具**：所有包使用相同的构建工具（tsup）和输出格式（CJS）。
- **统一目录结构**：测试文件统一放在 `src/test/` 目录下，便于 TypeScript 编译器统一处理。
- **清理 tsconfig**：移除 `rootDir` 和 `composite` 配置，简化项目引用管理。tsup 不依赖 TypeScript project references。
- **Rush 命令配置**：自定义命令通过 `common/config/rush/command-line.json` 配置为 bulk 命令，而非使用 pnpm 递归执行。

## 发布相关
- `publish.yml` 在 push 到 `main` 时发布，提交信息包含 `[skip publish]` 会跳过。
- `prerelease.yml` 只在提交信息包含 `[pre-release]` 时触发，并以 `beta.<timestamp>` 预发布。
- `README_RELEASE.md` 说明了正式发布依赖 change files 和 `NPM_TOKEN`；推 tag 本身不会触发发布 GitHub Release 流程。
