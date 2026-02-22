# Node-RED CouchDB Examples

This directory contains example flows demonstrating how to use the CouchDB nodes.

## Importing Examples

To import an example into Node-RED:

1. Open Node-RED in your browser
2. Click the menu (☰) in the top right
3. Select **Import**
4. Copy the contents of an example JSON file
5. Paste into the import dialog
6. Click **Import**

## Available Examples

### 1. basic-query.json
Demonstrates querying documents from a CouchDB view with filtering and pagination.

**Features:**
- Server configuration
- View-based queries
- Key filtering
- Limit/skip pagination
- Error handling

### 2. insert-document.json
Shows how to insert new documents into CouchDB.

**Features:**
- Document creation
- Payload validation
- Success/error output handling
- Debug output

### 3. get-update-document.json
Demonstrates the get-modify-update pattern for safely updating documents.

**Features:**
- Retrieve document by ID
- Modify document fields
- Update with revision checking
- Conflict handling (409 errors)

### 4. database-management.json
Shows database creation, listing, and deletion operations.

**Features:**
- Create database
- List all databases
- Delete database
- Error handling for each operation

### 5. pagination-example.json
Advanced example showing how to paginate through large result sets.

**Features:**
- Page size configuration
- Page number tracking
- Dynamic limit/skip calculation
- Previous/Next page navigation

### 6. batch-insert.json
Demonstrates inserting multiple documents efficiently.

**Features:**
- Array iteration
- Multiple document insertion
- Batch processing
- Success counter

## Configuration Required

Before using these examples, you need to configure the CouchDB server node:

1. Import an example flow
2. Double-click any CouchDB node
3. Click the pencil icon next to "Server"
4. Configure your CouchDB connection:
   - **Hostname**: localhost (or your CouchDB server)
   - **Port**: 5984 (default CouchDB port)
   - **Username**: (if authentication required)
   - **Password**: (if authentication required)
5. Click **Add** or **Update**
6. Deploy the flow

## Testing Examples

Most examples include **Inject** nodes with timestamps to trigger the flows. Click the button on the left side of an Inject node to execute the flow.

Debug nodes are connected to show the output. Open the Debug panel (bug icon in the right sidebar) to see results.

## Creating Your Own Flows

Use these examples as templates:

1. Copy an example flow
2. Modify the configuration (database name, view, etc.)
3. Adjust the payload or query parameters
4. Add your own processing logic
5. Deploy and test

## Common Patterns

### Error Handling
All CouchDB nodes have two outputs:
- **Output 1**: Success messages
- **Output 2**: Error messages

Connect both outputs to handle success and error cases separately.

### Message Override
Most node properties can be overridden by message properties:
```javascript
msg.database = "my-database";  // Override configured database
msg.docId = "doc-123";         // Override document ID
msg.limit = 50;                // Override query limit
```

### Revision Control
When updating documents, you must provide the current `_rev`:
1. Use Get node to retrieve the document
2. Modify the document in a Function node
3. Use Update node (revision is preserved from Get)

## Need Help?

- [Main README](../README.md) - Full documentation
- [GitHub Issues](https://github.com/kanr/node-red-contrib-couchdb-nodes/issues) - Report bugs or ask questions
- [Node-RED Documentation](https://nodered.org/docs/) - Learn about Node-RED
- [CouchDB Documentation](https://docs.couchdb.org/) - Learn about CouchDB
