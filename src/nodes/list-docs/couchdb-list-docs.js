module.exports = function(RED) {
  function CouchDBListDocsNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const serverConfig = RED.nodes.getNode(config.server);

    node.on('input', function(msg) {
      if (!serverConfig) {
        node.error("CouchDB server not configured");
        msg.error = {error: "Server not configured"};
        node.send([null, msg]);
        return;
      }

      const nano = require('nano');
      const hostname = serverConfig.hostname;
      const port = serverConfig.port || 5984;
      const username = serverConfig.username;
      const password = serverConfig.credentials.password;

      const couchUrl = `http://${username}:${password}@${hostname}:${port}`;
      const connection = nano(couchUrl);

      // Get database name from config or message
      const database = msg.database || config.database;
      
      if (!database) {
        node.error("Database name is required");
        msg.error = {error: "Database name not specified"};
        node.send([null, msg]);
        return;
      }

      const db = connection.use(database);

      // Build query options
      const options = {};
      
      // Pagination options
      if (msg.limit !== undefined || config.limit) {
        options.limit = parseInt(msg.limit || config.limit);
      }
      
      if (msg.skip !== undefined) {
        options.skip = parseInt(msg.skip);
      }
      
      if (msg.startkey !== undefined) {
        options.startkey = msg.startkey;
      }
      
      if (msg.endkey !== undefined) {
        options.endkey = msg.endkey;
      }

      // Include document content if requested
      if (msg.includeDocs !== undefined) {
        options.include_docs = msg.includeDocs;
      } else if (config.includeDocs) {
        options.include_docs = true;
      }

      // Descending order
      if (msg.descending !== undefined) {
        options.descending = msg.descending;
      } else if (config.descending) {
        options.descending = true;
      }

      node.status({fill: "blue", shape: "dot", text: "listing..."});

      db.list(options)
        .then(result => {
          node.status({fill: "green", shape: "dot", text: "success"});
          msg.payload = result;
          msg.rows = result.rows;
          msg.totalRows = result.total_rows;
          msg.offset = result.offset;
          
          // If include_docs was true, extract just the docs
          if (options.include_docs) {
            msg.docs = result.rows.map(row => row.doc);
          }
          
          node.send([msg, null]);
        })
        .catch(err => {
          node.status({fill: "red", shape: "ring", text: "error"});
          node.error("Failed to list documents: " + err.message);
          msg.error = err;
          node.send([null, msg]);
        });

        node.on("close", function() {
            node.status({});
        });
    });
  }

  RED.nodes.registerType("couchdb-list-docs", CouchDBListDocsNode);
};
