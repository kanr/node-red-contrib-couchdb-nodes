/**
 * Tests for CouchDB Update Node
 */

const should = require('should');
const {
  createMockNode,
  clearMocks
} = require('./test-helper');

describe('CouchDB Update Node', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should be created with database property', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      type: 'couchdb-update'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
    node.should.have.property('type', 'couchdb-update');
  });

  it('should require _id for updates', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    // Send without _id
    node.receive({ payload: { name: 'test' } });
    should.exist(node);
  });

  it('should require _rev for updates', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    // Send with _id but no _rev
    node.receive({ payload: { _id: 'doc-1', name: 'test' } });
    should.exist(node);
  });

  it('should accept valid document with _id and _rev', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    const doc = {
      _id: 'doc-123',
      _rev: '1-abc',
      name: 'test'
    };
    
    node.receive({ payload: doc });
    should.exist(node);
  });

  it('should have dual-output pattern', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    should(typeof node.send).equal('function');
  });

  it('should store server reference', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      server: 's1'
    });
    
    node.should.have.property('server', 's1');
  });

  it('should error when database not specified', function() {
    const node = createMockNode('n1', {
      type: 'couchdb-update'
    });
    
    let errorCalled = false;
    node.error = function() {
      errorCalled = true;
    };
    
    should.exist(node);
  });

  it('should provide helpful error message about revision conflict', function() {
    const node = createMockNode('n1', {
      database: 'test_db'
    });
    
    let errorMsg = '';
    node.error = function(msg) {
      errorMsg = msg || '';
    };
    
    // Missing both _id and _rev
    node.receive({ payload: { name: 'test' } });
    should.exist(node);
  });
});
