/**
 * Node-RED CouchDB Nodes
 * 
 * This package provides Node-RED nodes for interacting with CouchDB:
 * - couchdb-server: Configuration node for CouchDB connection
 * - couchdb-insert: Insert documents into CouchDB
 * - couchdb-get: Retrieve documents from CouchDB by ID
 * - couchdb-query: Query documents using Mango queries
 * - couchdb-update: Update existing documents in CouchDB
 * 
 * All operation nodes require a server configuration to be selected.
 * 
 * @module node-red-contrib-couchdb-nodes
 */

module.exports = function(RED) {
  // Server configuration node
  require('./server/couchdb-server')(RED);
  
  // Operation nodes
  require('./insert/couchdb-insert')(RED);
  require('./get/couchdb-get')(RED);
  require('./query/couchdb-query')(RED);
  require('./update/couchdb-update')(RED);
  
  // Database management nodes
  require('./create-db/couchdb-create-db')(RED);
  require('./delete-db/couchdb-delete-db')(RED);
  
  // List/query nodes
  require('./list-dbs/couchdb-list-dbs')(RED);
  require('./list-docs/couchdb-list-docs')(RED);
};
