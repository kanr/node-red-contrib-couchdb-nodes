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