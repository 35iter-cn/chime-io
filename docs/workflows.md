# CI/CD Workflow 规格文档

本文档描述项目的 GitHub Actions 工作流配置和流程。

## 工作流概览

```
┌─────────────────────────────────────────────────────────────┐
│                        开发流程                              │
└─────────────────────────────────────────────────────────────┘

  PR ───► PRs.yml (验证) ───► main 分支 ───► publish.yml (构建+测试+发布)
                                              │
                                              ▼
                                          npm (正式包)

  feature 分支 ───► prerelease.yml ───► npm (beta 包)
                    [需 [pre-release] 标记]
```

## 工作流详情

### 1. PRs.yml - Pull Request 验证

**触发条件：**
- PR 创建、更新、重新打开
- 目标分支：`main`

**执行步骤：**
1. 检出代码 (`fetch-depth: 2`)
2. 设置 Node.js (LTS 版本)
3. 启用 pnpm 并配置缓存
4. **验证 change logs** - 确保 PR 包含版本变更记录
5. 安装依赖
6. 重建包
7. 运行测试

**目的：** 在代码合并前确保质量和版本追踪完整性。

---

### 2. publish.yml - 正式发布

**触发条件：**
- Push 到 `main` 分支
- 提交消息不包含 `[skip publish]`

**执行步骤：**
1. 检出代码 (`fetch-depth: 0`，获取完整历史)
2. 配置 Git 用户
3. 设置 Node.js (LTS 版本)
4. 启用 pnpm 并配置缓存
5. 安装依赖
6. 重建包
7. **运行测试**
8. 发布到 npm

**特殊配置：**
- `id-token: write` - 启用 npm provenance（来源证明）
- `--set-access-level public` - 确保包为公开访问
- `--target-branch main` - 指定目标分支

---

### 3. prerelease.yml - Beta 发布

**触发条件：**
- Push 到任意分支
- 提交消息包含 `[pre-release]`

**执行步骤：**
1. 检出代码 (`fetch-depth: 0`)
2. 配置 Git 用户
3. 设置 Node.js (LTS 版本)
4. 启用 pnpm 并配置缓存
5. 安装依赖
6. 重建包
7. **生成 beta 版本** - 使用 `beta.YYYYMMDDhhmmss` 格式
8. 发布到 npm (带 `beta` tag)

**版本格式：** `x.y.z-beta.20250410120000`

---

### 4. token-check.yml - Token 过期提醒

**触发条件：**
- 每周一自动运行 (`cron: '0 0 * * 1'`)
- 支持手动触发

**功能：**
- 监控 `NPM_TOKEN` 有效期（默认 90 天）
- 提前 14 天创建提醒 Issue
- 续期后自动在 Issue 添加评论

---

## 共享配置

### Node.js 版本
所有工作流统一使用 `'lts/*'`，自动跟随最新 LTS 版本。

### pnpm 缓存
```yaml
- uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('common/config/rush/pnpm-lock.yaml') }}
```

### Rush 命令
- `rush change --verify` - 验证变更记录
- `rush install` - 安装依赖
- `rush rebuild` - 重建所有包
- `rush test` - 运行测试
- `rush publish` - 发布包

---

## 权限说明

| 工作流 | 权限需求 |
|--------|----------|
| PRs.yml | 无特殊权限 |
| publish.yml | `contents: write`, `id-token: write` |
| prerelease.yml | `contents: write`, `id-token: write` |
| token-check.yml | `issues: write`, `contents: read` |

---

## 跳过机制

- `[skip publish]` - 跳过正式发布
- `[pre-release]` - 触发 beta 发布

---

## 最佳实践

1. **PR 必须包含 change log** - 使用 `rush change` 生成
2. **正式包发布前自动测试** - publish.yml 包含完整测试
3. **beta 版本用于测试** - 使用 `[pre-release]` 标记测试新功能
4. **定期轮换 NPM Token** - token-check.yml 会提前提醒
