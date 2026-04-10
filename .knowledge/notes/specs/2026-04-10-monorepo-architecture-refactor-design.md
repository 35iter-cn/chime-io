# Monorepo 架构调整设计文档

## 目标

统一 monorepo 中所有包的构建方式、测试结构和 TypeScript 配置。

## 变更范围

### 1. 目录结构调整

- **cli 包迁移**: `apps/cli` → `packages/cli`
- **测试文件迁移**: 所有包的测试文件从独立 `test/` 目录移动到 `src/test/`

### 2. 构建系统统一

所有包统一使用 **tsup** 构建，输出 **CommonJS** 格式（Node.js 兼容性最佳）。

| 包 | 当前构建 | 目标格式 | 测试位置变更 |
|---|---|---|---|
| core | tsc -b | tsup + CJS | test/ → src/test/ |
| telegram | tsc -b | tsup + CJS | test/ → src/test/ |
| opencode | tsc -b | tsup + CJS | test/ → src/test/ |
| claude | tsup + ESM | tsup + CJS | 无需变更 |
| cli | tsc -b | tsup + CJS | test/ → src/test/ |

### 3. TypeScript 配置调整

**tsconfig.json 变更：**
- 移除 `rootDir` 配置
- 移除 `composite` 配置（tsup 不依赖 project references）
- `include` 更新为 `["src/**/*"]`（包含测试文件）
- 保留 `outDir: "./dist"`

### 4. Package.json 脚本统一

参考 claude 包的脚本格式：

```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist"
  }
}
```

### 5. tsup 配置

统一使用以下配置：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'cjs',
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
```

**特殊处理：**
- claude 包保持多 entry 配置（多个 notify-* 文件）
- cli 包需要额外配置 `banner: { js: '#!/usr/bin/env node' }`

### 6. Rush 配置更新

更新 `rush.json` 中的 cli 路径：

```json
{
  "packageName": "@chime-io/cli",
  "projectFolder": "packages/cli",
  "shouldPublish": true,
  "versionPolicyName": "individual"
}
```

## 实施顺序

1. 移动 cli 目录并更新 rush.json
2. 迁移各包的测试文件到 src/test/
3. 更新各包的 tsconfig.json
4. 添加/更新 tsup.config.ts
5. 更新各包的 package.json
6. 验证构建和测试
