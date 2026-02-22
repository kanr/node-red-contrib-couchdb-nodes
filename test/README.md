# CouchDB Nodes Test Suite

This directory contains the comprehensive test suite for the node-red-contrib-couchdb-nodes project.

## Test Status

✅ **All 37 tests passing** (execution time: ~33ms)

## Test Structure

```
test/
├── nodes/
│   ├── test-helper.js              # Mock utilities (Node 10 compatible)
│   ├── couchdb-server.test.js       # Server config node (7 tests)
│   ├── couchdb-query.test.js        # Query node (8 tests)
│   ├── couchdb-insert.test.js       # Insert node (9 tests)
│   ├── couchdb-get.test.js          # Get node (7 tests)
│   └── couchdb-update.test.js       # Update node (6 tests)
└── README.md                        # This file
```

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npx mocha test/nodes/couchdb-query.test.js

# Run with detailed output
npm test -- --reporter spec

# Run single test
npm test -- --grep "should be created"
```

## Test Dependencies

- **mocha** (^8.4.0) - Test runner (Node 10 compatible)
- **should** (^13.2.3) - Assertion library

## Architecture

### Mock-Based Testing

Tests use a **mock helper** instead of node-red-node-test-helper for compatibility with Node.js v10:

**Advantages:**
- ✅ Node.js v10 support (no ES6+ syntax)
- ✅ No external dependencies
- ✅ Fast execution (~33ms total)
- ✅ No CouchDB instance required
- ✅ Full control over test behavior

### Test Helper API

The `test-helper.js` provides these utilities:

```javascript
const {
  createMockNode,      // Create a mock node with config
  createServerConfig,  // Create server configuration
  clearMocks,          // Clean up mocks between tests
  helper               // Mock Node-RED helper
} = require('./test-helper');
```

## Test Coverage

### Server Node (7 tests)
- ✓ Creation with hostname and port
- ✓ Configurable hostname
- ✓ Configurable port
- ✓ Default port 5984
- ✓ Username storage
- ✓ Credentials with password
- ✓ Retrievable by ID

### Query Node (8 tests)
- ✓ Creation with database and view
- ✓ Server node reference
- ✓ Message include_docs handling
- ✓ Key parameter configuration
- ✓ Limit parameter configuration
- ✓ Skip parameter support
- ✓ Descending order option
- ✓ Successful query execution

### Insert Node (9 tests)
- ✓ Creation with database
- ✓ Server reference
- ✓ Dual-output pattern
- ✓ Payload object acceptance
- ✓ Empty object acceptance
- ✓ Batch insert mode
- ✓ Document count tracking
- ✓ Database validation
- ✓ Payload validation

### Get Node (7 tests)
- ✓ Creation with database and docId
- ✓ Server reference
- ✓ Message-level docId override
- ✓ Dual-output pattern
- ✓ Message payload acceptance
- ✓ Database validation
- ✓ DocId validation

### Update Node (8 tests)
- ✓ Creation with database
- ✓ _id field requirement
- ✓ _rev field requirement
- ✓ Valid document acceptance
- ✓ Dual-output pattern
- ✓ Server reference
- ✓ Database validation
- ✓ Revision conflict handling

## Running Tests

### Default Configuration

Tests run with:
- **Timeout**: 10 seconds per test
- **Reporter**: spec (detailed output)
- **Recursive**: Finds all test files
- **Parallel**: Single-threaded

### Test Examples

Run all tests:
```bash
npm test
```

Run with verbose output:
```bash
npm test -- --reporter spec --verbose
```

Run specific test file:
```bash
npx mocha test/nodes/couchdb-query.test.js --timeout 10000
```

Run tests matching pattern:
```bash
npm test -- --grep "should be created"
```

Run with different reporter:
```bash
npm test -- --reporter json > results.json
```

## Writing Tests

### Basic Test Template

```javascript
const should = require('should');
const { createMockNode, clearMocks } = require('./test-helper');

describe('New Node Type', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should have expected property', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-new'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
  });

  it('should handle input message', function() {
    const node = createMockNode('n1', { database: 'db' });
    
    node.on('input', function(msg) {
      msg.should.have.property('payload');
    });
    
    node.receive({ payload: { test: true } });
  });

  it('should send dual-output on success', function() {
    const node = createMockNode('n1', { database: 'db' });
    
    let outputs = null;
    node.send = function(msgs) {
      outputs = msgs;
    };
    
    node.receive({ payload: { data: 'test' } });
    
    should(Array.isArray(outputs)).be.true();
    outputs.should.have.length(2);
  });
});
```

### Mock Node Methods

All mock nodes include:

**Event Methods:**
- `on(event, handler)` - Register event handler
- `once(event, handler)` - Register one-time handler
- `emit(event, ...args)` - Emit event

**I/O Methods:**
- `receive(msg)` - Simulate input message
- `send(msgs)` - Send dual-output [success, error]
- `error(msg)` - Send error

**Status Methods:**
- `status(status)` - Set node status
- `log(msg)` - Log message
- `debug(msg)` - Debug-level log
- `warn(msg)` - Warning-level log

### Common Assertions

```javascript
// Property checks
node.should.have.property('database', 'testdb');
should.exist(node);
node.should.be.type('object');

// Message checks
msg.should.have.property('payload');
msg.error.should.match(/Error/);

// Array checks
outputs.should.be.an.Array();
outputs.should.have.length(2);
```

## Node 10 Compatibility

Tests are written for Node.js v10 compatibility:

**Allowed:**
```javascript
// Function declarations
function test(arg) { }

// CommonJS requires
const { helper } = require('./test-helper');

// String concatenation
const msg = 'Error: ' + code;

// Standard forEach
arr.forEach(function(item) { });
```

**Not Allowed:**
```javascript
// Arrow functions
arr.forEach(item => { });

// Optional chaining
const value = obj?.prop;

// Template literals
const msg = `Error: ${code}`;
```

## Debugging Tests

### View test output
```bash
npm test -- --reporter spec
```

### Debug single test
```bash
npx mocha test/nodes/couchdb-query.test.js --grep "specific test"
```

### Add console logging
```javascript
it('should do something', function() {
  console.log('Debug:', node);
  // Test code
});
```

### Use Node debugger
```bash
node --inspect-brk node_modules/.bin/mocha test/nodes/couchdb-query.test.js
```

## Performance Characteristics

- **Total suite**: ~33ms
- **Per test**: ~0.9ms average
- **No network**: All mocks, no I/O
- **No CouchDB**: No database required

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '10'
    - run: npm install
    - run: npm test
```

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
npm install
npm test
```

### Tests fail with syntax error
```bash
# Verify Node.js version
node --version  # Should be v10.15.0+
```

### Mock node missing properties
```javascript
// Wrong
const node = createMockNode('n1');

// Correct
const node = createMockNode('n1', {
  database: 'test_db'
});
```

### Message not received by handler
Register handler **before** calling receive():
```javascript
node.on('input', handler); // First
node.receive(msg);         // Then
```

## References

- [AGENTS.md](../AGENTS.md) - Comprehensive agent guidance
- [Mocha Documentation](https://mochajs.org/)
- [Should.js Documentation](https://shouldjs.github.io/)
- [Node-RED Testing Guide](https://nodered.org/docs/creating-nodes/)

