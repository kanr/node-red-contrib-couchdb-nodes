# CouchDB Nodes for Node-RED

Custom Node-RED nodes for CRUD operations with CouchDB databases.

## Table of Contents

1. [Nodes Included](#nodes-included)
   - [CouchDB Server (Configuration)](#1-couchdb-server-configuration)
   - [CouchDB Insert](#2-couchdb-insert)
   - [CouchDB Get](#3-couchdb-get)
   - [CouchDB Query](#4-couchdb-query)
   - [CouchDB Update](#5-couchdb-update)
   - [CouchDB Create Database](#6-couchdb-create-database)
   - [CouchDB Delete Database](#7-couchdb-delete-database)
   - [CouchDB List Databases](#8-couchdb-list-databases)
   - [CouchDB List Documents](#9-couchdb-list-documents)
2. [CouchDB Interaction Guide](#couchdb-interaction-guide)
   - [Understanding CouchDB Documents](#understanding-couchdb-documents)
   - [Document ID Strategies](#document-id-strategies)
   - [Common Workflows](#common-workflows)
   - [Query Patterns](#query-patterns)
   - [Performance Best Practices](#performance-best-practices)
   - [Data Modeling Tips](#data-modeling-tips)
   - [Error Handling Patterns](#error-handling-patterns)
   - [Security Considerations](#security-considerations)
   - [Advanced Topics](#advanced-topics)
3. [Configuration](#configuration-for-kubernetes)
4. [Error Handling](#error-handling)
5. [Common Issues](#common-issues)
6. [Example Flows](#example-flows)
7. [Real-World Use Cases](#real-world-use-cases)
8. [Development](#development)
9. [Quick Reference](#quick-reference)
10. [Troubleshooting](#troubleshooting)
11. [Additional Resources](#additional-resources)

## Nodes Included

### 1. CouchDB Server (Configuration)
Stores CouchDB connection configuration. All other nodes require this to be configured.

**Configuration:**
- **Hostname**: CouchDB server address (e.g., `localhost`, `couchdb.example.com`)
- **Port**: CouchDB port (default: 5984)
- **Username**: CouchDB user account
- **Password**: User password (stored securely)

**Usage:**
1. Create a CouchDB Server configuration node
2. Select it in the "Server" field of any operation node

### 2. CouchDB Insert
Inserts new documents into a CouchDB database.

**Inputs:**
- `msg.payload` - Document object to insert (will generate `_id` if not provided)
- `msg.database` - Override database name (optional)

**Outputs:**
- **Port 1 (Success)**: Result with `_id`, `_rev`, and `ok: true`
- **Port 2 (Error)**: Error object if insertion fails

**Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "timestamp": 1234567890
}
```

### 3. CouchDB Get
Retrieves a document by its ID.

**Inputs:**
- `msg.payload` - Document ID or object with `docId` property
- `msg.docId` - Document ID (alternative)
- `msg.database` - Override database name (optional)

**Outputs:**
- **Port 1 (Success)**: The document object with `_id` and `_rev`
- **Port 2 (Error)**: Error if document not found

**Example:**
```
Input: "user:123"
Output: {
  "_id": "user:123",
  "_rev": "1-abc123...",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 4. CouchDB Query
Executes Mango queries against a database.

**Inputs:**
- `msg.payload` - Mango query selector object
- `msg.selector` - Mango selector (if payload is not a selector)
- `msg.limit` - Maximum results to return (optional)
- `msg.database` - Override database name (optional)

**Outputs:**
- **Port 1 (Success)**: Array of matching documents in `msg.docs`
- **Port 2 (Error)**: Error if query fails

**Example Query:**
```json
{
  "selector": {
    "email": "john@example.com"
  },
  "limit": 10
}
```

**Example Output:**
```json
{
  "docs": [
    {
      "_id": "user:123",
      "_rev": "1-abc123...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "bookmark": "g2..."
}
```

### 5. CouchDB Update
Updates existing documents in a database.

**Inputs:**
- `msg.payload` - Document object with `_id` and `_rev` properties
- `msg.database` - Override database name (optional)

**Outputs:**
- **Port 1 (Success)**: Result with updated `_id`, new `_rev`, and `ok: true`
- **Port 2 (Error)**: Error if update fails (e.g., conflict, document not found)

**Important:** Always get the current `_rev` before updating to avoid conflicts.

**Typical Workflow:**
```
Get → Function (modify properties) → Update
```

### 6. CouchDB Create Database
Creates a new CouchDB database.

**Configuration:**
- **Database Name**: Name of database to create (or use `msg.dbname`)

**Inputs:**
- `msg.dbname` - Database name (overrides configuration)

**Outputs:**
- **Port 1 (Success)**: Confirmation message with database name
- **Port 2 (Error)**: Error if creation fails (e.g., database already exists)

**Example:**
```javascript
msg.dbname = "user-profiles";
return msg;
```

**Validation:**
- Database names must be lowercase
- Can only contain letters, digits, and special characters: `_$()+-/`
- Must start with a letter or underscore

### 7. CouchDB Delete Database
Deletes a CouchDB database permanently.

**Configuration:**
- **Database Name**: Name of database to delete (or use `msg.dbname`)
- **Confirm Delete**: Safety checkbox that MUST be checked before deletion

**Inputs:**
- `msg.dbname` - Database name (overrides configuration)

**Outputs:**
- **Port 1 (Success)**: Confirmation message with database name
- **Port 2 (Error)**: Error if deletion fails

**⚠️ WARNING:** This is a destructive operation. All documents and data in the database will be permanently deleted.

**Safety Features:**
- Requires explicit confirmation checkbox to be enabled
- Will reject deletion if confirmation is not checked
- No undo or recovery possible

**Example:**
```javascript
msg.dbname = "temp-test-db";
return msg;
```

### 8. CouchDB List Databases
Lists all databases on the CouchDB server.

**Configuration:**
- **Server**: CouchDB server configuration

**Inputs:**
- No specific inputs required (triggered by any message)

**Outputs:**
- **Port 1 (Success)**: Array of database names
- **Port 2 (Error)**: Error if listing fails

**Output Properties:**
- `msg.payload` - Array of database names
- `msg.databases` - Same as payload
- `msg.count` - Number of databases found

**Example Output:**
```javascript
{
  "payload": ["_replicator", "_users", "node-red-flows", "metrics", "sensor-data"],
  "databases": ["_replicator", "_users", "node-red-flows", "metrics", "sensor-data"],
  "count": 5
}
```

**Use Cases:**
- Admin dashboards showing all databases
- Database discovery and selection in UI
- Health checks and monitoring
- Backup and migration tools

**Required Permissions:**
The configured user must have server admin rights to list all databases.

### 9. CouchDB List Documents
Lists all documents in a database with pagination support (uses `_all_docs` endpoint).

**Configuration:**
- **Server**: CouchDB server configuration
- **Database**: Database name (or use `msg.database`)
- **Limit**: Maximum documents to return (optional)
- **Include Docs**: Include full document content (checkbox)
- **Descending**: Sort in descending order (checkbox)

**Inputs:**
- `msg.database` - Database name (overrides configuration)
- `msg.limit` - Maximum number of documents to return
- `msg.skip` - Number of documents to skip (pagination)
- `msg.startkey` - Start listing from this document ID
- `msg.endkey` - Stop listing at this document ID
- `msg.includeDocs` - Include full document content (overrides configuration)
- `msg.descending` - Sort in descending order (overrides configuration)

**Outputs:**
- **Port 1 (Success)**: Document list with metadata
- **Port 2 (Error)**: Error if listing fails

**Output Properties:**
- `msg.payload` - Full response object (total_rows, offset, rows)
- `msg.rows` - Array of row objects (id, key, value)
- `msg.docs` - Array of documents (only if includeDocs is true)
- `msg.totalRows` - Total number of documents in database
- `msg.offset` - Offset used in the query

**Example Output (without docs):**
```javascript
{
  "payload": {
    "total_rows": 1234,
    "offset": 0,
    "rows": [
      {"id": "user:john", "key": "user:john", "value": {"rev": "1-abc"}},
      {"id": "user:jane", "key": "user:jane", "value": {"rev": "2-def"}}
    ]
  },
  "rows": [...],
  "totalRows": 1234,
  "offset": 0
}
```

**Example Output (with includeDocs):**
```javascript
{
  "payload": {...},
  "rows": [
    {
      "id": "user:john",
      "key": "user:john",
      "value": {"rev": "3-xyz"},
      "doc": {
        "_id": "user:john",
        "_rev": "3-xyz",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "docs": [
    {"_id": "user:john", "_rev": "3-xyz", "name": "John Doe", ...}
  ]
}
```

**Pagination Examples:**
```javascript
// Simple pagination - Page 1
msg.limit = 100;
msg.skip = 0;

// Simple pagination - Page 2
msg.limit = 100;
msg.skip = 100;

// Range query - List all users
msg.startkey = "user:";
msg.endkey = "user:\ufff0";
msg.limit = 100;
```

**Use Cases:**
- Browse all documents in a database
- Data export and backup operations
- Document counting and statistics
- Batch processing with pagination
- Building document selection UIs

**Performance Tips:**
- Always use `limit` to prevent loading too many documents
- Avoid `includeDocs` for large databases unless necessary
- Use `startkey`/`endkey` instead of `skip` for better performance on large offsets
- For semantic IDs like `user:*`, range queries are very efficient

## CouchDB Interaction Guide

### Understanding CouchDB Documents

CouchDB stores JSON documents with mandatory metadata fields:

- **`_id`**: Unique document identifier (auto-generated or user-provided)
- **`_rev`**: Revision ID (managed by CouchDB, required for updates/deletes)

**Example Document:**
```json
{
  "_id": "sensor:temp-01",
  "_rev": "3-a1b2c3d4...",
  "type": "temperature",
  "location": "warehouse",
  "value": 22.5,
  "timestamp": "2026-02-21T10:30:00Z",
  "tags": ["sensor", "iot", "monitoring"]
}
```

### Document ID Strategies

**Auto-generated IDs:**
- CouchDB creates UUIDs automatically
- Good for simple use cases
- Harder to query/reference later

**Semantic IDs:**
- Use meaningful patterns: `type:identifier`
- Examples: `user:john.doe`, `order:2024-001`, `sensor:temp-01`
- Enables range queries and easier debugging
- **Recommended** for most applications

**Timestamp-based IDs:**
- Format: `type:YYYY-MM-DD:sequence`
- Example: `event:2026-02-21:001`
- Natural sorting by time
- Good for time-series data

### Common Workflows

#### 1. Create New Document
```
[Inject JSON] → [Insert] → [Debug Success]
                         → [Debug Error]
```

**Function Node Example:**
```javascript
msg.payload = {
  _id: "user:" + msg.username,
  name: msg.fullName,
  email: msg.email,
  created: Date.now()
};
msg.database = "user-profiles";
return msg;
```

#### 2. Read-Modify-Write Pattern
```
[Trigger] → [Get] → [Modify] → [Update] → [Confirm]
                  → [Error]              → [Error]
```

**Modify Function:**
```javascript
// msg.payload contains the retrieved document
msg.payload.lastUpdated = Date.now();
msg.payload.status = "active";
// Keep _id and _rev for update
return msg;
```

#### 3. Conditional Update
```
[Get] → [Check] → [Switch] → [Update if needed]
                            → [Skip if current]
```

**Check Function:**
```javascript
const doc = msg.payload;
if (doc.status !== "processed") {
  doc.status = "processed";
  doc.processedAt = Date.now();
  return msg; // Route to Update
}
return null; // Skip update
```

#### 4. Query and Bulk Process
```
[Query] → [Split] → [Function] → [Update] → [Join] → [Summary]
```

**Split processes each document individually.**

#### 5. Database Lifecycle
```
[Check Setup] → [Create DB] → [Insert Initial Data] → [Confirm Ready]
                            → [Already Exists]
```

### Query Patterns

#### Simple Equality
```json
{
  "selector": {
    "type": "sensor",
    "status": "active"
  },
  "limit": 100
}
```

#### Range Queries
```json
{
  "selector": {
    "timestamp": {
      "$gte": "2026-02-01",
      "$lt": "2026-03-01"
    }
  },
  "sort": [{"timestamp": "desc"}],
  "limit": 50
}
```

#### Complex Conditions
```json
{
  "selector": {
    "$and": [
      {"type": "order"},
      {"status": {"$in": ["pending", "processing"]}},
      {"amount": {"$gt": 100}}
    ]
  }
}
```

#### Text Search
```json
{
  "selector": {
    "name": {
      "$regex": "(?i)john" 
    }
  }
}
```

### Performance Best Practices

#### 1. Use Indexes for Queries
Queries perform better with indexes. Create them using CouchDB's Fauxton UI or HTTP API:

```bash
curl -X POST http://admin:password@localhost:5984/mydb/_index \
  -H "Content-Type: application/json" \
  -d '{
    "index": {
      "fields": ["type", "timestamp"]
    },
    "name": "type-timestamp-index"
  }'
```

#### 2. Limit Query Results
Always use `limit` to prevent loading too many documents:

```javascript
msg.payload = {
  selector: {type: "sensor"},
  limit: 100  // Prevent unbounded results
};
```

#### 3. Use Efficient Document IDs
- Semantic IDs enable range queries
- Avoid random UUIDs when you need to query by prefix
- Example: `user:*` can retrieve all users efficiently

#### 4. Batch Operations
For multiple inserts, consider using bulk documents:

```javascript
// Collect documents then insert
const docs = [
  {_id: "sensor:01", value: 23.5},
  {_id: "sensor:02", value: 24.1},
  {_id: "sensor:03", value: 22.8}
];

msg.payload = {docs: docs};
msg.bulk = true;  // Custom flag for bulk insert
```

### Data Modeling Tips

#### 1. Denormalization
CouchDB works best with denormalized data:

**Good:**
```json
{
  "_id": "order:123",
  "customer": {
    "id": "user:john",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "items": [
    {"sku": "ABC", "name": "Widget", "price": 9.99}
  ]
}
```

**Avoid:**
```json
{
  "_id": "order:123",
  "customerId": "user:john",  // Requires second query
  "itemIds": ["item:1", "item:2"]  // Requires multiple queries
}
```

#### 2. Document Types
Use a `type` field to distinguish document types in the same database:

```json
{
  "_id": "user:john",
  "type": "user",
  "name": "John Doe"
}
```

```json
{
  "_id": "session:abc123",
  "type": "session",
  "userId": "user:john",
  "expiresAt": 1234567890
}
```

#### 3. Timestamps
Always include timestamps for debugging and time-based queries:

```javascript
msg.payload = {
  ...msg.payload,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Error Handling Patterns

#### Conflict Resolution
```
[Update] → [Success] → [Continue]
        → [Conflict] → [Get Latest] → [Merge] → [Retry Update]
```

**Conflict Handler:**
```javascript
if (msg.error && msg.error.statusCode === 409) {
  // Document was modified, retry
  msg.retries = (msg.retries || 0) + 1;
  if (msg.retries < 3) {
    return msg; // Route back to Get
  }
}
return null; // Give up after 3 retries
```

#### Document Not Found
```javascript
if (msg.error && msg.error.statusCode === 404) {
  // Create new document instead
  msg.payload = {
    _id: msg.docId,
    created: Date.now(),
    status: "new"
  };
  return msg; // Route to Insert
}
```

#### Network/Connection Errors
```javascript
if (msg.error && msg.error.code === 'ECONNREFUSED') {
  node.warn("CouchDB unreachable, retrying in 5s");
  msg.delay = 5000;
  return msg; // Route to Delay node
}
```

### Security Considerations

#### 1. Use Database-Level Permissions
Create separate databases for different security zones:
- `public-data` - Read by anyone
- `user-data` - User-specific data
- `admin-data` - Restricted admin data

#### 2. Validate Input
Always validate before inserting:

```javascript
const doc = msg.payload;

// Validate required fields
if (!doc.email || !doc.email.includes('@')) {
  msg.error = "Invalid email address";
  return [null, msg]; // Send to error output
}

// Sanitize user input
doc.email = doc.email.toLowerCase().trim();
doc.created = Date.now(); // Server-side timestamp

return [msg, null]; // Send to success output
```

#### 3. Use Kubernetes Secrets
Never hardcode passwords in flows. Use environment variables:

```javascript
// Reference system config, don't store credentials in flow
const server = RED.nodes.getNode(config.server);
```

### Advanced Topics

#### Design Documents and Views
For complex queries, consider creating views in CouchDB. Views are pre-computed indexes using MapReduce.

**Access via HTTP API:**
```javascript
msg.url = `http://${hostname}:5984/${database}/_design/stats/_view/by_date`;
msg.method = "GET";
// Use HTTP Request node
```

#### Attachments
CouchDB supports file attachments on documents. Access via HTTP API or specialized nodes.

#### Changes Feed
Monitor database changes in real-time:

```bash
curl 'http://localhost:5984/mydb/_changes?feed=continuous&since=now'
```

Can be integrated with Node-RED's WebSocket or HTTP Request nodes.

#### Replication
CouchDB supports master-master replication. Configure via Fauxton UI or HTTP API for multi-site deployments.

## Configuration for Kubernetes

When running Node-RED in Kubernetes with CouchDB:

```
Hostname: node-red-kanr-couchdb.node-red-dev.svc.cluster.local
Port: 5984
Username: admin
Password: (from Kubernetes secret)
```

When using 1Password Operator for secrets:

```yaml
env:
  - name: COUCHDB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: couchdb-credentials
        key: password
```

## Configuration for Local Development

```
Hostname: localhost
Port: 5984 (via port-forward)
Username: admin
Password: devpassword
```

Port forward with:
```bash
kubectl port-forward -n node-red-dev svc/node-red-kanr-couchdb 5984:5984
```

## Error Handling

All operation nodes have two outputs:
- **Success path**: Processes the result
- **Error path**: Handles failures

Example pattern:
```
Insert → [Success] → Function → Inject to DB path
       → [Error] → Catch → Log error
```

## Common Issues

### Conflict Errors on Update
- **Cause**: Document was modified after Get, causing revision mismatch
- **Solution**: Get the document again and use the latest `_rev`

### Document Not Found
- **Cause**: Document ID doesn't exist in the database
- **Solution**: Verify the ID and check the database name

### Authentication Failed
- **Cause**: Wrong credentials or user doesn't have database access
- **Solution**: Verify username/password and user permissions

### Connection Timeout
- **Cause**: CouchDB server unreachable
- **Solution**: Check hostname, port, and network connectivity

## Example Flows

### Create and Update
```
[Inject] → [Insert] → [Get] → [Function] → [Update] → [Debug]
```

### Query and Process
```
[Inject] → [Query] → [Function (loop)] → [Update] → [Debug]
```

### Error Handling
```
[Insert] → [Success] → [Debug "OK"]
        → [Error] → [Debug "Failed: " & error]
```

## Real-World Use Cases

### Use Case 1: IoT Sensor Data Collection

**Scenario:** Collect temperature readings from multiple sensors and store in CouchDB.

**Flow:**
```
[MQTT In] → [Format] → [Insert] → [Success] → [Dashboard]
                                → [Error] → [Alert]
```

**Format Function:**
```javascript
msg.payload = {
  _id: `reading:${msg.topic}:${Date.now()}`,
  type: "temperature",
  sensor: msg.topic,
  value: parseFloat(msg.payload),
  timestamp: new Date().toISOString(),
  unit: "celsius"
};
msg.database = "sensor-data";
return msg;
```

**Query Recent Readings:**
```javascript
msg.payload = {
  selector: {
    type: "temperature",
    timestamp: {
      $gte: new Date(Date.now() - 3600000).toISOString()
    }
  },
  sort: [{timestamp: "desc"}],
  limit: 100
};
msg.database = "sensor-data";
return msg;
```

### Use Case 2: User Session Management

**Scenario:** Store and validate user sessions with automatic expiration.

**Create Session Flow:**
```
[Login] → [Generate Token] → [Insert Session] → [Return Token]
```

**Generate Token Function:**
```javascript
const crypto = require('crypto');
const sessionId = crypto.randomBytes(32).toString('hex');

msg.payload = {
  _id: `session:${sessionId}`,
  type: "session",
  userId: msg.userId,
  createdAt: Date.now(),
  expiresAt: Date.now() + (3600 * 1000), // 1 hour
  ipAddress: msg.req.ip,
  userAgent: msg.req.headers['user-agent']
};

msg.database = "sessions";
msg.sessionId = sessionId;
return msg;
```

**Validate Session Flow:**
```
[API Request] → [Get Session] → [Check Expiry] → [Valid] → [Continue]
                               → [Not Found]              → [Expired] → [Reject]
```

**Check Expiry Function:**
```javascript
const session = msg.payload;

if (!session) {
  msg.statusCode = 401;
  msg.payload = {error: "Invalid session"};
  return [null, msg]; // Route to error
}

if (session.expiresAt < Date.now()) {
  msg.statusCode = 401;
  msg.payload = {error: "Session expired"};
  return [null, msg]; // Route to error
}

msg.userId = session.userId;
return [msg, null]; // Route to success
```

### Use Case 3: Workflow State Machine

**Scenario:** Track order status through multiple stages with history.

**Update Order Status Flow:**
```
[Order Event] → [Get Order] → [Update Status] → [Insert] → [Notify]
```

**Update Status Function:**
```javascript
const order = msg.payload;
const newStatus = msg.newStatus;

// Initialize history if it doesn't exist
if (!order.statusHistory) {
  order.statusHistory = [];
}

// Add current status to history
order.statusHistory.push({
  status: order.status,
  timestamp: Date.now(),
  by: msg.userId
});

// Update to new status
order.status = newStatus;
order.updatedAt = Date.now();
order.updatedBy = msg.userId;

msg.payload = order;
msg.database = "orders";
return msg;
```

**Query Orders by Status:**
```javascript
msg.payload = {
  selector: {
    type: "order",
    status: "pending"
  },
  sort: [{createdAt: "asc"}],
  limit: 50
};
msg.database = "orders";
return msg;
```

### Use Case 4: Audit Trail and Logging

**Scenario:** Maintain immutable audit logs of system events.

**Log Event Flow:**
```
[System Event] → [Format Log] → [Insert] → [Notification]
```

**Format Log Function:**
```javascript
msg.payload = {
  _id: `log:${Date.now()}:${crypto.randomBytes(8).toString('hex')}`,
  type: "audit_log",
  event: msg.eventName,
  actor: msg.userId,
  resource: msg.resourceId,
  action: msg.action,
  timestamp: new Date().toISOString(),
  ipAddress: msg.ipAddress,
  metadata: {
    userAgent: msg.userAgent,
    success: msg.success,
    error: msg.error || null
  }
};
msg.database = "audit-logs";
return msg;
```

**Query Audit Logs:**
```javascript
// Get all logs for a specific user
msg.payload = {
  selector: {
    type: "audit_log",
    actor: msg.userId,
    timestamp: {
      $gte: "2026-02-01T00:00:00Z"
    }
  },
  sort: [{timestamp: "desc"}],
  limit: 100
};
msg.database = "audit-logs";
return msg;
```

### Use Case 5: Configuration Management

**Scenario:** Store and retrieve application configuration with versioning.

**Initialize Configuration:**
```
[Deploy] → [Check Config] → [Exists?] → [Use Existing]
                          → [Missing] → [Create Default] → [Insert]
```

**Check and Create Function:**
```javascript
// This runs after trying to Get config document
if (msg.error && msg.error.statusCode === 404) {
  // Config doesn't exist, create default
  msg.payload = {
    _id: "config:app",
    type: "configuration",
    version: "1.0.0",
    created: Date.now(),
    settings: {
      apiTimeout: 30000,
      maxRetries: 3,
      enableDebug: false,
      features: {
        notifications: true,
        analytics: false
      }
    }
  };
  msg.database = "configuration";
  return msg; // Route to Insert
}
return null; // Config exists, stop
```

**Update Configuration:**
```
[Admin UI] → [Get Config] → [Validate] → [Update Version] → [Update]
```

**Update Version Function:**
```javascript
const config = msg.payload;
const newSettings = msg.newSettings;

// Merge new settings
config.settings = {
  ...config.settings,
  ...newSettings
};

// Increment version
const [major, minor, patch] = config.version.split('.').map(Number);
config.version = `${major}.${minor}.${patch + 1}`;
config.updatedAt = Date.now();
config.updatedBy = msg.userId;

msg.payload = config;
return msg;
```

### Use Case 6: Data Migration and Cleanup

**Scenario:** Migrate old data format to new schema.

**Migration Flow:**
```
[Trigger] → [Query Old Docs] → [Split] → [Transform] → [Update] → [Join] → [Summary]
```

**Query Old Documents:**
```javascript
msg.payload = {
  selector: {
    type: "user",
    schemaVersion: {$exists: false}  // Missing schema version = old format
  },
  limit: 100
};
msg.database = "user-profiles";
return msg;
```

**Transform Function:**
```javascript
const doc = msg.payload;

// Transform old format to new
msg.payload = {
  ...doc,
  schemaVersion: 2,
  // Restructure data
  profile: {
    name: doc.name,
    email: doc.email,
    avatar: doc.avatarUrl
  },
  preferences: {
    notifications: doc.emailNotifications || false,
    theme: "light"
  },
  // Remove old fields
  name: undefined,
  email: undefined,
  avatarUrl: undefined,
  emailNotifications: undefined
};

return msg;
```

**Cleanup Old Data:**
```
[Schedule Daily] → [Query Expired] → [Split] → [Delete] → [Log]
```

**Query Expired Sessions:**
```javascript
msg.payload = {
  selector: {
    type: "session",
    expiresAt: {
      $lt: Date.now()
    }
  },
  limit: 1000
};
msg.database = "sessions";
return msg;
```

## Development

These nodes are part of the `node-red-kanr` Docker image and automatically loaded when Node-RED starts.

To add custom logic:
1. Modify the `.js` files for runtime behavior
2. Modify the `.html` files for UI and help text
3. Update `nodes/package.json` if adding new nodes
4. Rebuild the Docker image: `docker build -t node-red-kanr docker/node-red-kanr/`
5. Deploy with Helm or apply the updated image to Minikube

## Quick Reference

### Common Message Properties

| Property | Purpose | Example |
|----------|---------|---------|
| `msg.payload` | Document data or query | `{name: "John"}` |
| `msg.database` | Override database name | `"user-profiles"` |
| `msg.docId` | Document ID for Get | `"user:123"` |
| `msg.dbname` | Database name for Create/Delete DB | `"analytics"` |
| `msg.selector` | Query selector | `{type: "sensor"}` |
| `msg.limit` | Max query results | `100` |

### Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Document inserted |
| 404 | Not Found | Document/DB doesn't exist |
| 409 | Conflict | Document revision mismatch |
| 401 | Unauthorized | Check credentials |
| 500 | Server Error | Check CouchDB logs |

### CouchDB Selector Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `$eq` | Equals | `{status: {$eq: "active"}}` |
| `$ne` | Not equals | `{status: {$ne: "deleted"}}` |
| `$gt` | Greater than | `{age: {$gt: 18}}` |
| `$gte` | Greater/equal | `{timestamp: {$gte: "2026-01-01"}}` |
| `$lt` | Less than | `{price: {$lt: 100}}` |
| `$lte` | Less/equal | `{score: {$lte: 50}}` |
| `$in` | In array | `{status: {$in: ["active", "pending"]}}` |
| `$nin` | Not in array | `{role: {$nin: ["guest", "banned"]}}` |
| `$exists` | Field exists | `{email: {$exists: true}}` |
| `$regex` | Regex match | `{name: {$regex: "(?i)john"}}` |
| `$and` | Logical AND | `{$and: [{type: "user"}, {active: true}]}` |
| `$or` | Logical OR | `{$or: [{status: "new"}, {priority: "high"}]}` |

### Recipe: Upsert (Insert or Update)

**Flow:**
```
[Input] → [Get] → [Update Existing]
               → [Insert New on 404]
```

**Handler Function:**
```javascript
if (msg.error && msg.error.statusCode === 404) {
  // Document doesn't exist, create it
  msg.payload = {
    _id: msg.docId,
    ...msg.newData,
    created: Date.now()
  };
  return [msg, null]; // Route to Insert
} else if (!msg.error) {
  // Document exists, update it
  msg.payload = {
    ...msg.payload,
    ...msg.newData,
    updated: Date.now()
  };
  return [null, msg]; // Route to Update
}
// Error case
return [null, null];
```

### Recipe: Atomic Counter

**Flow:**
```
[Increment] → [Get Counter] → [Add 1] → [Update] → [Return Value]
                            → [Conflict] → [Retry Get]
```

**Increment Function:**
```javascript
const doc = msg.payload;
doc.value = (doc.value || 0) + 1;
doc.updated = Date.now();
msg.payload = doc;
return msg;
```

### Recipe: Batch Processing with Rate Limiting

**Flow:**
```
[Query] → [Delay 100ms] → [Split] → [Process] → [Join]
```

**Prevents overwhelming CouchDB with rapid requests.**

## Troubleshooting

### Problem: "Cannot find module 'nano'"

**Cause:** nano module not installed in correct location

**Solution:** Verify Dockerfile installs nano in `/usr/src/node-red/node_modules`:
```dockerfile
RUN cd /usr/src/node-red && npm install nano@10.1.3
```

### Problem: "getaddrinfo ENOTFOUND undefined"

**Cause:** Server configuration has incorrect property access

**Solution:** Ensure operation nodes use:
- `serverConfig.hostname` (not `serverConfig.host`)
- `serverConfig.username` (not `credentials.username`)
- `credentials.password` (passwords are in credentials)

### Problem: "Document update conflict"

**Cause:** Document was modified between Get and Update

**Solution:** Implement retry logic:
```javascript
msg.retryCount = (msg.retryCount || 0) + 1;
if (msg.retryCount < 3) {
  return msg; // Retry from Get
}
node.error("Max retries exceeded");
```

### Problem: "Port forwarding keeps dying"

**Cause:** kubectl port-forward terminates when pods restart

**Solutions:**
1. Use `minikube service node-red-kanr -n node-red-dev --url` for stable NodePort URL
2. Restart port-forward after deployments: `kubectl port-forward -n node-red-dev svc/node-red-kanr 1880:1880`

### Problem: "Query is slow"

**Cause:** Missing index on queried fields

**Solution:** Create index via CouchDB HTTP API:
```bash
curl -X POST http://admin:password@localhost:5984/mydb/_index \
  -H "Content-Type: application/json" \
  -d '{
    "index": {"fields": ["type", "status"]},
    "name": "type-status-index"
  }'
```

### Problem: "Authentication failed"

**Cause:** Incorrect credentials or permissions

**Solution:**
1. Verify credentials in CouchDB Server config node
2. Check CouchDB user has permissions: `curl -u admin:password http://localhost:5984/_users`
3. For Kubernetes, verify secret is mounted correctly

### Problem: "Database does not exist"

**Cause:** Database not created yet

**Solution:** Use Create Database node or create via curl:
```bash
curl -X PUT http://admin:password@localhost:5984/newdb
```

### Problem: CouchDB nodes not appearing

**Cause:** Package not installed or installation failed

**Solution:** Verify `docker/node-red-kanr/package.json` includes:
```json
{
  "dependencies": {
    "node-red-contrib-couchdb-nodes": "^1.0.0"
  }
}
```

Check installation in the container:
```bash
kubectl exec -n node-red-dev deployment/node-red-kanr -- npm list node-red-contrib-couchdb-nodes
```

The nodes are now installed via npm from the published package repository

## Additional Resources

### CouchDB Documentation
- **Official Docs:** https://docs.couchdb.org/
- **HTTP API Reference:** https://docs.couchdb.org/en/stable/api/index.html
- **Mango Query Guide:** https://docs.couchdb.org/en/stable/api/database/find.html

### Node-RED Documentation
- **Creating Nodes:** https://nodered.org/docs/creating-nodes/
- **Node Properties:** https://nodered.org/docs/creating-nodes/properties
- **Credentials:** https://nodered.org/docs/creating-nodes/credentials

### Tools
- **Fauxton:** CouchDB's web UI (http://localhost:5984/_utils/)
- **curl:** Command-line HTTP client for testing
- **Postman:** GUI HTTP client for CouchDB API testing

## License

MIT

## Author

kanr
