# Docs and Workflow Command Alignment Design

## Goal

Align root documentation and GitHub workflows with the canonical commands exposed by the root `package.json`, so contributors and CI use one consistent command surface.

## Scope

- Update root `package.json` to expose the Rush commands currently used by docs and workflows.
- Update `README.md` to reference only those root scripts for common repo operations.
- Update GitHub workflows to call the root scripts instead of invoking `install-run-rush.js` directly.
- Review and correct `AGENTS.md` where it no longer reflects the repo structure or command conventions.

## Non-Goals

- Do not change release behavior, CI job order, or package publish semantics.
- Do not refactor package-level scripts.
- Do not fix unrelated stale docs outside the requested files.

## Approach

Keep the change minimal by preserving the underlying Rush operations and only centralizing their entry points through root npm scripts. Documentation will describe the root scripts as the default interface, while `AGENTS.md` will be updated to match the actual repo layout and the new command guidance.
