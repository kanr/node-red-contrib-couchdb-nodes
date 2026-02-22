# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the node-red-contrib-couchdb-nodes package.

## Overview

Four main workflows are configured:

### 1. **test.yml** - Test and Build Pipeline
**Trigger**: Push to `main` or `develop`, or pull requests

**Steps**:
- ✅ Tests on Node.js v10 through v18 (multi-version compatibility)
- ✅ Dependency installation with npm ci
- ✅ Full test suite execution
- ✅ Security audit
- ✅ Code quality checks
- ✅ Package structure verification

**Matrix Testing**:
- Node v10.x (legacy support)
- Node v12.x (LTS)
- Node v14.x (LTS)
- Node v16.x (LTS)
- Node v18.x (Current LTS)

### 2. **release.yml** - Release and Publish Pipeline
**Trigger**: Git tags matching `v*` (e.g., `v1.0.0`)

**Steps**:
- ✅ Checkout code with full history
- ✅ Final test run before release
- ✅ Generate release notes from commits
- ✅ Create GitHub Release
- ✅ Publish to npm registry

**Required Secrets**:
- `NPM_TOKEN` - npm authentication token

### 3. **validate.yml** - Validation Pipeline
**Trigger**: Push to `main` or `develop`, or pull requests

**Steps**:
- ✅ Validate JSON configuration files
- ✅ Check for required documentation
- ✅ Markdown syntax validation
- ✅ Package integrity checks
- ✅ Dependency vulnerability scanning

### 4. **auto-version-bump.yml** - Automatic Version Bumping
**Trigger**: Push to `main` (excluding workflow, docs, and example changes)

**Status**: Experimental - Currently configured conservatively

**Behavior**:
- Automatically bumps patch version for code changes
- Skips for documentation-only changes (`.md` files, `examples/`)
- Skips for workflow changes (`.github/workflows/`)
- Creates version commit and tag automatically

**Skip Trigger**: Include `[skip-version]` in commit message

**Note**: Currently, manual version bumps via PR are recommended for predictable control.

## Setup Instructions

### 1. Basic Setup (Automatic)

GitHub Actions are automatically enabled for public repositories. Workflows in `.github/workflows/` run automatically on:
- **Push** to main/develop branches
- **Pull requests** targeting main/develop
- **Tag creation** matching `v*` pattern

### 2. Configure npm Publishing (Optional)

To enable automatic publishing to npm on releases:

1. **Create npm token**:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a "Publish" token (read+write)
   - Copy the token

2. **Add GitHub Secret**:
   - Go to GitHub repo settings
   - Navigate to: Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste npm token)

3. **Enable publishing**:
   - Release workflow will automatically publish on git tag push
   - Tag format: `v1.0.0`, `v1.1.0`, etc.

### 3. View Workflow Runs

**In GitHub UI**:
- Go to repository
- Click "Actions" tab
- See all workflow runs with status
- Click any run to see detailed logs

**Command line**:
```bash
gh run list --repo YOUR_USERNAME/node-red-contrib-couchdb-nodes
gh run view RUN_ID --log --repo YOUR_USERNAME/node-red-contrib-couchdb-nodes
```

## Workflow Details

### Test Workflow (test.yml)

```yaml
# Runs on these events:
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Jobs:
# 1. test - Matrix test on 5 Node versions
# 2. code-quality - Coverage and artifact upload
# 3. build - Package structure verification
# 4. publish - npm publish (only on version tags)
```

**Key Features**:
- npm ci (clean install, reproducible)
- npm audit for security
- Test artifact collection
- Version matrix testing

### Release Workflow (release.yml)

```yaml
# Only triggers on version tags
on:
  push:
    tags:
      - 'v*'

# Steps:
# 1. Checkout with full history
# 2. Run tests
# 3. Extract version from tag
# 4. Generate changelog from commits
# 5. Create GitHub Release
# 6. Publish to npm
```

**How to Use**:
```bash
# After committing and pushing changes:
git tag v1.0.0
git push origin v1.0.0

# This triggers the release workflow which:
# - Creates GitHub Release
# - Publishes to npm automatically
```

### Validation Workflow (validate.yml)

```yaml
# Runs on same events as test.yml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Jobs:
# 1. validate - Documentation and config files
# 2. markdown - Markdown syntax checking
# 3. package-integrity - Dependencies verification
```

## Best Practices

### 1. Pull Requests
Always ensure workflows pass before merging:
```
✅ Test / test (10.x) - Success
✅ Test / test (12.x) - Success
✅ Test / test (14.x) - Success
✅ Test / test (16.x) - Success
✅ Test / test (18.x) - Success
✅ code-quality - Success
✅ build - Success
✅ Lint and Validate / validate - Success
```

### 2. Releases
Only create version tags after:
1. All tests passing
2. PR merged to main
3. Version updated in package.json
4. Release notes prepared

```bash
# Update version
npm version major|minor|patch

# Push with tags
git push origin main --tags

# GitHub Actions will:
# - Run final tests
# - Create Release
# - Publish to npm
```

### 3. Branches
- **main**: Production-ready code (only merge tested PRs)
- **develop**: Development branch (integration point)
- **feature/***: Feature branches (must pass all tests)

## Monitoring & Troubleshooting

### Check Workflow Status
```bash
# View all recent runs
gh run list

# View specific run details
gh run view RUN_ID --log

# View workflow results locally
gh workflow list
```

### Debug Failed Tests
1. Click failing workflow in GitHub
2. Expand failed job logs
3. Look for error messages
4. Common issues:
   - Node version mismatch
   - Missing npm token
   - Test failure

### Re-run Failed Workflows
```bash
# From GitHub UI: Click "Re-run jobs"

# From CLI:
gh run rerun RUN_ID
```

## Configuration Files

### .github/workflows/test.yml
Main testing pipeline with Node version matrix

### .github/workflows/release.yml
Release creation and npm publishing

### .github/workflows/validate.yml
Documentation and package validation

## Environment Variables

### Available in Workflows
- `GITHUB_TOKEN` - Automatic GitHub authentication
- `GITHUB_REF` - Git reference (branch/tag)
- `GITHUB_SHA` - Commit hash
- `GITHUB_REPOSITORY` - Repo name

### Required Secrets
- `NPM_TOKEN` - Only needed for npm publishing

Use in workflow:
```yaml
- name: Publish to npm
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Scheduled Runs (Optional)

To add scheduled security audits:

```yaml
# Add to any workflow
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
      - run: npm audit
```

## Badges

Add status badges to README.md:

```markdown
# CouchDB Node-RED Contribution

[![Test](https://github.com/YOUR_USERNAME/node-red-contrib-couchdb-nodes/workflows/Test%20and%20Build/badge.svg)](https://github.com/YOUR_USERNAME/node-red-contrib-couchdb-nodes/actions)
[![Release](https://github.com/YOUR_USERNAME/node-red-contrib-couchdb-nodes/workflows/Release/badge.svg)](https://github.com/YOUR_USERNAME/node-red-contrib-couchdb-nodes/actions)
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [workflow-badges](https://github.com/actions/workflow-badges)
- [matrix-strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [secrets-management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Support

For workflow issues:
1. Check GitHub Actions logs
2. Review workflow YAML syntax
3. Verify secrets are configured
4. Test locally with `npm test`

For publishing issues:
1. Verify npm token is valid
2. Check npm package name is available
3. Review release notes in GitHub Release
4. Check npm registry: https://www.npmjs.com/package/node-red-contrib-couchdb-nodes
