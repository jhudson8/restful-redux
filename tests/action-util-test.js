import sinon from 'sinon';
import actionCreator from '../lib/action-util';
var expect = require('chai').expect;

var fooActionCreator = actionCreator('FOO');

describe('action-util', function () {
  it('should handle simple fetch action', function () {
    var action = fooActionCreator.createFetchAction({
      id: '1',
      url: 'http://foo.com/thing/1'
    });

    expect(action[0]).to.deep.equal({
      type: 'FOO_FETCH_PENDING',
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
    var successAction = steps[0]({ foo: 'bar' });
    expect(successAction).to.deep.equal({
      type: 'FOO_FETCH_SUCCESS',
      payload: {
        foo: 'bar',
        __meta: {
          id: '1'
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
    var errorAction = steps[1]({ foo: 'bar' });
    expect(errorAction).to.deep.equal({
      type: 'FOO_FETCH_ERROR',
      payload: {
        foo: 'bar',
        __meta: {
          id: '1'
        }
      }
    });
  });

});
