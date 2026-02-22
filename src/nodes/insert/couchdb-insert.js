module.exports = function(RED) {
  function CouchDBInsertNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // Get server config
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
