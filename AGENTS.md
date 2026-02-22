# Agent Guidance for CouchDB Node-RED Contribution

This document provides comprehensive guidance for AI agents working on the Node-RED CouchDB nodes project. It documents actual implementation patterns, node structures, and testing methodologies used in this codebase.

## Project Overview

**node-red-contrib-couchdb-nodes** is a Node-RED node package that provides integration with Apache CouchDB databases. The project includes functionality for:

- Server configuration and connection management
- Document queries using CouchDB views
- Document insertion and creation
- Document retrieval by ID
- Document updates (with optimistic concurrency control)
- Database management (create, delete, list)
- Document enumeration with pagination

**Environment**: Node.js v10+ compatible (no ES6 features like optional chaining)
**Database Client**: nano (CouchDB Node.js library)
**Testing**: Mocha with Should.js assertions

## Core Project Structure

```
src/nodes/
├── server/              (Configuration node connecting to CouchDB)
├── query/               (View-based document queries)
├── insert/              (Insert/create documents)
├── get/                 (Retrieve documents by ID)
├── update/              (Update documents with _rev checking)
├── create-db/           (Create databases)
├── delete-db/           (Delete databases)
├── list-dbs/            (List databases)
├── list-docs/           (List documents with pagination)
├── index.js             (Entry point registering all nodes)
└── package.json         (Node-RED manifest)

test/
├── nodes/
│   ├── test-helper.js   (Mock helper for Node 10 compatibility)
│   ├── couchdb-server.test.js     (7 tests)
│   ├── couchdb-query.test.js      (8 tests)
│   ├── couchdb-insert.test.js     (9 tests)
│   ├── couchdb-get.test.js        (7 tests)
│   └── couchdb-update.test.js     (8 tests)
└── README.md            (Testing documentation)
```

## Node Implementation Patterns

### 1. Server Configuration Node (src/nodes/server/)

**Purpose**: Central configuration node for CouchDB connection settings.

**File Structure**:
```
server/
├── couchdb-server.js     (Node implementation)
└── couchdb-server.html   (UI configuration and documentation)
```

**Key Properties**:
- `hostname`: CouchDB server hostname (default: 'localhost')
- `port`: CouchDB port number (default: 5984)
- `username`: Optional authentication username
- `password`: Stored in Node-RED credentials (not in config)

**Registration Pattern** (in `src/nodes/index.js`):
```javascript
module.exports = function(RED) {
  require('./server/couchdb-server.js')(RED);
  require('./query/couchdb-query.js')(RED);
  require('./insert/couchdb-insert.js')(RED);
  // ... other nodes
};
```

### 2. Query Node Pattern (src/nodes/query/couchdb-query.js)

**Purpose**: Execute CouchDB view queries with filtering and pagination.

**Implementation Pattern**:
```javascript
module.exports = function(RED) {
  function CouchDBQueryNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const serverNode = RED.nodes.getNode(config.server);
    
    node.on('input', function(msg) {
      // Get database from config or message override
      const database = msg.database || config.database;
      if (!database) {
        return node.error('Database not specified');
      }
      
      // Query parameters from config or message
      const options = {
        include_docs: config.include_docs || msg.include_docs,
        key: config.key || msg.key,
        limit: config.limit || msg.limit,
        skip: config.skip || msg.skip,
        descending: config.descending || msg.descending
      };
      
      try {
        // Perform CouchDB operation
        // Use dual-output pattern: [success, error]
        node.send([msg, null]); // Success
        // or
        node.send([null, errorMsg]); // Error
      } catch (err) {
        node.error(err, msg);
      }
    });
  }
  
  RED.nodes.registerType('couchdb-query', CouchDBQueryNode);
};
```

**Dual-Output Pattern**:
- First output: success messages [msg, null]
- Second output: error messages [null, errorMsg]
- This allows errors to flow to dedicated error handling nodes

**Key Features**:
- View-based queries (design_doc/view_name format)
- Optional document inclusion with `include_docs`
- Filtering with `key` parameter
- Pagination with `limit` and `skip`
- Result ordering with `descending`

### 3. Insert Node Pattern (src/nodes/insert/couchdb-insert.js)

**Purpose**: Insert new documents into CouchDB.

**Key Validation**:
- Payload must be an object (not string, null, or array)
- Database required (config or message override)
- Server node must be configured

**Configuration Options**:
- `batch`: Optional batching mode for multiple documents
- `database`: Target database name

