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
- Create and push the version tag first if needed: `git tag v1.2.3 && git push origin v1.2.3`
- Then publish a GitHub Release for that tag, either in the GitHub Releases UI or with `gh release create`.
- The release workflow runs only when the GitHub Release is published; pushing a tag by itself does not trigger publishing.

4. Troubleshooting
- If publish fails with E403, ensure the npm token has publish rights and the package scope is allowed for publishing.
