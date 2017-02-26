/* global it, describe */
import sinon from 'sinon';
import { createActionCreator } from '../../src';
import { normalize, schema } from 'normalizr';
var expect = require('chai').expect;

var personSchema = new schema.Entity('people');
var fooSchema = new schema.Entity('foo');
fooSchema.define({
  author: personSchema
});

var fooActionCreator = createActionCreator({
  actionPrefix: 'FOO',
  entityType: 'foo',
  normalize: normalize
});
var normalizedFooActionCreator = createActionCreator({
  actionPrefix: 'FOO',
  entityType: 'foo',
  normalize: normalize
});

describe('redux-effects-action-creator', function () {
  describe('createFetchAction', function() {
    it('should handle simple fetch action', function () {
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });

      expect(action[0].type).to.equal('EFFECT_COMPOSE');
      expect(action[0].payload).to.deep.equal({
        type: 'EFFECT_FETCH',
        payload: {
          url: 'http://foo.com/thing/1',
          params: {
            method: 'GET'
          }
        }
      });
      var steps = action[0].meta.steps;
      expect(steps.length).to.equal(1);
    });

    it('should handle success event', function () {
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1',
        successAction: {foo: 'success'}
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction[0]).to.deep.equal({
        type: 'FETCH_SUCCESS',
        payload: {
          id: '1',
          result: {
            foo: 'bar'
          }
        }
      });
      expect(successAction[1]).to.deep.equal({
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
          result: {
            foo: 'bar'
          }
        }
      });
      var dispatch = sinon.spy();
      successAction[2](dispatch);
      expect(dispatch.callCount).to.equal(1);
      expect(dispatch.firstCall.args).to.deep.equal([{foo: 'success'}]);
    });

    it('should normalize on success event', function () {
      var action = normalizedFooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1',
        schema: fooSchema
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: {
        id: '1',
        foo: 'bar',
        author: {
          id: '1',
          firstName: 'Joe',
          lastName: 'Hudson'
        }
      }});
      expect(successAction[1]).to.deep.equal({
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
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
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[0].meta.steps[0];
      var errorAction = steps[1]({ value: { foo: 'bar' } });
      expect(errorAction[0]).to.deep.equal({
        type: 'FETCH_ERROR',
        payload: {
          id: '1',
          response: {
            value : {
              foo: 'bar'
            }
          }
        }
      });
      expect(errorAction[1]).to.deep.equal({
        type: 'FOO_FETCH_ERROR',
        payload: {
          id: '1',
          response: {
            value : {
              foo: 'bar'
            }
          }
        }
      });
    });

  });

  describe('other XHR actions', function() {
    it('should handle simple XHR POST action', function () {
      var action = fooActionCreator.createPostAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });

      expect(action[0].type).to.equal('EFFECT_COMPOSE');
      expect(action[0].payload).to.deep.equal({
        type: 'EFFECT_FETCH',
        payload: {
          url: 'http://foo.com/thing/1',
          params: {
            method: 'POST'
          }
        }
      });
      expect(action[1]).to.deep.equal({
        type: 'FOO_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'beep'
        }
      });
      var steps = action[0].meta.steps;
      expect(steps.length).to.equal(1);
    });

    it('should handle success event', function () {
      var action = fooActionCreator.createPostAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction[1]).to.deep.equal({
        type: 'FOO_ACTION_SUCCESS',
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
      var action = fooActionCreator.createPostAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[0].meta.steps[0];
      var errorAction = steps[1]({ value: { foo: 'bar' } });
      expect(errorAction[1]).to.deep.equal({
        type: 'FOO_ACTION_ERROR',
        payload: {
          id: '1',
          actionId: 'beep',
          response: {
            value: {
              foo: 'bar'
            }
          }
        }
      });
    });
  });

  describe('createModelDataAction', function() {
    it('should handle data action', function () {
      var action = fooActionCreator.createModelDataAction('1', {foo: 'bar'});
      expect(action).to.deep.equal({
        type: 'FOO_DATA',
        payload: {
          id: '1',
          data: {
            foo: 'bar'
          }
        }
      });
    });
  });
});
