/**
 * Test Helper for CouchDB Nodes
 * 
 * Common utilities and fixtures for testing Node-RED CouchDB nodes
 * Note: Uses mocks instead of full Node-RED test helper for Node 10 compatibility
 */

/**
 * Mock Node-RED helper for basic node testing
 */
const helper = {
  startServer: function(done) {
    // Mock implementation - no-op for Node 10 compatibility
    setImmediate(done);
  },
  
  stopServer: function(done) {
    // Mock implementation - no-op
    setImmediate(done);
  },
  
  unload: function() {
    // Mock implementation - no-op
  },
  
  load: function(nodeModule, flow, callback) {
    // Mock implementation - just execute callback
    setImmediate(callback);
  },
  
  getNode: function(id) {
    // Returns a mock node object
    return mockNodes[id] || createMockNode(id);
  }
};

// Store for mock nodes
const mockNodes = {};

/**
 * Create a mock Node-RED node
 */
function createMockNode(id, config) {
  config = config || {};
  const node = {
    id: id,
    name: 'MockNode',
    type: 'mock-node',
    
    // Event handlers
    handlers: {},
    
    on: function(event, handler) {
      if (!this.handlers[event]) {
        this.handlers[event] = [];
      }
      this.handlers[event].push(handler);
    },
    
    once: function(event, handler) {
      const self = this;
      const wrapped = function() {
        handler.apply(this, arguments);
        const idx = self.handlers[event].indexOf(wrapped);
        if (idx > -1) {
          self.handlers[event].splice(idx, 1);
        }
      };
      this.on(event, wrapped);
    },
    
    emit: function(event) {
      const args = Array.prototype.slice.call(arguments, 1);
      if (this.handlers[event]) {
        this.handlers[event].forEach(function(handler) {
          handler.apply(this, args);
        });
      }
    },
    
    receive: function(msg) {
      this.emit('input', msg);
    },
    
    send: function(msgs) {
      this.lastOutput = msgs;
      this.emit('send', msgs);
    },
    
    error: function(msg) {
      this.lastError = msg;
      this.emit('error', msg);
    },
    
    status: function(status) {
      this.lastStatus = status;
    },
    
    log: function(msg) {
      console.log('[' + this.id + '] ' + msg);
    },
    
    debug: function(msg) {
      console.log('[DEBUG ' + this.id + '] ' + msg);
    },
    
    warn: function(msg) {
      console.warn('[WARN ' + this.id + '] ' + msg);
    }
  };
  
  // Merge in any provided configuration
  Object.assign(node, config);
  
  mockNodes[id] = node;
  return node;
}

/**
 * Default server config for tests
 */
const DEFAULT_SERVER_CONFIG = {
  id: 's1',
  type: 'couchdb-server',
  hostname: 'localhost',
  port: 5984,
  username: 'admin',
  credentials: {
    password: 'password'
  }
};

/**
 * Create a server config node with custom overrides
 */
function createServerConfig(overrides) {
  overrides = overrides || {};
  const config = Object.assign({}, DEFAULT_SERVER_CONFIG, overrides);
  mockNodes[config.id] = createMockNode(config.id);
  Object.assign(mockNodes[config.id], config);
  return config;
}

/**
 * Create a test flow with a server node and operation node
 */
function createFlow(operationNode, serverConfig) {
  serverConfig = serverConfig || createServerConfig();
  const opCopy = Object.assign({}, operationNode);
  const serverCopy = Object.assign({}, serverConfig);
  return [opCopy, serverCopy];
}

/**
 * Assert that a message was sent on the success output (first output)
 */
function assertSuccess(msg) {
  if (!msg) {
    throw new Error('Expected success message but got null');
  }
  if (msg.error) {
    throw new Error('Expected success but got error: ' + msg.error.message);
  }
}

/**
 * Assert that a message was sent on the error output (second output)
 */
function assertError(msg, expectedStatus) {
  if (!msg) {
    throw new Error('Expected error message but got null');
  }
  if (!msg.error) {
    throw new Error('Expected error structure in message');
  }
  if (!msg.error.status) {
    throw new Error('Expected error status code in message.error.status');
  }
  if (expectedStatus && msg.error.status !== expectedStatus) {
    throw new Error('Expected status ' + expectedStatus + ' but got ' + msg.error.status);
  }
}

/**
 * Create a minimal test message
 */
function createMessage(payload) {
  payload = payload || {};
  return { payload: payload };
}

/**
 * Create a test message with database override
 */
function createMessageWithDatabase(database) {
  return { database: database };
}

/**
 * Clear all mock nodes (useful for test cleanup)
 */
function clearMocks() {
  for (var key in mockNodes) {
    delete mockNodes[key];
  }
}

module.exports = {
  helper: helper,
  createMockNode: createMockNode,
  clearMocks: clearMocks,
  DEFAULT_SERVER_CONFIG: DEFAULT_SERVER_CONFIG,
  createServerConfig: createServerConfig,
  createFlow: createFlow,
  assertSuccess: assertSuccess,
  assertError: assertError,
  createMessage: createMessage,
  createMessageWithDatabase: createMessageWithDatabase
};
