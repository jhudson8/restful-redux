import sinon from 'sinon';
import Model from '../src/model';
var expect = require('chai').expect;

var nullEntities = undefined;

var emptyEntities = {
};

var noMetaEntities = {
  foo: {
    '1': {
      foo: 'bar'
    }
  }
};

var metaEntities = {
  _meta: {
    foo: {
      '1': {}
    }
  },
  foo: {
    '1': {
      foo: 'bar'
    }
  }
};

function options(entitiesOrMeta, isEntities) {
  var entities = isEntities ? entitiesOrMeta : copyMetaEntities(entitiesOrMeta);
  return {
    id: '1',
    domain: 'foo',
    entities: entities
  };
}

function copyMetaEntities(meta) {
  var entities = JSON.parse(JSON.stringify(metaEntities));
  Object.assign(entities._meta.foo['1'], meta);
  return entities;
}

describe('model', function () {

  describe('data', function () {
    it('should return with a provided domain and id', function () {
      var model = new Model(options(noMetaEntities, true));
      expect(model.data()).to.deep.equal({foo: 'bar'});
    });

    it('should not fail if no domain exists', function () {
      var model = new Model(options(nullEntities, true));
      expect(model.data()).to.deep.equal(undefined);
    });
  });


  describe('wasFetched', function () {
    it('should return "exists" if the model exists with no meta value', function () {
      var model = new Model(options(noMetaEntities, true));
      expect(model.wasFetched()).to.equal('exists');
    });

    it('should return the meta "fetched" if exists', function () {
      var model = new Model(options({ fetched: 'full' }));
      expect(model.wasFetched()).to.equal('full');
    });
  });


  describe('isFetchPending', function () {
    it('should return true if a fetch is pending', function () {
      var model = new Model(options({ fetchPending: true }));
      expect(model.isFetchPending()).to.equal(true);
    });

    it('should return false if a fetch is not pending', function () {
      var model = new Model(options({ }));
      expect(model.isFetchPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = new Model(options({ }, true));
      expect(model.isFetchPending()).to.equal(false);
    });
  });


  describe('fetchError', function () {
    it('should return the fetch error', function () {
      var model = new Model(options({ fetchError: {foo: 'bar'} }));
      expect(model.fetchError()).to.deep.equal({foo: 'bar'});
    });

    it('should return undefined if no model exists', function () {
      var model = new Model(options({ }, true));
      expect(model.fetchError()).to.equal(undefined);
    });
  });


  describe('isActionPending', function () {
    it('should return the action id if any action is pending', function () {
      var model = new Model(options({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending()).to.equal('foo');
    });

    it('should return true if a specific action is pending', function () {
      var model = new Model(options({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending('foo')).to.equal(true);
    });

    it('should return false if a different action is pending', function () {
      var model = new Model(options({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending('bar')).to.equal(false);
    });

    it('should return false if an action is not pending', function () {
      var model = new Model(options({ }));
      expect(model.isActionPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = new Model(options({ }, true));
      expect(model.isActionPending()).to.equal(false);
    });
  });


  describe('wasActionPerformed', function () {
    it('should return the action details if any action was performed', function () {
      var model = new Model(options({ actionId: 'foo', actionResponse: { foo: 'bar' } }));
      expect(model.wasActionPerformed()).to.deep.equal({ id: 'foo', success: { foo: 'bar' }, error: undefined });
    });

    it('should return action details if a specific action was performed', function () {
      var model = new Model(options({ actionId: 'foo', actionResponse: { foo: 'bar' } }));
      expect(model.wasActionPerformed('foo')).to.deep.equal({ id: 'foo', success: { foo: 'bar' }, error: undefined });
    });

    it('should return action error details if an action failed', function () {
      var model = new Model(options({ actionId: 'foo', actionError: { foo: 'bar' } }));
      expect(model.wasActionPerformed('foo')).to.deep.equal({ id: 'foo', error: { foo: 'bar' }, success: undefined });
    });

    it('should return undefined if a different action was performed', function () {
      var model = new Model(options({ actionId: 'foo', actionError: { foo: 'bar' } }));
      expect(model.wasActionPerformed('bar')).to.equal(undefined);
    });

    it('should return undefined if an action was not performed', function () {
      var model = new Model(options({ }));
      expect(model.wasActionPerformed()).to.equal(undefined);
    });
  });

});

function _model(meta, model) {
  return Object.assign({}, model || {}, { __meta: meta });
}
