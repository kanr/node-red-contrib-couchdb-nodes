# node-red-contrib-couchdb-nodes

Node-RED nodes for performing CRUD operations on Apache CouchDB databases.

[![npm version](https://badge.fury.io/js/node-red-contrib-couchdb-nodes.svg)](https://www.npmjs.com/package/node-red-contrib-couchdb-nodes)
[![Node.js CI](https://github.com/kanr/node-red-contrib-couchdb-nodes/workflows/Test/badge.svg)](https://github.com/kanr/node-red-contrib-couchdb-nodes/actions)

## Features

- **Server Configuration**: Centralized CouchDB connection management with authentication
- **Document Operations**: Query, insert, get, and update documents
- **Database Management**: Create, delete, and list databases
- **View Queries**: Execute CouchDB views with filtering and pagination
- **Optimistic Concurrency**: Built-in revision control for safe updates
- **Error Handling**: Dual-output pattern for success/error flow separation
- **Pagination**: Support for limit/skip in queries and document listing

## Installation

Install via Node-RED's palette manager or run:

```bash
npm install node-red-contrib-couchdb-nodes
```

## Requirements

- **Node.js**: 10.0.0 or higher
- **Node-RED**: 1.0.0 or higher
- **CouchDB**: 2.0 or higher

## Available Nodes

### CouchDB Server (Configuration)

Configuration node that stores CouchDB connection details. Used by all operational nodes.

**Properties:**
- `hostname`: CouchDB server hostname (default: localhost)
- `port`: CouchDB port (default: 5984)
- `username`: Optional authentication username
- `password`: Optional authentication password (stored securely)

### CouchDB Query

Execute CouchDB view queries with filtering and pagination options.

**Inputs:**
- `msg.database` (optional): Override configured database
- `msg.view` (optional): Override configured view
- `msg.key` (optional): Filter by specific key
- `msg.limit` (optional): Maximum documents to return
- `msg.skip` (optional): Number of documents to skip
- `msg.include_docs` (optional): Include full documents in results

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains query results
- **Output 2 (Error)**: Error information

**Example:**
```javascript
msg.database = "products";
msg.view = "catalog/by_category";
msg.key = "electronics";
msg.limit = 10;
return msg;
```

### CouchDB Insert

Insert new documents into CouchDB.

**Inputs:**
- `msg.payload`: Object to insert (must be a valid object, not string/array/null)
- `msg.database` (optional): Override configured database

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains inserted document with `_id` and `_rev`
- **Output 2 (Error)**: Error information

**Example:**
```javascript
msg.payload = {
  type: "product",
  name: "Laptop",
  price: 999.99
};
return msg;
```

### CouchDB Get

Retrieve a specific document by ID.

**Inputs:**
- `msg.docId`: Document ID to retrieve
- `msg.database` (optional): Override configured database

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains the document
- **Output 2 (Error)**: Error information (e.g., 404 if not found)

**Example:**
```javascript
msg.docId = "product-12345";
return msg;
```

### CouchDB Update

Update existing documents with optimistic concurrency control.

**Inputs:**
- `msg.payload`: Document object with `_id` and `_rev` fields
- `msg.database` (optional): Override configured database

**Important:** The document must include both `_id` and `_rev`. Use the Get node first to retrieve the current version.

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains updated document info with new `_rev`
- **Output 2 (Error)**: Error information (e.g., 409 conflict if document was modified)

**Example:**
```javascript
// First, get the document
// Then update it:
msg.payload._rev = "2-abc123";  // Current revision from Get node
msg.payload.price = 899.99;      // Update field
return msg;
```

### CouchDB Create DB

Create a new CouchDB database.

**Inputs:**
- `msg.database`: Name of database to create

**Outputs:**
- **Output 1 (Success)**: Confirmation message
- **Output 2 (Error)**: Error information

### CouchDB Delete DB

Delete a CouchDB database.

**Inputs:**
- `msg.database`: Name of database to delete

**Outputs:**
- **Output 1 (Success)**: Confirmation message
- **Output 2 (Error)**: Error information

### CouchDB List DBs

List all databases on the CouchDB server.

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains array of database names
- **Output 2 (Error)**: Error information

### CouchDB List Docs

List documents in a database with pagination support.

**Inputs:**
- `msg.database` (optional): Override configured database
- `msg.limit` (optional): Maximum documents to return
- `msg.skip` (optional): Number of documents to skip
- `msg.include_docs` (optional): Include full document content

**Outputs:**
- **Output 1 (Success)**: `msg.payload` contains document list
- **Output 2 (Error)**: Error information

## Usage Patterns

### Basic Query Flow

```
[Inject] → [CouchDB Query] → [Debug]
                           → [Error Handler]
```

### Insert with Error Handling

```
[Function] → [CouchDB Insert] → [Success Handler]
                              → [Error Logger]
```

### Update with Get-Modify-Update Pattern

```
[Inject] → [CouchDB Get] → [Function: Modify] → [CouchDB Update] → [Debug]
                        → [Error Handler]                        → [Error Handler]
```

### Pagination Example

```javascript
// In a Function node before CouchDB Query
var pageSize = 20;
var pageNumber = msg.page || 0;

msg.limit = pageSize;
msg.skip = pageNumber * pageSize;
msg.include_docs = true;

return msg;
```

## Error Handling

All operational nodes use a dual-output pattern:

- **First output**: Successful operations
- **Second output**: Errors (with detailed error information)

This allows you to route errors to dedicated error handling flows without cluttering your success path.

**Example error message:**
```javascript
{
  error: {
    message: "Document update conflict",
    status: 409,
    reason: "Document update conflict"
  }
}
```

## CouchDB Concepts

### Document Revisions

CouchDB uses `_rev` fields for optimistic concurrency control. Every document has a revision that changes with each update. When updating a document, you must provide the current `_rev` to prevent conflicts.

**Workflow:**
1. **Get** the document (retrieves current `_rev`)
2. **Modify** the document fields
3. **Update** with the current `_rev`

If another process updates the document between steps 1 and 3, you'll receive a 409 conflict error.

### Views

CouchDB views are stored queries defined in design documents. Views are referenced as `design_doc_name/view_name`.

**Example:** `catalog/by_category` refers to the `by_category` view in the `catalog` design document.

## Development

### Running Tests

```bash
npm test
```

The test suite includes 37+ tests covering all node types and error conditions.

### Project Structure

```
src/nodes/
├── server/          Configuration node
├── query/           View queries
├── insert/          Document insertion
├── get/             Document retrieval
├── update/          Document updates
├── create-db/       Database creation
├── delete-db/       Database deletion
├── list-dbs/        List databases
└── list-docs/       List documents

test/nodes/          Test suite
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## License

MIT © kanr

## Links

- [GitHub Repository](https://github.com/kanr/node-red-contrib-couchdb-nodes)
- [npm Package](https://www.npmjs.com/package/node-red-contrib-couchdb-nodes)
- [Issue Tracker](https://github.com/kanr/node-red-contrib-couchdb-nodes/issues)
- [Apache CouchDB](https://couchdb.apache.org/)
- [Node-RED](https://nodered.org/)

## Changelog

### 1.0.0 (2026-02-21)

- Initial release
- CouchDB server configuration node
- Document operations: query, insert, get, update
- Database management: create, delete, list
- Document listing with pagination
- Comprehensive test coverage
- GitHub Actions CI/CD