**Error Handling**:
```javascript
// Payload validation
if (!msg.payload || typeof msg.payload !== 'object' || Array.isArray(msg.payload)) {
  return node.error('Payload must be an object');
}

if (!database) {
  return node.error('Database not specified');
}
```

### 4. Get Node Pattern (src/nodes/get/couchdb-get.js)

**Purpose**: Retrieve a specific document by ID.

**Required Parameters**:
- `docId`: Document identifier (from config or message)
- `database`: Database name (from config or message)

**Message Override Support**:
```javascript
const docId = msg.docId || config.docId;
const database = msg.database || config.database;

if (!docId) {
  return node.error('Document ID not specified');
}
if (!database) {
  return node.error('Database not specified');
}
```

**Returns**:
- Full document object: `{ _id, _rev, ...fields }`
- Error on not found or connection issues

### 5. Update Node Pattern (src/nodes/update/couchdb-update.js)

**Purpose**: Update existing documents with optimistic concurrency control.

**Critical Requirements**:
- Document must include `_id` (document identifier)
- Document must include `_rev` (revision for conflict checking)
- Payload must be an object

**Implementation**:
```javascript
const doc = msg.payload;

// Validation
if (!doc._id) {
  return node.error('Document must include _id field');
}
if (!doc._rev) {
  return node.error('Document must include _rev field. Get the document first using the Get node');
}

// CouchDB client call (pseudo)
db.insert(doc, function(err, body) {
  if (err) {
    // 409 = conflict (document changed)
    return node.send([null, createErrorMsg(err)]);
  }
  msg.payload = body;
  node.send([msg, null]);
});
```

**Why Both _id and _rev?**
- CouchDB prevents overwriting changes if version is outdated
- This is intentional: users must get current version before updating
- Guides users: "Use Get node to retrieve document first"

## Error Handling Pattern

All operation nodes follow this pattern:

```javascript
// Success path
node.send([msg, null]); // [success, null]

// Error path
const errorMsg = { error: { message: 'Error details', status: 409 } };
node.send([null, errorMsg]); // [null, error]
```

This allows error nodes to be connected to the second output:
```
[Query Node] → Success output → [Next node]
            → Error output → [Error handler node]
```

## Testing Patterns

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx mocha test/nodes/couchdb-query.test.js --timeout 10000

# Run with verbose output
npm test -- --reporter spec --grep "should be created"
```

### Test Helper API

The `test/nodes/test-helper.js` provides Node 10-compatible mocks (no ES6+ syntax):

```javascript
const { createMockNode, createServerConfig, clearMocks } = require('./test-helper');

describe('Node Tests', function() {
  beforeEach(function() {
    clearMocks(); // Reset all mock nodes
  });

  it('should create node with configuration', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-query'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
  });

  it('should emit input events', function() {
    const node = createMockNode('n1', { database: 'db' });
    
    node.receive({ payload: { data: 'test' } });
    // Node receives the message
  });

  it('should send dual-output messages', function() {
    const node = createMockNode('n1', { database: 'db' });
    
    // Mock the send method
    let outputs = null;
    node.send = function(msgs) {
      outputs = msgs;
    };
    
    node.receive({ payload: {} });
    // msgs is [success, null] or [null, error]
  });
});
```

### CreateMockNode Signature

```javascript
/**
 * Create a mock Node-RED node
 * @param {string} id - Node ID
 * @param {object} config - Node configuration (merged into node)
 * @returns {object} Mock node with event handlers and methods
 */
