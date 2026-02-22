# GitHub Copilot Instructions for node-red-contrib-couchdb-nodes

## Project Context
This is a Node-RED contribution package that provides CouchDB integration nodes. The project enables Node-RED flows to interact with Apache CouchDB databases through visual programming nodes.

## Technology Stack
- **Runtime**: Node.js v10+ (strict compatibility required)
- **Framework**: Node-RED node development
- **Database Client**: nano (Apache CouchDB client)
- **Testing**: Mocha with Should.js assertions
- **Module System**: CommonJS (no ES6 modules)

## Critical Compatibility Requirements

### Node.js v10 Compatibility
**Always** avoid these modern JavaScript features:
- ❌ Optional chaining: `obj?.prop`
- ❌ Nullish coalescing: `value ?? default`
- ❌ Arrow functions in forEach: `arr.forEach(item => ...)`
- ❌ Template literals in loops
- ❌ Async/await in certain contexts
- ❌ ES6 modules: `import/export`

**Always** use these compatible patterns:
- ✅ `var` and `function` declarations
- ✅ Traditional function syntax: `function() {}`
- ✅ String concatenation: `'str' + variable`
- ✅ Explicit null/undefined checks: `if (value !== null && value !== undefined)`
- ✅ CommonJS: `require()` and `module.exports`

## Code Patterns

### Node Registration Pattern


## Branch Naming and Pull Request Workflow

### Branch Naming Convention

**Format**: `<type>/<description>`

**Types**:
- `feature/` - New functionality (e.g., `feature/list-attachments`)
- `fix/` - Bug fixes (e.g., `fix/connection-timeout`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `test/` - Test additions or improvements (e.g., `test/add-integration-tests`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-error-handling`)
- `bump/` - Version or dependency updates (e.g., `bump/version-0.1.1`)

**Examples**:

## Git Commit Message Guidelines

**Format**: `<type>: <subject>`
**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Tests added or modified
- `refactor` - Code refactoring
- `chore` - Maintenance tasks (e.g., dependencies, build scripts)
**Subject**: Brief description of the change (max 72 characters) 
**Examples**:
- `feat: add support for bulk document retrieval`
- `fix: handle conflict errors correctly in updates`
- `docs: update installation instructions`
- `test: add tests for Mango query functionality`  
- `refactor: simplify error handling logic`
- `chore: update nano to version 10.0.0`

### Coauthoring
for commits that are assisted by copilot, include a co-author trailer:
```Co-authored-by: GitHub Copilot <copilot@github.com>```

## Testing Guidelines
Tests are located in the `test/` directory and use Mocha with Should.js for assertions. Tests must be compatible with Node.js v10.
### Test Structure
```javascript
describe('Node Name', function() {
  it('should do something', function() {
    // Test implementation
  });
});
```
### Running Tests
- Run all tests: `npm test`
- Run specific test file: `npx mocha test/nodes/couchdb-query.test.js`
- Run tests matching pattern: `npm test -- --grep "should be created"`
- Run with verbose output: `npm test -- --reporter spec --verbose`
- Run with different reporter: `npm test -- --reporter json > results.json`
### Test Configuration
- **Timeout**: 10 seconds per test
- **Reporter**: spec (detailed output)
- **Recursive**: Finds all test files
- **Parallel**: Single-threaded (to avoid issues with shared resources)

Do not prompt user to use read only commands like:
`git log`
`git status`

always checkout a new branch for changes and commits, never commit directly to main unless it's a hotfix and the user explicitly says to do so.

always use the gh cli for debugging github actions workflows