# 🚀 Quick Start: Publish to npm

## One-Time Setup (5 minutes)

### 1. Create npm Token
```bash
# Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens/create
# - Type: Automation
# - Copy token (starts with npm_...)
```

### 2. Add to GitHub Secrets
```bash
# Visit: https://github.com/kanr/node-red-contrib-couchdb-nodes/settings/secrets/actions
# - Click "New repository secret"
# - Name: NPM_TOKEN
# - Value: (paste token)
```

## Publish New Version

### Recommended: Version Bump via PR

```bash
# 1. Checkout new branch from main
git checkout -b bump/version-0.1.2 origin/main

# 2. Update version in package.json
# Change "version": "0.1.1" to "version": "0.1.2"

# 3. Update package-lock.json
npm install --package-lock-only

# 4. Commit and push
git add package.json package-lock.json
git commit -m "Bump version to 0.1.2"
git push -u origin bump/version-0.1.2

# 5. Create and merge PR
gh pr create --title "Bump version to 0.1.2" --body "Patch version bump"
gh pr merge --merge

# 6. Create release tag
git checkout main && git pull
git tag v0.1.2
git push origin v0.1.2
```

**GitHub Actions will automatically:**
- ✅ Run tests
- ✅ Publish to npm
- ✅ Create GitHub Release

### Alternative: Auto-versioning (WIP)

The `auto-version-bump.yml` workflow is available but currently skips documentation-only changes. For code changes to `src/` or `test/`, versioning may happen automatically.

## Watch Progress

```bash
# View in browser:
open https://github.com/kanr/node-red-contrib-couchdb-nodes/actions

# Or use GitHub CLI:
gh run list
gh run watch
```

## Verify Publication

```bash
# Check npm
npm view node-red-contrib-couchdb-nodes

# Test installation
npm install node-red-contrib-couchdb-nodes
```

## Files Included in Package

✅ **src/** - All node implementations
✅ **README.md** - Package documentation  
✅ **LICENSE** - MIT license

❌ **test/** - Excluded (not needed in package)
❌ **.github/** - Excluded (CI/CD files)
❌ **node_modules/** - Excluded (dependencies)

## Common Commands

```bash
# Preview what will be published
npm pack --dry-run

# Check package size
npm pack
ls -lh *.tgz

# View current version
node -p "require('./package.json').version"

# List all your tags
git tag -l

# Delete a tag (if mistake)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

## Troubleshooting

### Token not working?
- Regenerate npm token (Automation type)
- Update GitHub secret: NPM_TOKEN
- Re-run workflow

### Version already exists?
```bash
npm version patch
git push origin main --tags
```

### Tests failing?
```bash
npm test
# Fix any errors, then try again
```

## Full Documentation

📖 **Complete Guide**: [.github/PUBLISHING.md](.github/PUBLISHING.md)
🔧 **Workflows**: [.github/workflows/README.md](.github/workflows/README.md)
🤖 **Agent Guide**: [AGENTS.md](../AGENTS.md)

## Need Help?

Run the setup script:
```bash
.github/scripts/setup-npm-publish.sh
```

Or check:
- npm docs: https://docs.npmjs.com/
- GitHub Actions: https://github.com/kanr/node-red-contrib-couchdb-nodes/actions
