# Agents

## Overview

This document provides guidance for AI agents (GitHub Copilot, automated tools) working on the `node-red-contrib-couchdb-nodes` project. It includes embedded examples, patterns, and best practices to ensure consistency and quality.

## Node-RED Development Guidelines

### Core Principles

Based on [Node-RED creating nodes documentation](https://nodered.org/docs/creating-nodes/), this project follows these principles:

1. **Well-defined purpose** - Each node serves a single, clear purpose
2. **Simple to use** - Hide CouchDB complexity behind intuitive interfaces
3. **Forgiving input** - Handle various message property types gracefully
4. **Consistent output** - Predictable message transformations
5. **Comprehensive error handling** - Always catch errors; don't let uncaught errors stop flows
6. **Test** - always run tests and update tests where applicable
7. **Git** - always checkout to a new branch to make changes


### Node-RED Node Structure

All CouchDB nodes follow this pattern. Configuration nodes are retrieved and server connections are established in the registration function:

```javascript
module.exports = function(RED) {
  function CouchDBExampleNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // Get server configuration
    const serverConfig = RED.nodes.getNode(config.server);
    if (!serverConfig) {
      node.error("CouchDB server not configured");
      return;
    }

    // Initialize nano client with connection string
    const nano = require('nano');
    const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
    const couchdb = nano(url);

    // Handle incoming messages
    node.on('input', function(msg) {
      const database = config.database || msg.database;
      
      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        // Perform operation
        db.operation((err, result) => {
          if (err) {
            node.error(`Operation failed: ${err.message}`, msg);
            msg.error = { code: err.code, message: err.message, status: err.status };
            node.send([null, msg]);  // Error on second output
          } else {
            msg.payload = result;
            node.send([msg, null]); // Success on first output
            node.status({ fill: "green", shape: "dot", text: "success" });
          }
        });
      } catch (error) {
        node.error(`Connection error: ${error.message}`, msg);
        msg.error = error;
        node.send([null, msg]);
      }
    });

    node.on("close", function() {
      node.status({ fill: "grey", shape: "ring", text: "disconnected" });
    });
  }
  
  RED.nodes.registerNodeType("couchdb-example", CouchDBExampleNode);
};
```

**Key Pattern Details:**
- Dual output: Success messages on first output, errors on second
- Server config retrieved via `RED.nodes.getNode(config.server)`
- Connection string includes credentials: `http://username:password@hostname:port`
- All operations use callbacks (nano v10 API)
- Node status provides visual feedback during operations

## CouchDB Node Patterns

### Pattern 1: Query Node

**Purpose**: Find documents matching a CouchDB selector

**Use Case**: Search for documents with specific field values

**Real Implementation** (`src/nodes/query/couchdb-query.js`):

```javascript
module.exports = function(RED) {
  function CouchDBQueryNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const serverConfig = RED.nodes.getNode(config.server);
    if (!serverConfig) {
      node.error("CouchDB server not configured");
      return;
    }

    const nano = require('nano');
    const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
    const couchdb = nano(url);

    node.on("input", function(msg) {
      const database = config.database || msg.database;
      let selector = config.selector ? JSON.parse(config.selector) : msg.selector;
      const limit = config.limit || msg.limit || 100;

      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      if (!selector || typeof selector !== 'object') {
        node.error("Selector must be a valid object", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        
        db.find({
          selector: selector,
          limit: limit
        }, (err, result) => {
          if (err) {
            node.error(`Query failed: ${err.message}`, msg);
            msg.error = { code: err.code, message: err.message, status: err.status };
            node.send([null, msg]);
          } else {
            msg.payload = result.docs;
            msg.count = result.docs.length;
            msg.result = result;
            node.send([msg, null]);
            node.status({ fill: "green", shape: "dot", text: `Found: ${result.docs.length} docs` });
          }
        });
      } catch (error) {
        node.error(`Connection error: ${error.message}`, msg);
        msg.error = error;
        node.send([null, msg]);
      }
    });

    node.on("close", function() {
      node.status({ fill: "grey", shape: "ring", text: "disconnected" });
    });
  }

  RED.nodes.registerType("couchdb-query", CouchDBQueryNode);
};
```

**Expected Message Output**:
```javascript
// Success (first output)
{
  payload: [ /* matching documents */ ],
  count: 5,
  result: { docs: [...], warning?: "... results truncated"}
}

// Error (second output)
{
  error: { code: "not_found", message: "Database does not exist", status: 404 }
}
```

**Example Selector Patterns**:
```javascript
// Simple equality
{ "type": "user" }

// Multiple fields
{ "type": "user", "active": true }

// Greater than
{ "age": { "$gt": 18 } }

// Complex query
{ "$and": [{ "type": "article" }, { "published": true }] }
```

### Pattern 2: Insert/Create Node

**Purpose**: Add new documents to database

**Use Case**: Creating records from flow data

**Real Implementation** (`src/nodes/insert/couchdb-insert.js`):

```javascript
module.exports = function(RED) {
  function CouchDBInsertNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const serverConfig = RED.nodes.getNode(config.server);
    if (!serverConfig) {
      node.error("CouchDB server not configured");
      return;
    }

    const nano = require('nano');
    const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
    const couchdb = nano(url);

    node.on("input", function(msg) {
      const database = config.database || msg.database;
      const document = msg.payload;

      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      if (!document || typeof document !== 'object') {
        node.error("Payload must be an object", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        
        db.insert(document, (err, result) => {
          if (err) {
            node.error(`Insert failed: ${err.message}`, msg);
            msg.error = { code: err.code, message: err.message, status: err.status };
            node.send([null, msg]);
          } else {
            msg.result = result;
            msg.docId = result.id;
            msg.docRev = result.rev;
            node.send([msg, null]);
            node.status({ fill: "green", shape: "dot", text: `Inserted: ${result.id}` });
          }
        });
      } catch (error) {
        node.error(`Connection error: ${error.message}`, msg);
        msg.error = error;
        node.send([null, msg]);
      }
    });

    node.on("close", function() {
      node.status({ fill: "grey", shape: "ring", text: "disconnected" });
    });
  }

  RED.nodes.registerType("couchdb-insert", CouchDBInsertNode);
};
```

**Expected Message Output**:
```javascript
// Success (first output)
{
  payload: { "type": "user", "name": "John" },
  docId: "user-123",
  docRev: "1-967a00dff5e02add41819138abb3284d",
  result: { ok: true, id: "user-123", rev: "1-..." }
}

// Error (second output) - e.g., 409 Conflict
{
  error: { code: "conflict", message: "Document already exists", status: 409 }
}
```

### Pattern 3: Update Node

**Purpose**: Modify existing documents

**Use Case**: Updating document fields while preserving revisions

**Real Implementation** (`src/nodes/update/couchdb-update.js`):

```javascript
module.exports = function(RED) {
  function CouchDBUpdateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const serverConfig = RED.nodes.getNode(config.server);
    if (!serverConfig) {
      node.error("CouchDB server not configured");
      return;
    }

    const nano = require('nano');
    const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
    const couchdb = nano(url);

    node.on("input", function(msg) {
      const database = config.database || msg.database;
      const document = msg.payload;

      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      if (!document || typeof document !== 'object') {
        node.error("Payload must be an object", msg);
        return;
      }

      if (!document._id) {
        node.error("Document must have _id field", msg);
        return;
      }

      if (!document._rev) {
        node.error("Document must have _rev field (use Get node first)", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        
        db.insert(document, (err, result) => {
          if (err) {
            node.error(`Update failed: ${err.message}`, msg);
            msg.error = { code: err.code, message: err.message, status: err.status };
            node.send([null, msg]);
          } else {
            msg.result = result;
            msg.docId = result.id;
            msg.docRev = result.rev;
            node.send([msg, null]);
            node.status({ fill: "green", shape: "dot", text: `Updated: ${result.id}` });
          }
        });
      } catch (error) {
        node.error(`Connection error: ${error.message}`, msg);
        msg.error = error;
        node.send([null, msg]);
      }
    });

    node.on("close", function() {
      node.status({ fill: "grey", shape: "ring", text: "disconnected" });
    });
  }

  RED.nodes.registerType("couchdb-update", CouchDBUpdateNode);
};
```

**Important**: The update node requires both `_id` and `_rev` from the current document. Use the Get node first to fetch the document and preserve the revision:

```javascript
// Message from Get node
{
  payload: { _id: "doc-1", _rev: "1-abc123", name: "John", age: 30 },
  docId: "doc-1",
  docRev: "1-abc123"
}

// Modify in flow, then pass to Update node
// Update node will merge payload with existing fields
```

**Error Handling**:
```javascript
// 409 Conflict - revision mismatch (document was updated elsewhere)
{ error: { status: 409, message: "Document update conflict", code: "conflict" } }

// 404 Not Found - document doesn't exist
{ error: { status: 404, message: "missing", code: "not_found" } }
```

## Error Handling Best Practices

This project uses a **dual-output pattern** for error handling: success messages on the first output, errors on the second.

**Dual Output Pattern**:
```javascript
// When operation succeeds (first output receives message)
node.send([msg, null]);

// When operation fails (second output receives message with error)
msg.error = { code: err.code, message: err.message, status: err.status };
node.send([null, msg]);
```

**Common CouchDB Error Codes**:

```javascript
const statusCodes = {
  400: 'Bad Request - Invalid selector syntax, malformed JSON',
  401: 'Unauthorized - Invalid credentials',
  403: 'Forbidden - Insufficient permissions',
  404: 'Not Found - Database or document does not exist',
  409: 'Conflict - Document revision mismatch (update conflict)',
  500: 'Internal Server Error',
  503: 'Service Unavailable - CouchDB not responding'
};
```

**Error Structure in Message**:
```javascript
msg.error = {
  code: 'conflict',           // Error code from CouchDB
  message: 'Document update conflict',  // Human-readable message
  status: 409                 // HTTP status code
};
```

**Implementation Example**:
```javascript
db.find({ selector: {...} }, (err, result) => {
  if (err) {
    node.error(`Query failed: ${err.message}`, msg);
    msg.error = { code: err.code, message: err.message, status: err.status };
    node.send([null, msg]);  // Send error to second output
  } else {
    msg.payload = result.docs;
    node.send([msg, null]);  // Send success to first output
  }
});
```

**Flow-Level Error Handling**:
Downstream nodes can check `msg.error` or connect to the second output catch block:
```
[CouchDB Query] } -- success --> [Process Results]
                 } -- error ----> [Handle Error]
```

## Configuration Nodes

Configuration nodes (stored in `.node-red/`) manage CouchDB server connections and credentials:

**Real Implementation** (`src/nodes/server/couchdb-server.js`):

```javascript
module.exports = function(RED) {
  'use strict';

  function CouchDBServerNode(n) {
    RED.nodes.createNode(this, n);
    this.hostname = n.hostname;
    this.port = n.port || 5984;
    this.username = n.username;
    this.password = this.credentials.password;
  }

  RED.nodes.registerType('couchdb-server', CouchDBServerNode, {
    credentials: {
      password: { type: 'password' }
    }
  });
};
```

**Configuration Properties** (stored in Node-RED settings):
- `hostname`: CouchDB server hostname or IP (e.g., `localhost`, `example.com`)
- `port`: CouchDB port (default: 5984)
- `username`: Authentication username
- `password`: Authentication password (stored securely in NODE_RED_CREDENTIALS)

**Usage in Other Nodes**:
```javascript
// Retrieve server config within any CouchDB node
const serverConfig = RED.nodes.getNode(config.server);
if (!serverConfig) {
  node.error("CouchDB server not configured");
  return;
}

// Build connection URL
const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
const couchdb = require('nano')(url);
```

## Implementation Notes

### Nano Library

This project uses the `nano` library (Apache CouchDB Node.js client):

```javascript
const nano = require('nano');

// Connection with credentials
const couchdb = nano('http://username:password@hostname:5984');

// Select database
const db = couchdb.db.use('my-database');

// Common operations (all use callbacks)
db.find({ selector: {...} }, callback);
db.get(docId, callback);
db.insert(document, callback);
db.destroy(docId, rev, callback);
db.list(options, callback);
```

### Message Flow Patterns

**Configuration Override**: Nodes allow configuration to be overridden by message properties:

```javascript
const database = config.database || msg.database;
const selector = msg.selector || (config.selector ? JSON.parse(config.selector) : {});
const limit = msg.limit || config.limit || 100;
```

**Result Storage**: Both success message and error messages preserve relevant info:

```javascript
// Query node adds these to msg
msg.payload = result.docs;      // The documents
msg.count = result.docs.length; // Count of results
msg.result = result;            // Full nano response

// Insert/Update nodes add revision info
msg.docId = result.id;          // New/updated document ID
msg.docRev = result.rev;        // Revision string (use for updates)
```

## Testing Patterns

When creating tests for CouchDB nodes, follow Node-RED testing conventions:

**Test Setup Structure**:
```javascript
const helper = require('node-red-node-test-helper');
const couch = require('../src/nodes/index.js');

describe('CouchDB Nodes', function() {
  
  beforeEach(function(done) {
    helper.startServer(done);
  });
  
  afterEach(function(done) {
    helper.unload();
    helper.stopServer(done);
  });
  
  it('should find documents with selector', function(done) {
    const flow = [
      { 
        id: "n1", 
        type: "couchdb-query", 
        server: "s1", 
        selector: "{\"type\":\"user\"}" 
      },
      { 
        id: "s1", 
        type: "couchdb-server", 
        hostname: "localhost",
        port: 5984,
        username: "admin",
        credentials: { password: "password" }
      }
    ];
    
    helper.load(couch, flow, function() {
      const n1 = helper.getNode("n1");
      n1.on("output", function(msg) {
        // Assert on first output (success)
        msg.should.have.property('payload');
        msg.payload.should.be.Array();
        done();
      });
      n1.receive({ payload: {} });
    });
  });
});
```

**Testing Error Paths**:
```javascript
it('should handle connection errors', function(done) {
  // ... flow with invalid server ...
  
  helper.load(couch, flow, function() {
    const n1 = helper.getNode("n1");
    n1.on("output", function(msg) {
      // Error comes on second output
      if (msg && msg.error) {
        msg.error.should.have.property('status');
        done();
      }
    });
    n1.receive({ payload: {} });
  });
});
```

**Actual Test Files**:
See repository structure for real test examples:
- `test/nodes/*.test.js` - Node-specific tests
- Run with: `npm test`

## Agent Instructions

When implementing features, bug fixes, or new nodes for this project:

### Code Structure Requirements

1. **Location**: All node implementations in `src/nodes/{nodetype}/` subdirectories
   - Main node logic: `src/nodes/{nodetype}/couchdb-{nodetype}.js`
   - HTML/UI file: `src/nodes/{nodetype}/couchdb-{nodetype}.html`
   - Index registration: `src/nodes/index.js` (imports from subdirectories)

2. **Follow Dual-Output Pattern**:
   - Success: `node.send([msg, null])`
   - Error: `node.send([null, msg])`
   - Always include error info: `msg.error = { code, message, status }`

3. **Always Validate Inputs**:
   ```javascript
   if (!database) {
     node.error("Database not specified", msg);
     return;  // Don't continue
   }
   ```

4. **Retrieve Server Config**:
   ```javascript
   const serverConfig = RED.nodes.getNode(config.server);
   if (!serverConfig) {
     node.error("CouchDB server not configured");
     return;  // Exit early
   }
   ```

5. **Use Nano Library for CouchDB Operations**:
   ```javascript
   const nano = require('nano');
   const url = `http://${serverConfig.username}:${serverConfig.password}@${serverConfig.hostname}:${serverConfig.port}`;
   const couchdb = nano(url);
   const db = couchdb.db.use(database);
   ```

6. **Implement Node Status Feedback**:
   - During operation: `node.status({ fill: "blue", shape: "dot", text: "querying..." })`
   - On success: `node.status({ fill: "green", shape: "dot", text: "success" })`
   - On disconnect: `node.status({ fill: "grey", shape: "ring", text: "disconnected" })`

7. **Allow Message Override**:
   ```javascript
   const database = config.database || msg.database;
   const selector = msg.selector || (config.selector ? JSON.parse(config.selector) : {});
   ```

8. **Reference Real Implementation Examples**:
   - Query: [src/nodes/query/couchdb-query.js](src/nodes/query/couchdb-query.js)
   - Insert: [src/nodes/insert/couchdb-insert.js](src/nodes/insert/couchdb-insert.js)
   - Update: [src/nodes/update/couchdb-update.js](src/nodes/update/couchdb-update.js)
   - Get: [src/nodes/get/couchdb-get.js](src/nodes/get/couchdb-get.js)
   - Server Config: [src/nodes/server/couchdb-server.js](src/nodes/server/couchdb-server.js)

### Testing Requirements

1. **Write tests** for new nodes using Node-RED test helper
2. **Test error paths** to ensure errors flow to second output
3. **Validate message structure** with real CouchDB instance
4. **Run**: `npm test` to verify all tests pass

### Documentation

1. **Update AGENTS.md**: Add new patterns when discovering them
2. **Code comments**: Document complex logic, especially error handling
3. **Property validation**: Always validate before using message properties
4. **Error messages**: Make them actionable ("Database not specified" is better than "null")

## GitHub Actions

### CI/CD Pipeline

Automated workflows for continuous integration and deployment:

- **Testing**: Runs on pull requests and commits to main branch
- **Linting**: Validates TypeScript and code style
- **Build**: Compiles TypeScript to JavaScript
- **Coverage**: Reports test coverage metrics

### Workflows Location

See `.github/workflows/` for workflow definitions.

## Development Tools

### Pre-commit Hooks

Implement `husky` to enforce:
- TypeScript compilation checks
- ESLint validation
- Prettier formatting

### Code Analysis

- **ESLint**: TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Unit testing framework

## References

### Project Implementation Files

**CouchDB Nodes** (organized in [src/nodes/](src/nodes/) subdirectories):
- [src/nodes/query/](src/nodes/query/) - Query documents with Mango selectors
- [src/nodes/get/](src/nodes/get/) - Retrieve single document by ID
- [src/nodes/insert/](src/nodes/insert/) - Create new documents
- [src/nodes/update/](src/nodes/update/) - Modify existing documents
- [src/nodes/delete-db/](src/nodes/delete-db/) - Delete entire database
- [src/nodes/create-db/](src/nodes/create-db/) - Create new database
- [src/nodes/list-docs/](src/nodes/list-docs/) - List documents in database
- [src/nodes/list-dbs/](src/nodes/list-dbs/) - List all databases
- [src/nodes/server/](src/nodes/server/) - Server configuration node

**Each node directory contains**:
- `.js` file - Node logic
- `.html` file - Node UI definition

### External Documentation

- [Node-RED Creating Nodes Guide](https://nodered.org/docs/creating-nodes/) - Official Node-RED documentation
- [Nano Library Documentation](https://github.com/apache/couchdb-nano) - Node.js CouchDB client
- [Apache CouchDB Official Docs](https://docs.couchdb.org/) - Database reference
- [CouchDB Selector Syntax](https://docs.couchdb.org/en/stable/api/database/find.html) - Query selector documentation