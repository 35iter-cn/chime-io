# Monorepo 架构调整实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一 monorepo 中所有包的构建方式（tsup + CJS）、测试结构（src/test/）和 TypeScript 配置

**Architecture:** 将所有包从 tsc 构建迁移到 tsup，输出 CommonJS 格式；将测试文件统一移动到 src/test/ 目录；移除 tsconfig.json 中的 rootDir 和 composite 配置

**Tech Stack:** TypeScript, tsup, Rush, pnpm

---

## 文件结构映射

### 需要移动/重命名的文件
- `apps/cli/` → `packages/cli/`
- `packages/core/test/` → `packages/core/src/test/`
- `packages/telegram/test/` → `packages/telegram/src/test/`
- `packages/opencode/test/` → `packages/opencode/src/test/`
- `packages/cli/test/` (移动后) → `packages/cli/src/test/`

### 需要创建的文件
- `packages/core/tsup.config.ts`
- `packages/telegram/tsup.config.ts`
- `packages/opencode/tsup.config.ts`
- `packages/cli/tsup.config.ts`

### 需要修改的文件
- `rush.json` - 更新 cli 路径
- `packages/core/package.json` - 更新 scripts 和依赖
- `packages/core/tsconfig.json` - 移除 rootDir, composite，更新 include
- `packages/telegram/package.json` - 更新 scripts 和依赖
- `packages/telegram/tsconfig.json` - 移除 rootDir, composite，更新 include
- `packages/opencode/package.json` - 更新 scripts 和依赖
- `packages/opencode/tsconfig.json` - 移除 rootDir, composite，更新 include
- `packages/claude/package.json` - 更新 format 为 CJS
- `packages/claude/tsup.config.ts` - 更新 format 为 cjs，启用 dts
- `packages/claude/tsconfig.json` - 移除 rootDir, composite
- `packages/cli/package.json` - 更新 scripts 和依赖（移动后）
- `packages/cli/tsconfig.json` - 移除 rootDir, composite，更新 include

---

## Task 1: 移动 cli 目录并更新 rush.json

**Files:**
- Move: `apps/cli/` → `packages/cli/`
- Modify: `rush.json`

- [ ] **Step 1: 移动 cli 目录**

```bash
cd /root/code/telnotify
git mv apps/cli packages/cli
```

- [ ] **Step 2: 更新 rush.json 中的 cli 路径**

修改 `rush.json` 第 32-36 行：

```json
{
  "packageName": "@chime-io/cli",
  "projectFolder": "packages/cli",
  "shouldPublish": true,
  "versionPolicyName": "individual"
}
```

- [ ] **Step 3: 提交变更**

```bash
git add rush.json
# git mv 已经被 staged
git commit -m "chore: move cli from apps to packages directory"
```

---

## Task 2: 迁移 core 包的测试文件

**Files:**
- Move: `packages/core/test/core.test.ts` → `packages/core/src/test/core.test.ts`

- [ ] **Step 1: 创建测试目录并移动文件**

```bash
cd /root/code/telnotify
mkdir -p packages/core/src/test
git mv packages/core/test/core.test.ts packages/core/src/test/
rmdir packages/core/test 2>/dev/null || true
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/core/
git commit -m "chore(core): move tests to src/test directory"
```

---

## Task 3: 更新 core 包的 tsconfig.json

**Files:**
- Modify: `packages/core/tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

替换整个文件内容：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/core/tsconfig.json
git commit -m "chore(core): remove rootDir and composite from tsconfig"
```

---

## Task 4: 添加 core 包的 tsup.config.ts

**Files:**
- Create: `packages/core/tsup.config.ts`

- [ ] **Step 1: 创建 tsup.config.ts**

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

- [ ] **Step 2: 提交变更**

```bash
git add packages/core/tsup.config.ts
git commit -m "chore(core): add tsup config for CJS build"
```

---

## Task 5: 更新 core 包的 package.json

**Files:**
- Modify: `packages/core/package.json`

- [ ] **Step 1: 更新 package.json**

```json
{
  "name": "@chime-io/core",
  "version": "1.0.5",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit --pretty false"
  },
  "devDependencies": {
    "@types/node": "~25.5.2",
    "tsup": "~8.4.0",
    "tsx": "~4.21.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/core/package.json
git commit -m "chore(core): update scripts for tsup and new test path"
```

---

## Task 6: 迁移 telegram 包的测试文件

**Files:**
- Move: `packages/telegram/test/telegram.test.ts` → `packages/telegram/src/test/telegram.test.ts`

- [ ] **Step 1: 创建测试目录并移动文件**