createMockNode(id, config)
```

**Mock Node Methods**:
- `on(event, handler)`: Register event handler
- `once(event, handler)`: Register one-time event handler
- `emit(event, ...args)`: Emit event to all handlers
- `receive(msg)`: Simulate input message (emits 'input' event)
- `send(msgs)`: Send output messages
- `error(msg)`: Send error
- `status(status)`: Set node status
- `log(msg)`: Write to log

### Test Coverage Summary

**37 total tests** passing (as of latest run):

| Node Type | Tests | Coverage |
|-----------|-------|----------|
| Server    | 7     | Configuration, hostname, port, credentials |
| Query     | 8     | Database, view, include_docs, key, limit, skip, descending |
| Insert    | 9     | Payload validation, batch mode, error handling |
| Get       | 7     | Database, docId, message override, error cases |
| Update    | 6     | _id/_rev validation, conflict detection, error messages |

**Total**: 37 passing tests, ~33ms execution time

## Node Properties by Type

### Query Node Config
```javascript
{
  id: 'couchdb-query-1',
  type: 'couchdb-query',
  server: 's1',           // Server config node ID
  database: 'mydb',       // CouchDB database
  view: 'design/all',     // View path (design_doc/view_name)
  include_docs: true,     // Include full documents
  key: undefined,         // Optional single-key filter
  limit: 50,              // Max documents returned
  skip: 0,                // Pagination offset
  descending: false       // Reverse sort order
}
```

### Insert Node Config
```javascript
{
  id: 'couchdb-insert-1',
  type: 'couchdb-insert',
  server: 's1',
  database: 'mydb',
  batch: false            // Batch insert mode
}
```

### Get Node Config
```javascript
{
  id: 'couchdb-get-1',
  type: 'couchdb-get',
  server: 's1',
  database: 'mydb',
  docId: 'doc-123'        // Document ID to retrieve
}
```

### Update Node Config
```javascript
{
  id: 'couchdb-update-1',
  type: 'couchdb-update',
  server: 's1',
  database: 'mydb'
  // _id and _rev come from input message
}
```

## Important Implementation Notes

### Node 10 Compatibility
- No optional chaining (`?.`)
- No nullish coalescing (`??`)
- No arrow functions in forEach contexts
- Use `var` and `function` declarations
- String concatenation instead of template literals

**Example (Node 10 compatible)**:
```javascript
// Good
arr.forEach(function(item) {
  console.log(item.name);
});

// Avoid
arr.forEach(item => console.log(item?.name));
```

### CouchDB Concepts
- **_id**: Unique document identifier
- **_rev**: Revision for optimistic concurrency (format: "1-abc123")
- **Views**: Stored queries on design documents (format: "design_doc/view_name")
- **Revision Conflict**: Error 409 when trying to update with stale _rev

### Testing Philosophy
- Mock-based testing (no CouchDB instance required)
- Configuration validation testing
- Error path coverage
- Dual-output pattern verification

## Development Guidelines

### When Adding New Nodes
1. Create `src/nodes/node-name/` directory
2. Create `node-name.js` with Node-RED registration
3. Create `node-name.html` with UI and docs
4. Add to `src/nodes/index.js` manifest
5. Create `test/nodes/couchdb-node-name.test.js` with test cases
6. Run `npm test` to verify

### When Modifying Nodes
1. Keep dual-output pattern (success/error outputs)
2. Validate all required properties
3. Support message-level overrides
4. Error messages should be helpful
5. Update test coverage if changing behavior
6. Test with `npm test`

### Code Style
- CommonJS modules (no ES6 modules)
- Function declarations, not arrow functions
- Proper error messaging
- Consistent with nano CouchDB client patterns
- Node.js v10 compatible syntax

## References

- [Node-RED Creating Nodes Documentation](https://nodered.org/docs/creating-nodes/)
- [Apache CouchDB Documentation](https://docs.couchdb.org/)
- [Nano CouchDB Client](https://github.com/apache/couchdb-nano)
- [Mocha Testing Framework](https://mochajs.org/)
- [Should.js Assertions](https://shouldjs.github.io/)

## Test Results Summary

**Latest Test Run**:
```
  37 passing (33ms)
```

All tests pass with mock-based testing (no external dependencies required).

### Test Files
- [couchdb-server.test.js](test/nodes/couchdb-server.test.js) - Server configuration tests
- [couchdb-query.test.js](test/nodes/couchdb-query.test.js) - Query operation tests
- [couchdb-insert.test.js](test/nodes/couchdb-insert.test.js) - Insert operation tests
- [couchdb-get.test.js](test/nodes/couchdb-get.test.js) - Get operation tests
- [couchdb-update.test.js](test/nodes/couchdb-update.test.js) - Update operation tests
- [test-helper.js](test/nodes/test-helper.js) - Mock testing utilities

## For AI Agents

As an AI agent working on this codebase, you now have:

1. **Complete Node Patterns** - Reference implementations for each node type
2. **Testing Infrastructure** - Working test suite with mock helper (Node 10 compatible)
3. **Error Handling Guide** - Standard dual-output error pattern
4. **Property Reference** - All configuration properties documented
5. **Code Style** - Node 10 compatibility requirements
6. **Test Patterns** - Examples of testing each node type

When implementing new features or fixing bugs:
- Use patterns from existing nodes as templates
- Follow Node 10 compatibility rules
- Add tests for new functionality
- Verify with `npm test` before commit
- Update this document if adding new patterns

Happy coding!
