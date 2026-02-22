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
            msg.error = {
              code: err.code,
              message: err.message,
              status: err.status
            };
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
