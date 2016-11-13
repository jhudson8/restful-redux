import sinon from 'sinon';
import actionCreator from '../../src/action-creator/redux-effects';
import { normalize, Schema, arrayOf } from 'normalizr';
var expect = require('chai').expect;

var personSchema = new Schema('people');
var fooSchema = new Schema('foo');
fooSchema.define({
  author: personSchema
});

var fooActionCreator = actionCreator('foo', { normalize: normalize });
var normalizedFooActionCreator = actionCreator('foo', {
  normalize: normalize
});

describe('redux-effects-action-creator', function () {
  // TODO add tests for formatter and normalizr

  describe('modelFetchAction', function() {
    it('should handle simple fetch action', function () {
      var action = fooActionCreator.modelFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });

      expect(action[0]).to.deep.equal({
        type: 'foo_MODEL_FETCH_PENDING',
        payload: {
          id: '1'
        }
      });
      expect(action[1].type).to.equal('EFFECT_COMPOSE');
      expect(action[1].payload).to.deep.equal({
        type: 'EFFECT_FETCH',
        payload: {
          url: 'http://foo.com/thing/1',
          params: {}
        }
      });
      var steps = action[1].meta.steps;
      expect(steps.length).to.equal(1);
    });

    it('should handle success event', function () {
      var action = fooActionCreator.modelFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction).to.deep.equal({
        type: 'foo_MODEL_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            foo: {
              '1': {
                foo: 'bar'
              }
            }
          }
        }
      });
    });

    it.only('should normalize on success event', function () {
      var action = normalizedFooActionCreator.modelFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1',
        schema: fooSchema
      });
      var steps = action[1].meta.steps[0];
      var successAction = steps[0]({ value: {
        id: '1',
        foo: 'bar',
        author: {
          id: '1',
          firstName: 'Joe',
          lastName: 'Hudson'
        }
      }});
      expect(successAction).to.deep.equal({
        type: 'foo_MODEL_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            people: {
              '1': {
                id: '1',
                firstName: 'Joe',
                lastName: 'Hudson'
              }
            },
            foo: {
              '1': {
                id: '1',
                foo: 'bar',
                author: '1'
              }
            }
          }
        }
      });
    });

    it('should handle error event', function () {
      var action = fooActionCreator.modelFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var errorAction = steps[1]({ value: { foo: 'bar' } });
      expect(errorAction).to.deep.equal({
        type: 'foo_MODEL_FETCH_ERROR',
        payload: {
          id: '1',
          response: {
            foo: 'bar'
          }
        }
      });
    });

  });

  describe('actions', function() {
    it('should handle simple XHR action', function () {
      var action = fooActionCreator.createXHRAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });

      expect(action[0]).to.deep.equal({
        type: 'foo_MODEL_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'beep'
        }
      });
      expect(action[1].type).to.equal('EFFECT_COMPOSE');
      expect(action[1].payload).to.deep.equal({
        type: 'EFFECT_FETCH',
        payload: {
          url: 'http://foo.com/thing/1',
          params: {}
        }
      });
      var steps = action[1].meta.steps;
      expect(steps.length).to.equal(1);
    });

    it('should handle success event', function () {
      var action = fooActionCreator.createXHRAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction).to.deep.equal({
        type: 'foo_MODEL_ACTION_SUCCESS',
        payload: {
          id: '1',
          actionId: 'beep',
          response: {
            foo: 'bar'
          }
        }
      });
    });

    it('should handle error event', function () {
      var action = fooActionCreator.createXHRAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var errorAction = steps[1]({ value: { foo: 'bar' } });
      expect(errorAction).to.deep.equal({
        type: 'foo_MODEL_ACTION_ERROR',
        payload: {
          id: '1',
          actionId: 'beep',
          response: {
            foo: 'bar'
          }
        }
      });
    });

  });

});
