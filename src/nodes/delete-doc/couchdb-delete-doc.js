module.exports = function(RED) {
  function CouchDBDeleteDocNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const serverConfig = RED.nodes.getNode(config.server);
    if (!serverConfig) {
      node.error("CouchDB server not configured");
      return;
    }

    const nano = require('nano');
    const url = 'http://' + serverConfig.username + ':' + serverConfig.password + '@' + serverConfig.hostname + ':' + serverConfig.port;
    const couchdb = nano(url);

    node.on("input", function(msg) {
      const database = config.database || msg.database;
      const docId = config.docId || msg.docId;
      const docRev = msg.docRev;

      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      if (!docId) {
        node.error("Document ID not specified", msg);
        return;
      }

      if (!docRev) {
        node.error("Document revision (_rev) not specified. Get the document first using the Get node", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        
        db.destroy(docId, docRev, function(err, result) {
          if (err) {
            node.error("Delete failed: " + err.message, msg);
            msg.error = {
              code: err.code,
              message: err.message,
              status: err.status
            };
            node.send([null, msg]);
          } else {
            msg.result = result;
            msg.docId = result.id;
            msg.docRev = result.rev;
            node.send([msg, null]);
            node.status({ fill: "green", shape: "dot", text: "Deleted: " + result.id });
          }
        });
      } catch (error) {
        node.error("Connection error: " + error.message, msg);
        msg.error = error;
        node.send([null, msg]);
      }
    });

    node.on("close", function() {
      node.status({ fill: "grey", shape: "ring", text: "disconnected" });
    });
  }

  RED.nodes.registerType("couchdb-delete-doc", CouchDBDeleteDocNode);
};
