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
  describe('bubbleUp', function () {
    var actionCreator = createActionCreator({
      actionPrefix: 'FOO',
      entityType: 'foo',
      bubbleUp: false
    });
    it('should include bubbleUp:false in payload if bubbleUp=false in action creator options', function () {
      var action = actionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction[0]).to.deep.equal({
        type: 'FETCH_SUCCESS',
        payload: {
          id: '1',
          result: {
            foo: 'bar'
          },
          bubbleUp: false
        }
      });
      expect(action[1]).to.deep.equal({
        payload: {
          bubbleUp: false,
          id: '1'
        },
        type: 'FOO_FETCH_PENDING'
      });
    });
    it ('should include bubbleUp:false in payload if formatter result bubbleUp:false', function () {
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1',
        formatter: function (data) {
          return {
            result: data,
            bubbleUp: false
          };
        }
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction[0]).to.deep.equal({
        type: 'FETCH_SUCCESS',
        payload: {
          id: '1',
          result: {
            foo: 'bar'
          },
          bubbleUp: false
        }
      });
    });
  });

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
    describe('formatter', function () {
      it('should work with formatter that returns undefined', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createFetchAction({
          id: '1',
          url: 'http://foo.com/thing/1',
          formatter: function (payload) {}
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
      });
      it('should work with formatter that returns the same payload', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createFetchAction({
          id: '1',
          url: 'http://foo.com/thing/1',
          formatter: function (payload) {
            return payload;
          }
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
      });
      it('should work with formatter that returns new data', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createFetchAction({
          id: '1',
          url: 'http://foo.com/thing/1',
          formatter: function () {
            return {
              result: { abc: 'def' },
              data: { ghi: 'jkl' }
            };
          }
        });
        var steps = action[0].meta.steps[0];
        var successAction = steps[0]({ value: { foo: 'bar' } });
        expect(successAction[0]).to.deep.equal({
          type: 'FETCH_SUCCESS',
          payload: {
            id: '1',
            result: {
              abc: 'def'
            },
            data: { ghi: 'jkl' }
          }
        });
      });
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

    it('should handle success event as a function', function () {
      var handler = function (payload) {
        return Object.assign(payload, {test: 'foo'});
      };
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1',
        successAction: handler
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      var dispatch = sinon.spy();
      successAction[2](dispatch);
      expect(dispatch.firstCall.args[0]).to.deep.equal({result: {foo: 'bar'}, id: '1', test: 'foo'});
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

  describe('Local actions', function () {
    it('createModelDataAction', function () {
      var action = fooActionCreator.createModelDataAction('1', { foo: 'bar' });
      expect(action).to.deep.equal({
        type: 'FOO_SET_DATA',
        payload: {
          id: '1',
          data: {
            foo: 'bar'
          }
        }
      });
    });
    it('createLocalPutAction', function () {
      var action = fooActionCreator.createLocalPutAction('1', { foo: 'bar' });
      expect(action).to.deep.equal({
        type: 'FOO_SET',
        payload: {
          id: '1',
          result: {
            foo: 'bar'
          }
        }
      });
    });
    it('createLocalDeleteAction', function () {
      var action = fooActionCreator.createLocalDeleteAction('1');
      expect(action).to.deep.equal({
        type: 'FOO_DELETE',
        payload: {
          id: '1'
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
    describe('formatter', function () {
      it('should work when undefined is returned', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createPostAction({
          id: '1',
          actionId: 'beep',
          url: 'http://foo.com/thing/1',
          formatter: function () {}
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
      it('should work when the same payload is returned', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createPostAction({
          id: '1',
          actionId: 'beep',
          url: 'http://foo.com/thing/1',
          formatter: function (payload) { return payload; }
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
      it('should override the response', function () {
        var _actionCreator = createActionCreator({
          actionPrefix: 'FOO',
          entityType: 'foo'
        });
        var action = _actionCreator.createPostAction({
          id: '1',
          actionId: 'beep',
          url: 'http://foo.com/thing/1',
          formatter: function () { return { response: { abc: 'def' }, data: { ghi: 'jkl' } }; }
        });
        var steps = action[0].meta.steps[0];
        var successAction = steps[0]({ value: { foo: 'bar' } });
        expect(successAction[1]).to.deep.equal({
          type: 'FOO_ACTION_SUCCESS',
          payload: {
            id: '1',
            actionId: 'beep',
            response: {
              abc: 'def'
            },
            data: {
              ghi: 'jkl'
            }
          }
        });
      });
    });

    it('should obey `replaceModel`', function () {
      var action = fooActionCreator.createPostAction({
        id: '1',
        actionId: 'beep',
        url: 'http://foo.com/thing/1',
        replaceModel: true
      });
      var steps = action[0].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction[1]).to.deep.equal({
        type: 'FOO_ACTION_SUCCESS',
        payload: {
          id: '1',
          actionId: 'beep',
          result: {
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
});
