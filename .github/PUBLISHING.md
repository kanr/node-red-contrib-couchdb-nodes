# Publishing to npm via GitHub Actions

This guide walks you through publishing your Node-RED CouchDB nodes package to npm using GitHub Actions automation.

## 📋 Prerequisites

- [ ] GitHub repository with your package
- [ ] npm account (create at https://www.npmjs.com/signup)
- [ ] Package name available on npm
- [ ] All tests passing locally (`npm test`)

## 🔐 Step 1: Create npm Access Token

1. **Login to npm**:
   ```bash
   npm login
   ```
   Or visit: https://www.npmjs.com/login

2. **Generate Access Token**:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click **"Generate New Token"**
   - Select **"Automation"** token type
   - Name it: `GitHub Actions - node-red-contrib-couchdb-nodes`
   - Click **"Generate Token"**
   - **Copy the token** (you won't see it again!)

**Token format**: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🔒 Step 2: Add Token to GitHub Secrets

1. **Go to your GitHub repository**:
   ```
   https://github.com/kanr/node-red-contrib-couchdb-nodes/settings/secrets/actions
   ```

2. **Create new secret**:
   - Click **"New repository secret"**
   - Name: `NPM_TOKEN`
   - Value: (paste your npm token)
   - Click **"Add secret"**

3. **Verify**:
   - You should see `NPM_TOKEN` listed under "Repository secrets"
   - Value will be hidden (shown as `***`)

## 📦 Step 3: Prepare Your Package

### Verify package.json

Your package.json is already configured with:

```json
{
  "name": "node-red-contrib-couchdb-nodes",
  "version": "1.0.0",
  "description": "Node-RED nodes for CouchDB CRUD operations",
  "main": "src/nodes/index.js",
  "files": [
    "src/",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### Check package name availability

```bash
npm view node-red-contrib-couchdb-nodes

# If package doesn't exist, you'll see:
# npm ERR! code E404
# npm ERR! 404 Not Found

# This is good - name is available!
```

### Create README.md (if not exists)

```bash
cat > README.md << 'EOF'
# node-red-contrib-couchdb-nodes

Node-RED nodes for Apache CouchDB database operations.

## Installation

```bash
npm install node-red-contrib-couchdb-nodes
```

## Features

- 🔌 Server configuration node
- 📝 CRUD operations (Create, Read, Update, Delete)
- 🔍 Query nodes with CouchDB views
- 📊 Database management (create, delete, list)
- 📄 Document listing with pagination

## Nodes

### Configuration
- **couchdb-server** - CouchDB server connection configuration

### Operations
- **couchdb-insert** - Insert/create documents
- **couchdb-get** - Retrieve documents by ID
- **couchdb-update** - Update existing documents
- **couchdb-query** - Query using CouchDB views
- **couchdb-create-db** - Create databases
- **couchdb-delete-db** - Delete databases
- **couchdb-list-dbs** - List all databases
- **couchdb-list-docs** - List documents with pagination

## Usage

1. Add a **couchdb-server** config node with your CouchDB connection details
2. Use operation nodes to interact with your database
3. Connect nodes to build your flow

## Requirements

- Node.js >= 10.0.0
- Node-RED >= 1.0.0
- Apache CouchDB >= 2.0

## License

MIT
EOF
```

### Create LICENSE file (if not exists)

```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 kanr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

### Create .npmignore (optional)

```bash
cat > .npmignore << 'EOF'
# Test files
test/
*.test.js

# Development files
.github/
.mocharc.json
node_modules/

# Git files
.git
.gitignore

# macOS
.DS_Store

# Logs
*.log
npm-debug.log*
EOF
```

## 🚀 Step 4: Publish Your First Version

### Option A: Automatic (via GitHub Actions - Recommended)

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Prepare for npm publishing"
   git push origin main
   ```

2. **Create and push a version tag**:
   ```bash
   # Tag format: v1.0.0, v1.1.0, etc.
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Watch GitHub Actions**:
   - Go to: https://github.com/kanr/node-red-contrib-couchdb-nodes/actions
   - Click the **"Release"** workflow run
   - Monitor progress (usually 2-3 minutes)

4. **Verify publication**:
   ```bash
   # Wait ~1 minute after workflow completes
   npm view node-red-contrib-couchdb-nodes
   ```

### Option B: Manual (one-time)

For your first publish, you can do it manually:

```bash
# 1. Login to npm
npm login

# 2. Test what will be published
npm pack --dry-run

# 3. Publish to npm
npm publish --access public

# 4. Verify
npm view node-red-contrib-couchdb-nodes
```

Then set up GitHub Actions for future releases.

## 🔄 Publishing Updates

### Recommended: Version Bump via Pull Request

This is the recommended approach for consistent version management:

```bash
# 1. Create branch from latest main
git fetch origin
git checkout -b bump/version-X.Y.Z origin/main

# 2. Update package.json version manually
# Edit: "version": "X.Y.Z"

# 3. Update package-lock.json  
npm install --package-lock-only

# 4. Commit and push
git add package.json package-lock.json
git commit -m "Bump version to X.Y.Z"
git push -u origin bump/version-X.Y.Z

# 5. Create PR, get review, merge
gh pr create --title "Bump version to X.Y.Z" --body "Version bump"
# Review and merge via GitHub UI or: gh pr merge --merge

# 6. Create and push release tag
git checkout main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

**GitHub Actions will then:**
- ✅ Run all tests
- ✅ Verify version matches tag
- ✅ Check if version already exists on npm
- ✅ Publish to npm (if new version)
- ✅ Create GitHub Release

### Semantic Versioning Guide

- **Patch** (0.1.0 → 0.1.1): Bug fixes, minor changes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

## 🔍 Verification

### Check npm package

```bash
# View package info
npm view node-red-contrib-couchdb-nodes

# View specific version
npm view node-red-contrib-couchdb-nodes@1.0.0

# View all versions
npm view node-red-contrib-couchdb-nodes versions

# Test installation
npm install node-red-contrib-couchdb-nodes
```

### Check package page

Visit: https://www.npmjs.com/package/node-red-contrib-couchdb-nodes

Should show:
- ✅ Package description
- ✅ Version number
- ✅ Installation command
- ✅ README content
- ✅ Keywords (searchable)

### Check Node-RED flows

Visit: https://flows.nodered.org/
- Your package should appear in search within 24 hours
- Users can install via Node-RED palette manager

## 🎯 Workflow Details

### What Happens When You Push a Tag

1. **Test Workflow** (`test.yml`):
   - Runs on Node v10, v12, v14, v16, v18
   - Executes full test suite
   - Verifies package structure
   - Publishes to npm (if tag starts with `v`)

2. **Release Workflow** (`release.yml`):
   - Checks out code
   - Runs tests
   - Verifies tag version matches package.json
   - Checks if version already exists on npm
   - Publishes to npm (if new version)
   - Creates GitHub Release with changelog

### Automatic Safeguards

- ✅ **Version Check**: Won't republish existing versions
- ✅ **Test Requirement**: All tests must pass
- ✅ **Tag Validation**: Tag must match package.json version
- ✅ **Public Access**: Configured for public npm packages

## ❌ Troubleshooting

### Error: "npm ERR! code ENEEDAUTH"

**Problem**: npm token not configured or invalid

**Solution**:
```bash
# 1. Generate new npm token (Automation type)
# 2. Update GitHub secret NPM_TOKEN
# 3. Re-run the workflow
```

### Error: "npm ERR! code E403"

**Problem**: Permission denied (package name taken or you don't own it)

**Solution**:
```bash
# Check if package exists and who owns it
npm view node-red-contrib-couchdb-nodes

# If you own it, ensure npm token has publish permissions
# If someone else owns it, change package name in package.json
```

### Error: "Version already exists"

**Problem**: You're trying to publish a version that's already on npm

**Solution**:
```bash
# Update to a new version number in package.json
# Then update lockfile
npm install --package-lock-only

# Create PR, merge, then tag
git tag vX.Y.Z
git push origin vX.Y.Z
```

### GitHub Actions failing

**Check workflow logs**:
1. Go to: https://github.com/kanr/node-red-contrib-couchdb-nodes/actions
2. Click the failed run
3. Expand failed job
4. Review error messages

**Common fixes**:
- Ensure `NPM_TOKEN` secret is set
- Verify tests pass locally: `npm test`
- Check package.json syntax: `node -e "require('./package.json')"`

## 📊 Release Checklist

Before creating a release:

- [ ] All tests passing: `npm test`
- [ ] Version updated in package.json
- [ ] package-lock.json updated: `npm install --package-lock-only`
- [ ] README.md is current
- [ ] LICENSE file exists
- [ ] CHANGELOG updated (optional)
- [ ] GitHub secret `NPM_TOKEN` configured
- [ ] Package name available on npm

Then:

```bash
git push origin main --tags
```

## 🔗 Useful Commands

```bash
# Check current version
node -p "require('./package.json').version"

# List all tags
git tag -l

# Delete a tag (if mistake)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# View what will be published
npm pack --dry-run

# Check package size
npm pack
ls -lh *.tgz
tar -tzf *.tgz
rm *.tgz

# Unpublish (within 72 hours)
npm unpublish node-red-contrib-couchdb-nodes@1.0.0

# Deprecate a version
npm deprecate node-red-contrib-couchdb-nodes@1.0.0 "Use v1.0.1 instead"
```

## 🎉 Success!

Once published, users can install your package:

```bash
# In their Node-RED installation
npm install node-red-contrib-couchdb-nodes

# Or via Node-RED palette manager UI
# Manage palette → Install → Search for "couchdb"
```

## 📚 Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm Access Tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Actions npm Publishing](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [Node-RED Creating Nodes](https://nodered.org/docs/creating-nodes/)
- [Semantic Versioning](https://semver.org/)

## Need Help?

- npm support: https://www.npmjs.com/support
- GitHub Actions: https://github.com/kanr/node-red-contrib-couchdb-nodes/actions
- Node-RED forum: https://discourse.nodered.org/
