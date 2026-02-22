module.exports = function(RED) {
  function CouchDBListDatabasesNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const serverConfig = RED.nodes.getNode(config.server);

    node.on('input', function(msg) {
      if (!serverConfig) {
        node.error("CouchDB server not configured");
        msg.error = { error: "Server not configured" };
        node.send([null, msg]);
        return;
      }

      const nano = require('nano');
      const hostname = serverConfig.hostname;
      const port = serverConfig.port || 5984;
      const username = serverConfig.username;
      const password = serverConfig.credentials.password;

      const couchUrl = `http://${username}:${password}@${hostname}:${port}`;
      const db = nano(couchUrl);

      node.status({ fill: "blue", shape: "dot", text: "listing..." });

      db.db.list()
        .then(databases => {
          node.status({ fill: "green", shape: "dot", text: "success" });
          msg.payload = databases;
          msg.databases = databases;
          msg.count = databases.length;
          node.send([msg, null]);
        })
        .catch(err => {
          node.status({ fill: "red", shape: "ring", text: "error" });
          node.error("Failed to list databases: " + err.message);
          msg.error = err;
          node.send([null, msg]);
        });

        node.on("close", function() {
            node.status({});
        });
    });
  }

  RED.nodes.registerType("couchdb-list-dbs", CouchDBListDatabasesNode);
};
