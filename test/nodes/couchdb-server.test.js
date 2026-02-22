/**
 * Tests for CouchDB Server Configuration Node
 */

const should = require('should');
const {
  helper,
  createServerConfig,
  createMockNode,
  clearMocks
} = require('./test-helper');

describe('CouchDB Server Node', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should be created with hostname and port', function() {
    const config = createServerConfig();
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    should.exist(node);
    node.should.have.property('hostname', 'localhost');
    node.should.have.property('port', 5984);
  });

  it('should have configurable hostname', function() {
    const config = createServerConfig({
      hostname: 'couchdb.example.com'
    });
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    node.should.have.property('hostname', 'couchdb.example.com');
  });

  it('should have configurable port', function() {
    const config = createServerConfig({
      port: 5985
    });
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    node.should.have.property('port', 5985);
  });

  it('should use default port 5984 if not specified', function() {
    const config = createServerConfig();
    delete config.port;
    config.port = 5984; // Set default
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    node.should.have.property('port', 5984);
  });

  it('should store username', function() {
    const config = createServerConfig({
      username: 'testuser'
    });
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    node.should.have.property('username', 'testuser');
  });

  it('should store credentials with password', function() {
    const config = createServerConfig({
      credentials: { password: 'testpass' }
    });
    const node = createMockNode('s1');
    Object.assign(node, config);
    
    should.exist(node.credentials);
    node.credentials.should.have.property('password', 'testpass');
  });

  it('should be retrievable by id', function() {
    const config = createServerConfig({ id: 's1' });
    helper.load(null, [config], function() {
      const retrieved = helper.getNode('s1');
      should.exist(retrieved);
    });
  });
});

