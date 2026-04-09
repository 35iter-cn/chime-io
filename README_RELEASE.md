Release and publish guide

1. Preconditions
- Set repository secret NPM_TOKEN with an npm token that can publish packages.
- Ensure Rush change files exist for the packages that should be published.

2. Local release check
- Build: node common/scripts/install-run-rush.js build
- Verify change files: node common/scripts/install-run-rush.js change --verify
- Run the repository-level dry-run: pnpm release:dry-run
- This stays read-only and should print `* DRYRUN:` pack lines for each publishable package, verifying the `rush change -> rush publish --pack` path without publishing anything.

3. Create a release (recommended)
- Tag a release: git tag v1.2.3 && git push origin main --tags
- Or use GitHub Releases UI to create a release. The release workflow installs with Rush and publishes via `rush publish`.

4. Troubleshooting
- If publish fails with E403, ensure the npm token has publish rights and the package scope is allowed for publishing.
