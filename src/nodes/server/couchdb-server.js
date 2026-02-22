module.exports = function(RED) {
  'use strict';

  function CouchDBServerNode(n) {
    RED.nodes.createNode(this, n);
    this.hostname = n.hostname;
    this.port = n.port || 5984;
    this.username = n.username;
    this.password = this.credentials.password;
  }

  RED.nodes.registerType('couchdb-server', CouchDBServerNode, {
    credentials: {
      password: { type: 'password' }
    }
  });
};
