# Docs and Workflow Command Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose a single root-script command surface for contributors and CI, then update repo documentation and agent guidance to match it.

**Architecture:** Add missing Rush wrapper scripts to the root `package.json`, switch workflow steps to those scripts, and rewrite the root README/AGENTS text so it reflects the actual package layout and supported commands. The underlying Rush behavior stays unchanged.

**Tech Stack:** pnpm, Rush, GitHub Actions, Markdown

---

### Task 1: Add missing root command wrappers

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add script aliases for rebuild, verified change, and publish flows**

```json
{
  "scripts": {
    "rush": "node common/scripts/install-run-rush.js",
    "rush:install": "pnpm rush install",
    "rush:update": "pnpm rush update",
    "rush:build": "pnpm rush build",
    "rush:rebuild": "pnpm rush rebuild",
    "rush:test": "pnpm rush test",
    "rush:typecheck": "pnpm rush typecheck",
    "rush:change": "pnpm rush change",
    "rush:change:verify": "pnpm rush change --verify",
    "rush:publish:pack": "pnpm rush publish --pack",
    "rush:publish": "pnpm rush publish --publish --apply --target-branch main --set-access-level public",
    "rush:publish:prerelease": "pnpm rush publish --publish --prerelease-name beta --tag beta --apply --set-access-level public"
  }
}
```

- [ ] **Step 2: Keep prerelease timestamp generation in workflow, not package scripts**

No package script should hardcode the dynamic prerelease suffix. The workflow should continue generating the timestamp and pass it to `pnpm rush publish` directly or via an inline script-friendly wrapper.

### Task 2: Rewrite root README command guidance

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace outdated repo commands with root-script commands**

```md
## 开发命令

```bash
pnpm rush:install
pnpm rush:build
pnpm rush:rebuild
pnpm rush:test
pnpm rush:typecheck
pnpm rush:change:verify
pnpm rush:publish:pack
```
```

- [ ] **Step 2: Correct stale package and CLI references**

Update `apps/cli` to `packages/cli`, and replace `telme` examples with the published `chime` binary and `@chime-io/cli` filter name.

### Task 3: Switch workflows to root scripts

**Files:**
- Modify: `.github/workflows/PRs.yml`
- Modify: `.github/workflows/publish.yml`
- Modify: `.github/workflows/prerelease.yml`

- [ ] **Step 1: Replace direct Rush bootstrap invocations with root scripts**

```yaml
- name: Verify change logs
  run: pnpm rush:change:verify

- name: Install dependencies
  run: pnpm rush:install

- name: Rebuild packages
  run: pnpm rush:rebuild

- name: Run tests
  run: pnpm rush:test
```

- [ ] **Step 2: Keep prerelease version injection explicit in workflow**

```yaml
- name: Publish prerelease
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: pnpm rush publish --publish --prerelease-name ${{ steps.beta.outputs.version }} --tag beta --apply --set-access-level public
```

### Task 4: Refresh AGENTS guidance

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Correct repo paths and command examples**

Update `apps/cli` references to `packages/cli`, adjust the key-entry paths, and prefer root `pnpm rush:*` scripts as the primary documented commands.

- [ ] **Step 2: Preserve useful caveats that are still true**

Keep notes about CI order, `ignoreMissingScript: true`, and source-import testing, but rewrite any statements that are only artifacts of the old command surface.

### Task 5: Verify the edited files

**Files:**
- Verify: `package.json`
- Verify: `README.md`
- Verify: `.github/workflows/PRs.yml`
- Verify: `.github/workflows/publish.yml`
- Verify: `.github/workflows/prerelease.yml`
- Verify: `AGENTS.md`

- [ ] **Step 1: Inspect the diff for consistency**

Run: `git diff -- package.json README.md AGENTS.md .github/workflows/PRs.yml .github/workflows/publish.yml .github/workflows/prerelease.yml`
Expected: only the intended command-surface and path updates appear

- [ ] **Step 2: Validate package script JSON and workflow syntax indirectly**

Run: `pnpm run rush:change:verify --help`
Expected: pnpm resolves the new root script name successfully before Rush prints its help/usage output
