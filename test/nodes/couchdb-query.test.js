/**
 * Tests for CouchDB Query Node
 */

const should = require('should');
const {
  createMockNode,
  clearMocks
} = require('./test-helper');

describe('CouchDB Query Node', function() {
  
  beforeEach(function() {
    clearMocks();
  });

  afterEach(function() {
    clearMocks();
  });

  it('should be created with database and view properties', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all'
    });
    
    should.exist(node);
    node.should.have.property('database', 'test_db');
    node.should.have.property('view', 'design/all');
  });

  it('should store server node reference', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      server: 's1'
    });
    
    node.should.have.property('server', 's1');
  });

  it('should handle message with include_docs', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      include_docs: true
    });
    
    node.should.have.property('include_docs', true);
  });

  it('should have configurable key parameter', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      key: 'mykey'
    });
    
    node.should.have.property('key', 'mykey');
  });

  it('should have configurable limit parameter', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      limit: 50
    });
    
    node.should.have.property('limit', 50);
  });

  it('should support skip parameter', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      skip: 10
    });
    
    node.should.have.property('skip', 10);
  });

  it('should handle descending order option', function() {
    const node = createMockNode('n1', {
      database: 'test_db',
      view: 'design/all',
      descending: true
    });
    
    node.should.have.property('descending', true);
  });
});
