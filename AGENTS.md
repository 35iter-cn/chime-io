# AGENTS.md — repo guide for OpenCode agents

目标：为未来的 OpenCode / agent 会话提供短、可执行的指引，避免常见猜测和错误。

仓库要点
- 这是一个 pnpm + turbo TypeScript monorepo（见 pnpm-workspace.yaml 与 package.json）。
- 主要包：packages/core、packages/telegram、packages/opencode；apps/cli 包含 CLI（telme）。
- 源码目录为各包下的 src/，构建产物位于 dist/。

常用命令（在仓库根目录执行）
- 安装：pnpm install
- 全量构建：pnpm build
- 增量/监听构建：pnpm build:watch
- 运行测试：pnpm test
- 类型检查：pnpm typecheck

单包命令示例
- 构建单个包：pnpm --filter @chime-io/core build
- 运行单个包测试（如果需要）：pnpm --filter @chime-io/core test

构建与测试细节（可验证行为）
- package.json 的 top-level "test" 脚本会先执行 pnpm build（即先构建再跑测试）。
- 每个包通过 `tsc -b` 构建，输出到各自的 dist/。

重要约定与陷阱
- 不要假设 tests 直接运行 TS 源而不构建：仓库的 test 脚本显式先构建。
- 每个包包含自己的 tsconfig/tsconfig.tsbuildinfo；构建产物和 tsbuildinfo 会出现在包目录，编辑时注意不要误提交这些文件。

编辑/提交建议
- 提交前运行：pnpm build && pnpm test
- 不要改动 dist/ 中的文件为源代码变更的一部分（dist/ 由构建产物生成）。

快速定位参考
- workspace config: pnpm-workspace.yaml
- monorepo scripts: package.json (repo root)
- README.md 包含运行与环境变量示例（例如 Telegram token/envs）

当遇到问题
- 构建或测试失败时先运行 `pnpm -w -v build` 查看更详细日志，然后复现单包构建以缩小范围：`pnpm --filter <pkg> build`。

维护此文件
- 如果你修改了仓库的工作流程（scripts、CI、或主要包边界），请同时更新本文件以保持 agent 指南一致。
