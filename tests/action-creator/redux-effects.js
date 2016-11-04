import sinon from 'sinon';
import actionCreator from '../../src/action-creator/redux-effects';
var expect = require('chai').expect;

var fooActionCreator = actionCreator('foo');

describe('redux-effects-action-creator', function () {
  // TODO add tests for formatter and normalizr

  describe('fetching', function() {
    it('should handle simple fetch action', function () {
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });

      expect(action[0]).to.deep.equal({
        type: 'foo_FETCH_PENDING',
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
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var successAction = steps[0]({ value: { foo: 'bar' } });
      expect(successAction).to.deep.equal({
        type: 'foo_FETCH_SUCCESS',
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

    it('should handle error event', function () {
      var action = fooActionCreator.createFetchAction({
        id: '1',
        url: 'http://foo.com/thing/1'
      });
      var steps = action[1].meta.steps[0];
      var errorAction = steps[1]({ value: { foo: 'bar' } });
      expect(errorAction).to.deep.equal({
        type: 'foo_FETCH_ERROR',
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
        type: 'foo_ACTION_PENDING',
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
        type: 'foo_ACTION_SUCCESS',
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
        type: 'foo_ACTION_ERROR',
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
