module.exports = function(RED) {
  function CouchDBCreateDBNode(config) {
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
      const dbName = config.dbname || msg.dbname || msg.payload;

      if (!dbName) {
        node.error("Database name not specified", msg);
        node.status({fill: "red", shape: "ring", text: "no database name"});
        return;
      }

      node.status({fill: "blue", shape: "dot", text: "creating..."});

      couchdb.db.create(dbName, (err, body) => {
        if (err) {
          node.error(`Create database failed: ${err.message}`, msg);
          node.status({fill: "red", shape: "ring", text: "failed"});
          msg.error = {
            message: err.message,
            statusCode: err.statusCode,
            reason: err.reason
          };
          node.send([null, msg]);
        } else {
          node.status({fill: "green", shape: "dot", text: "created"});
          msg.result = body;
          msg.dbname = dbName;
          node.send([msg, null]);
        }
      });
    });

    node.on("close", function() {
      node.status({});
    });
  }

  RED.nodes.registerType("couchdb-create-db", CouchDBCreateDBNode);
};