```bash
mkdir -p packages/telegram/src/test
git mv packages/telegram/test/telegram.test.ts packages/telegram/src/test/
rmdir packages/telegram/test 2>/dev/null || true
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/telegram/
git commit -m "chore(telegram): move tests to src/test directory"
```

---

## Task 7: 更新 telegram 包的 tsconfig.json

**Files:**
- Modify: `packages/telegram/tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

替换整个文件内容：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/telegram/tsconfig.json
git commit -m "chore(telegram): remove rootDir and composite from tsconfig"
```

---

## Task 8: 添加 telegram 包的 tsup.config.ts

**Files:**
- Create: `packages/telegram/tsup.config.ts`

- [ ] **Step 1: 创建 tsup.config.ts**

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

- [ ] **Step 2: 提交变更**

```bash
git add packages/telegram/tsup.config.ts
git commit -m "chore(telegram): add tsup config for CJS build"
```

---

## Task 9: 更新 telegram 包的 package.json

**Files:**
- Modify: `packages/telegram/package.json`

- [ ] **Step 1: 更新 package.json**

```json
{
  "name": "@chime-io/channel-telegram",
  "version": "1.0.5",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "dependencies": {
    "@chime-io/core": "workspace:*"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit --pretty false"
  },
  "devDependencies": {
    "@types/node": "~25.5.2",
    "tsup": "~8.4.0",
    "tsx": "~4.21.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/telegram/package.json
git commit -m "chore(telegram): update scripts for tsup and new test path"
```

---

## Task 10: 迁移 opencode 包的测试文件

**Files:**
- Move: `packages/opencode/test/opencode.test.ts` → `packages/opencode/src/test/opencode.test.ts`

- [ ] **Step 1: 创建测试目录并移动文件**

```bash
mkdir -p packages/opencode/src/test
git mv packages/opencode/test/opencode.test.ts packages/opencode/src/test/
rmdir packages/opencode/test 2>/dev/null || true
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/opencode/
git commit -m "chore(opencode): move tests to src/test directory"
```

---

## Task 11: 更新 opencode 包的 tsconfig.json

**Files:**
- Modify: `packages/opencode/tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

替换整个文件内容：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/opencode/tsconfig.json
git commit -m "chore(opencode): remove rootDir and composite from tsconfig"
```

---

## Task 12: 添加 opencode 包的 tsup.config.ts

**Files:**
- Create: `packages/opencode/tsup.config.ts`

- [ ] **Step 1: 创建 tsup.config.ts**

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

- [ ] **Step 2: 提交变更**

```bash
git add packages/opencode/tsup.config.ts
git commit -m "chore(opencode): add tsup config for CJS build"
```

---

## Task 13: 更新 opencode 包的 package.json

**Files:**
- Modify: `packages/opencode/package.json`

- [ ] **Step 1: 更新 package.json**

```json
{
  "name": "@chime-io/plugin-opencode",
  "version": "1.0.5",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "dependencies": {
    "@chime-io/core": "workspace:*",
    "@chime-io/channel-telegram": "workspace:*"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit --pretty false"
  },
  "devDependencies": {
    "@types/node": "~25.5.2",
    "tsup": "~8.4.0",
    "tsx": "~4.21.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/opencode/package.json
git commit -m "chore(opencode): update scripts for tsup and new test path"
```

---

## Task 14: 更新 claude 包的 tsup.config.ts

**Files:**
- Modify: `packages/claude/tsup.config.ts`

- [ ] **Step 1: 更新 tsup.config.ts**

将 format 从 'esm' 改为 'cjs'，并启用 dts：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'notify-stop': 'src/notify-stop.ts',
    'notify-permission': 'src/notify-permission.ts',
    'notify-notification': 'src/notify-notification.ts',
    'notify-question': 'src/notify-question.ts',
    'notify-tool-use': 'src/notify-tool-use.ts',
    'notify-subagent': 'src/notify-subagent.ts',
    'notifier': 'src/notifier.ts',
  },
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

- [ ] **Step 2: 提交变更**

```bash
git add packages/claude/tsup.config.ts
git commit -m "chore(claude): switch tsup format from ESM to CJS"
```

---

## Task 15: 更新 claude 包的 tsconfig.json

**Files:**
- Modify: `packages/claude/tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

替换整个文件内容（移除 composite）：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/claude/tsconfig.json
git commit -m "chore(claude): remove composite from tsconfig"
```

---

## Task 16: 更新 claude 包的 package.json

**Files:**
- Modify: `packages/claude/package.json`

