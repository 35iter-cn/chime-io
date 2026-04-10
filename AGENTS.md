# AGENTS.md

## 先信可执行配置
- 优先信 `package.json`、`rush.json`、`common/config/rush/`、CI workflow；当前 `README.md` 和 `packages/claude/README.md` 里的部分开发命令已过时。
- 例子：根 `package.json` 只有 `rush:*` 脚本，没有 `pnpm build` / `pnpm test` / `pnpm typecheck`；`apps/cli/package.json` 的 bin 是 `chime`，但源码 help 文案仍写 `telme`。

## 仓库结构
- 这是 `pnpm@10.6.0` + Rush monorepo，Node 版本要求是 `>=20 <25`。
- Rush 项目边界在 `rush.json`：`packages/core`、`packages/telegram`、`packages/opencode`、`packages/claude`、`apps/cli`。
- 关键入口：`packages/opencode/src/index.ts`、`packages/claude/src/index.ts`、`apps/cli/src/index.ts`。

## 常用命令
- 安装依赖：`node common/scripts/install-run-rush.js install`
- 全量构建：`node common/scripts/install-run-rush.js build` 或 `pnpm rush:build`
- 全量测试：`node common/scripts/install-run-rush.js test` 或 `pnpm rush:test`
- 变更文件校验：`node common/scripts/install-run-rush.js change --verify`
- 发布前 dry-run：`node common/scripts/install-run-rush.js publish --pack`

## CI 实际校验顺序
- PR workflow 先跑 `change --verify`，再 `install`、`rebuild`、`test`。
- 改了可发布包却没补 change file，PR 会直接失败。

## 单包与定向验证
- 单包构建/类型检查用真实包名过滤，例如：`pnpm --filter @chime-io/core build`、`pnpm --filter @chime-io/cli typecheck`。
- 仓库里只有 `@chime-io/plugin-opencode` 定义了 `test` 脚本：`pnpm --filter @chime-io/plugin-opencode test`。
- 其他测试文件存在，但未接到 Rush `test` 命令上；需要手动跑 `pnpm exec tsx --test <path-to-test>`。

## 测试与构建陷阱
- 多数测试直接从各包 `dist/` 导入，而各包 `tsconfig.json` 只包含 `src/**/*.ts`；先构建，再跑测试，否则容易因为 `dist` 缺失失败。
- `rush test` 在 `common/config/rush/command-line.json` 里配置了 `ignoreMissingScript: true`，所以没有 `test` 脚本的项目会被静默跳过。

## 发布相关
- `publish.yml` 在 push 到 `main` 时发布，提交信息包含 `[skip publish]` 会跳过。
- `prerelease.yml` 只在提交信息包含 `[pre-release]` 时触发，并以 `beta.<timestamp>` 预发布。
- `README_RELEASE.md` 说明了正式发布依赖 change files 和 `NPM_TOKEN`；推 tag 本身不会触发发布 GitHub Release 流程。
