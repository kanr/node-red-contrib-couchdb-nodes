module.exports = function(RED) {
  function CouchDBGetNode(config) {
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
      const docId = config.docId || msg.docId;

      if (!database) {
        node.error("Database not specified", msg);
        return;
      }

      if (!docId) {
        node.error("Document ID not specified", msg);
        return;
      }

      try {
        const db = couchdb.db.use(database);
        
        db.get(docId, (err, result) => {
          if (err) {
            node.error(`Get failed: ${err.message}`, msg);
            msg.error = {
              code: err.code,
              message: err.message,
              status: err.status
            };
            node.send([null, msg]);
          } else {
            msg.payload = result;
            msg.docId = result._id;
            msg.docRev = result._rev;
            node.send([msg, null]);
            node.status({ fill: "green", shape: "dot", text: `Retrieved: ${result._id}` });
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

  RED.nodes.registerType("couchdb-get", CouchDBGetNode);
};