- [ ] **Step 1: 更新 package.json**

添加 dts 生成后的 types 路径，统一 scripts：

```json
{
  "name": "@chime-io/plugin-claude",
  "version": "1.0.1",
  "type": "module",
  "main": "./dist/notifier.js",
  "types": "./dist/notifier.d.ts",
  "exports": {
    ".": {
      "types": "./dist/notifier.d.ts",
      "default": "./dist/notifier.js"
    },
    "./notify-stop": {
      "types": "./dist/notify-stop.d.ts",
      "default": "./dist/notify-stop.js"
    },
    "./notify-permission": {
      "types": "./dist/notify-permission.d.ts",
      "default": "./dist/notify-permission.js"
    },
    "./notify-notification": {
      "types": "./dist/notify-notification.d.ts",
      "default": "./dist/notify-notification.js"
    },
    "./notify-question": {
      "types": "./dist/notify-question.d.ts",
      "default": "./dist/notify-question.js"
    },
    "./notify-tool-use": {
      "types": "./dist/notify-tool-use.d.ts",
      "default": "./dist/notify-tool-use.js"
    },
    "./notify-subagent": {
      "types": "./dist/notify-subagent.d.ts",
      "default": "./dist/notify-subagent.js"
    }
  },
  "dependencies": {
    "@chime-io/channel-telegram": "workspace:*",
    "@chime-io/core": "workspace:*"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit --pretty false"
  },
  "devDependencies": {
    "@types/node": "~25.5.2",
    "tsup": "~8.4.0",
    "tsx": "~4.21.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/claude/package.json
git commit -m "chore(claude): add exports for all entry points and update scripts"
```

---

## Task 17: 迁移 cli 包的测试文件（移动后）

**Files:**
- Move: `packages/cli/test/` → `packages/cli/src/test/`

- [ ] **Step 1: 创建测试目录并移动文件**

```bash
mkdir -p packages/cli/src/test
git mv packages/cli/test/*.test.ts packages/cli/src/test/
rmdir packages/cli/test 2>/dev/null || true
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/cli/
git commit -m "chore(cli): move tests to src/test directory"
```

---

## Task 18: 更新 cli 包的 tsconfig.json

**Files:**
- Modify: `packages/cli/tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

替换整个文件内容：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/cli/tsconfig.json
git commit -m "chore(cli): remove rootDir and composite from tsconfig"
```

---

## Task 19: 添加 cli 包的 tsup.config.ts

**Files:**
- Create: `packages/cli/tsup.config.ts`

- [ ] **Step 1: 创建 tsup.config.ts**

cli 需要 shebang 来生成可执行文件：

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
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/cli/tsup.config.ts
git commit -m "chore(cli): add tsup config for CJS build with shebang"
```

---

## Task 20: 更新 cli 包的 package.json

**Files:**
- Modify: `packages/cli/package.json`

- [ ] **Step 1: 更新 package.json**

```json
{
  "name": "@chime-io/cli",
  "version": "1.0.5",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "chime": "./dist/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "dependencies": {
    "@chime-io/core": "workspace:*",
    "@chime-io/channel-telegram": "workspace:*"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "tsx --test src/test/**/*.test.ts",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit --pretty false"
  },
  "devDependencies": {
    "@types/node": "~25.5.2",
    "tsup": "~8.4.0",
    "tsx": "~4.21.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 提交变更**

```bash
git add packages/cli/package.json
git commit -m "chore(cli): update scripts for tsup and new test path"
```

---

## Task 21: 验证所有包的构建

**Files:**
- All packages

- [ ] **Step 1: 安装依赖**

```bash
cd /root/code/telnotify
node common/scripts/install-run-rush.js update
```

- [ ] **Step 2: 构建所有包**

```bash
node common/scripts/install-run-rush.js rebuild
```

预期：所有包成功构建，生成 dist 目录

- [ ] **Step 3: 运行测试**

```bash
cd packages/core && pnpm test
cd ../telegram && pnpm test
cd ../opencode && pnpm test
cd ../claude && pnpm test
cd ../cli && pnpm test
```

预期：所有测试通过

- [ ] **Step 4: 验证输出格式**

```bash
head -1 packages/core/dist/index.js
```

预期输出包含 `'use strict';`（CJS 格式标志）

---

## 自审查清单

- [ ] Spec 覆盖：所有 5 个包都已包含
- [ ] 无占位符：每个任务都有具体代码和命令
- [ ] 类型一致性：所有 tsup.config.ts 使用相同配置模式
- [ ] 文件路径：所有路径使用绝对路径 `/root/code/telnotify/`
