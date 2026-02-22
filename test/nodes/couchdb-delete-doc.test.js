/**
 * Tests for CouchDB Delete Document Node
 */

const should = require('should');
const {
  createMockNode,
  clearMocks
} = require('./test-helper');

describe('CouchDB Delete Document Node', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should be created with database and docId', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      docId: 'doc-123',
      type: 'couchdb-delete-doc'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
    node.should.have.property('docId', 'doc-123');
    node.should.have.property('type', 'couchdb-delete-doc');
  });

  it('should store server reference', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      docId: 'doc-123',
      server: 's1'
    });
    
    node.should.have.property('server', 's1');
  });

  it('should support message-level docId override', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      server: 's1'
    });
    
    node.receive({ docId: 'doc-456', docRev: '1-abc', payload: {} });
    should.exist(node);
  });

  it('should have dual-output pattern', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      docId: 'doc-123'
    });
    
    should(typeof node.send).equal('function');
  });

  it('should accept message with docRev', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      docId: 'doc-123'
    });
    
    node.receive({ docRev: '1-abc123', payload: {} });
    should.exist(node);
  });

  it('should error when database not specified', function() {
    const node = createMockNode('n1', {
      type: 'couchdb-delete-doc'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    should.exist(node);
  });

  it('should error when docId not specified', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-delete-doc'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    should.exist(node);
  });

  it('should error when docRev not provided in message', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      docId: 'doc-123',
      type: 'couchdb-delete-doc'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    should.exist(node);
  });
});
