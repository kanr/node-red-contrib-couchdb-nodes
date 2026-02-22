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

## Publish New Version (30 seconds)

```bash
# Update version
npm version patch   # 1.0.0 → 1.0.1
# or
npm version minor   # 1.0.0 → 1.1.0
# or
npm version major   # 1.0.0 → 2.0.0

# Push with tags
git push origin main --tags

# Done! GitHub Actions will:
# ✅ Run tests
# ✅ Publish to npm
# ✅ Create GitHub Release
```

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
