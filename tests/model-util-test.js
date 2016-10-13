import sinon from 'sinon';
import modelUtil from '../lib/model-util';
var expect = require('chai').expect;

describe('model-util', function () {

  describe('data', function () {
    it('should return with a provided model', function () {
      var model = modelUtil({foo: 'bar'});
      expect(model.data).to.deep.equal({foo: 'bar'});
    });

    it('should return with a provided domain and id', function () {
      var model = modelUtil({index: {'1': {foo: 'bar'}}}, '1');
      expect(model.data).to.deep.equal({foo: 'bar'});
    });

    it('should not fail if no domain exists', function () {
      var model = modelUtil(undefined, '1');
      expect(model.data).to.equal(undefined);
    });

    it('should not fail if no domain index exists', function () {
      var model = modelUtil(undefined, '1');
      expect(model.data).to.equal(undefined);
    });
  });


  describe('fetched', function () {
    it('should not return anything if the model', function () {
      var model = modelUtil(_model({}, {foo: 'bar'}));
      expect(model.fetched()).to.equal(undefined);
    });

    it('should return the model if it has been fetched', function () {
      var model = modelUtil(_model({ wasFetchSuccess: true }, { foo: 'bar' }));
      expect(model.fetched()).to.deep.equal({ __meta: { wasFetchSuccess: true }, foo: 'bar' });
    });
  });


  describe('isFetchPending', function () {
    it('should return true if a fetch is pending', function () {
      var model = modelUtil(_model({ fetchPending: true }));
      expect(model.isFetchPending()).to.equal(true);
    });

    it('should return false if a fetch is not pending', function () {
      var model = modelUtil(_model({ }));
      expect(model.isFetchPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = modelUtil();
      expect(model.isFetchPending()).to.equal(false);
    });
  });


  describe('fetchError', function () {
    it('should the fetch error', function () {
      var model = modelUtil(_model({ fetchError: {foo: 'bar'} } ));
      expect(model.fetchError()).to.deep.equal({foo: 'bar'});
    });

    it('should return undefined if no model exists', function () {
      var model = modelUtil();
      expect(model.fetchError()).to.equal(undefined);
    });
  });


  describe('isActionPending', function () {
    it('should return the action id if any action is pending', function () {
      var model = modelUtil(_model({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending()).to.equal('foo');
    });

    it('should return true if a specific action is pending', function () {
      var model = modelUtil(_model({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending('foo')).to.equal(true);
    });

    it('should return false if a different action is pending', function () {
      var model = modelUtil(_model({ actionPending: true, actionId: 'foo' }));
      expect(model.isActionPending('bar')).to.equal(false);
    });

    it('should return false if an action is not pending', function () {
      var model = modelUtil(_model({ }));
      expect(model.isActionPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = modelUtil();
      expect(model.isActionPending()).to.equal(false);
    });
  });


  describe('actionPerformed', function () {
    it('should return the action details if any action was performed', function () {
      var model = modelUtil(_model({ actionId: 'foo', actionResponse: { foo: 'bar' } }));
      expect(model.actionPerformed()).to.deep.equal({ id: 'foo', success: { foo: 'bar' }, error: undefined });
    });

    it('should return action details if a specific action was performed', function () {
      var model = modelUtil(_model({ actionId: 'foo', actionResponse: { foo: 'bar' } }));
      expect(model.actionPerformed('foo')).to.deep.equal({ id: 'foo', success: { foo: 'bar' }, error: undefined });
    });

    it('should return action error details if an action failed', function () {
      var model = modelUtil(_model({ actionId: 'foo', actionError: { foo: 'bar' } }));
      expect(model.actionPerformed('foo')).to.deep.equal({ id: 'foo', error: { foo: 'bar' }, success: undefined });
    });

    it('should return undefined if a different action was performed', function () {
      var model = modelUtil(_model({ actionId: 'foo', actionResponse: { foo: 'bar' }, error: undefined }));
      expect(model.actionPerformed('bar')).to.equal(undefined);
    });

    it('should return undefined if an action was not performed', function () {
      var model = modelUtil(_model({  }));
      expect(model.actionPerformed()).to.equal(undefined);
    });

    it('should not fail if no model is provided', function () {
      var model = modelUtil();
      expect(model.actionPerformed()).to.equal(undefined);
    });
  });

});

function _model(meta, model) {
  return Object.assign({}, model || {}, { __meta: meta });
}
