Release and publish guide

1. Preconditions
- Set repository secret NPM_TOKEN with an npm token that can publish packages.
- Ensure package.json versions are updated for packages to be published.

2. Local release check
- Build: pnpm -w build
- Dry-run pack for a package: cd packages/cli && npm pack --dry-run

3. Create a release (recommended)
- Tag a release: git tag v1.2.3 && git push origin main --tags
- Or use GitHub Releases UI to create a release. The CI will publish when a v* tag or release is created.

4. Troubleshooting
- If publish fails with E403, ensure the npm token has publish rights and the package scope is allowed for publishing.
