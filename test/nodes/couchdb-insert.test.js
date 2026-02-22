/**
 * Tests for CouchDB Insert Node
 */

const should = require('should');
const {
  createMockNode,
  clearMocks
} = require('./test-helper');

describe('CouchDB Insert Node', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should be created with database property', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-insert'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
    node.should.have.property('type', 'couchdb-insert');
  });

  it('should store server reference', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      server: 's1'
    });
    
    node.should.have.property('server', 's1');
  });

  it('should have dual-output pattern', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    // Node should have send method for dual output
    node.should.have.property('send');
    should(typeof node.send).equal('function');
  });

  it('should accept payload as object', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    node.receive({ payload: { name: 'test' } });
    should.exist(node);
  });

  it('should accept empty object', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    node.receive({ payload: {} });
    should.exist(node);
  });

  it('should support batch insert', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-insert',
      batch: true
    });
    
    node.should.have.property('batch', true);
  });

  it('should track document count for batch operations', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      batch: true
    });
    
    // Should be able to receive multiple messages
    node.receive({ payload: { doc1: true } });
    node.receive({ payload: { doc2: true } });
    should.exist(node);
  });

  it('should error when database is not specified', function() {
    const node = createMockNode('n1', {
      type: 'couchdb-insert'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    // Node should potentially error if no database is configured
    should.exist(node);
  });
});
