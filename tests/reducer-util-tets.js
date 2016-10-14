import sinon from 'sinon';
import reducer from '../lib/reducer-util';
var expect = require('chai').expect;

var emptyState = {};
var savedEmptyState = JSON.parse(JSON.stringify(emptyState));
var initialState1 = {
  index: {
    '1': {
      __meta: {
        state: 'SOMETHING',
        fetched: 'partial',
        customMetaProp: 'foo'
      },
      foo: 'abc',
      beep: 'boop'
    }
  }
};
var savedInitialState1 = JSON.parse(JSON.stringify(initialState1));


describe('reducer-util', function () {
  var fooActionHandler = reducer('FOO');

  it ('should return provided state for N/A action type', function () {
    var state = fooActionHandler(emptyState, {
      type: 'BAR_FETCH_SUCCESS',
      payload: {
        __meta: {
          id: '1'
        },
        foo: 'bar'
      }
    });
    expect(state).to.equal(emptyState);
  });

  describe('FETCH_SUCCESS', function () {
    it ('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          __meta: {
            id: '1'
          },
          foo: 'bar'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              fetched: 'full',
              fetchPending: false
            },
            foo: 'bar'
          }
        }
      });
    });

    it('should update an existing model but keep existing custom meta properties', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          __meta: {
            id: '1'
          },
          foo: 'bar'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              fetched: 'full',
              fetchPending: false,
              customMetaProp: 'foo'
            },
            foo: 'bar'
          }
        }
      });
    });
  });


  describe('FETCH_PENDING', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_FETCH_PENDING',
        payload: {
          __meta: {
            id: '1'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_PENDING',
              fetched: false,
              fetchPending: true
            }
          }
        }
      });
    });
    it('should accept id outside of __meta', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_FETCH_PENDING',
        payload: {
          id: '1'
        }
      });
      expect(emptyState).to.not.equal(state);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_PENDING',
              fetched: false,
              fetchPending: true
            }
          }
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_FETCH_PENDING',
        payload: {
          __meta: {
            id: '1'
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_PENDING',
              fetched: false,
              fetchPending: true,
              customMetaProp: 'foo'
            }
          }
        }
      });
    });
  });


  describe('FETCH_ERROR', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_FETCH_ERROR',
        payload: {
          __meta: {
            id: '1'
          },
          code: 'bad'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_ERROR',
              fetched: false,
              fetchPending: false,
              fetchError: {
                code: 'bad'
              }
            }
          }
        }
      });
    });
    it('should accept id outside of __meta', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_FETCH_ERROR',
        payload: {
          id: '1',
          code: 'bad'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_ERROR',
              fetched: false,
              fetchPending: false,
              fetchError: {
                id: '1',
                code: 'bad'
              }
            }
          }
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_FETCH_ERROR',
        payload: {
          __meta: {
            id: '1'
          },
          code: 'bad'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'FETCH_ERROR',
              fetched: false,
              fetchPending: false,
              fetchError: {
                code: 'bad'
              },
              customMetaProp: 'foo'
            }
          }
        }
      });
    });
  });


  describe('ACTION_SUCCESS', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_ACTION_SUCCESS',
        payload: {
          __meta: {
            id: '1',
            actionId: 'test'
          },
          foo: 'bar'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_SUCCESS',
              actionId: 'test',
              actionResponse: {
                foo: 'bar'
              },
              actionPending: false
            }
          }
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_ACTION_SUCCESS',
        payload: {
          __meta: {
            id: '1',
            actionId: 'test'
          },
          foo: 'bar'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_SUCCESS',
              fetched: 'partial',
              customMetaProp: 'foo',
              actionId: 'test',
              actionResponse: {
                foo: 'bar'
              },
              actionPending: false
            },
            foo: 'abc',
            beep: 'boop'
          }
        }
      });
    });
  });


  describe('ACTION_PENDING', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_ACTION_PENDING',
        payload: {
          __meta: {
            id: '1',
            actionId: 'bar'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_PENDING',
              actionId: 'bar',
              actionPending: true
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_ACTION_PENDING',
        payload: {
          __meta: {
            id: '1',
            actionId: 'bar'
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_PENDING',
              fetched: 'partial',
              actionId: 'bar',
              actionPending: true,
              customMetaProp: 'foo'
            },
            foo: 'abc',
            beep: 'boop'
          }
        }
      });
    });
  });

  describe('ACTION_ERROR', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_ACTION_ERROR',
        payload: {
          __meta: {
            id: '1',
            actionId: 'bar'
          },
          abc: 'def'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_ERROR',
              actionId: 'bar',
              actionError: {
                abc: 'def'
              },
              actionPending: false
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_ACTION_ERROR',
        payload: {
          __meta: {
            id: '1',
            actionId: 'bar'
          },
          abc: 'def'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: 'ACTION_ERROR',
              fetched: 'partial',
              actionId: 'bar',
              actionError: {
                abc: 'def'
              },
              actionPending: false,
              customMetaProp: 'foo'
            },
            foo: 'abc',
            beep: 'boop'
          }
        }
      });
    });
  });


  describe('ACTION_CLEAR', function () {
    it('should handle empty state', function () {
      var state = fooActionHandler(emptyState, {
        type: 'FOO_ACTION_CLEAR',
        payload: {
          __meta: {
            id: '1',
            actionId: 'bar'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: undefined
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooActionHandler(initialState1, {
        type: 'FOO_ACTION_CLEAR',
        payload: {
          __meta: {
            id: '1',
            state: undefined
          },
          abc: 'def'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        index: {
          '1': {
            __meta: {
              id: '1',
              state: undefined,
              fetched: 'partial',
              customMetaProp: 'foo'
            },
            foo: 'abc',
            beep: 'boop'
          }
        }
      });
    });
  });

});
