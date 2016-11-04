import sinon from 'sinon';
import reducer from '../src/model-reducer';
var expect = require('chai').expect;

var emptyState = {};
var savedEmptyState = JSON.parse(JSON.stringify(emptyState));
var initialState1 = {
  entities: {
    _meta: {
      foo: {
        '1': {
          fetched: 'partial',
          customMetaProp: 'foo'
        }
      }
    },
    foo: {
      '1': {
        foo: 'abc',
        beep: 'boop'
      }
    }
  }
};
var savedInitialState1 = JSON.parse(JSON.stringify(initialState1));


describe('model-reducer', function () {
  var fooReducer = reducer('foo');

  it ('should return provided state for N/A action type', function () {
    var state = fooReducer(emptyState, {
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
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            foo: {
              '1': {
                beep: 'boop'
              }
            }
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'full',
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            }
          }
        }
      });
    });

    it('should update an existing model but keep existing custom meta properties', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            foo: {
              '1': {
                beep: 'boop'
              }
            }
          }
        }
      });;
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'full',
                customMetaProp: 'foo'
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            }
          }
        }
      });
    });
  });


  describe('FETCH_PENDING', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_FETCH_PENDING',
        payload: { id: '1' }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetchPending: true
              }
            }
          },
          foo: {}
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_FETCH_PENDING',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                customMetaProp: 'foo',
                fetchPending: true
              }
            }
          },
          foo: {}
        }
      });
    });
  });


  describe('FETCH_ERROR', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_FETCH_ERROR',
        payload: {
          id: '1',
          response: {
            code: 'bad'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: false,
                fetchError: {
                  code: 'bad'
                }
              }
            }
          },
          foo: {}
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_FETCH_ERROR',
        payload: {
          id: '1',
          response: {
            code: 'bad'
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                customMetaProp: 'foo',
                fetched: false,
                fetchError: {
                  code: 'bad'
                }
              }
            }
          },
          foo: {}
        }
      });
    });
  });


  describe('ACTION_SUCCESS', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_ACTION_SUCCESS',
        payload: {
          id: '1',
          actionId: 'test',
          response: {
            foo: 'bar'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'test',
                actionSuccess: true,
                actionResponse: {
                  foo: 'bar'
                }
              }
            }
          }
        }
      });
    });
    it('should clear out current model details and set new state', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_ACTION_SUCCESS',
        payload: {
          id: '1',
          actionId: 'test',
          entities: {
            foo: {
              '1': {
                newProp: 'new value'
              }
            }
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'partial',
                customMetaProp: 'foo',
                actionId: 'test',
                actionSuccess: true
              }
            }
          },
          foo: {
            '1': {
              newProp: 'new value'
            }
          }
        }
      });
    });
  });


  describe('ACTION_PENDING', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'bar'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionPending: true
              }
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'bar'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionPending: true,
                fetched: 'partial',
                customMetaProp: 'foo'
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop',
              foo: 'abc'
            }
          }
        }
      });
    });
  });

  describe('ACTION_ERROR', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_ACTION_ERROR',
        payload: {
          id: '1',
          actionId: 'bar',
          response: {
            abc: 'def'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionError: {
                  abc: 'def'
                }
              }
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_ACTION_ERROR',
        payload: {
          id: '1',
          actionId: 'bar',
          response: {
            abc: 'def'
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionError: {
                  abc: 'def'
                },
                customMetaProp: 'foo',
                fetched: 'partial'
              }
            }
          },
          foo: {
            '1': {
              foo: 'abc',
              beep: 'boop'
            }
          }
        }
      });
    });
  });


  describe('ACTION_CLEAR', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'foo_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {}
            }
          }
        }
      });
    });
    it('should work with existing model', function () {
      var state = fooReducer(initialState1, {
        type: 'foo_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                customMetaProp: 'foo',
                fetched: 'partial'
              }
            }
          },
          foo: {
            '1': {
              foo: 'abc',
              beep: 'boop'
            }
          }
        }
      });
    });

    it('should actually clear out an action', function () {
      var state = JSON.parse(JSON.stringify(initialState1));
      var meta = state.entities._meta.foo['1'];
      meta.actionId = 'actionId';
      meta.actionResponse = 'foo';
      meta.actionError = 'bar';
      meta.actionSuccess = true;
      state = fooReducer(state, {
        type: 'foo_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                customMetaProp: 'foo',
                fetched: 'partial'
              }
            }
          },
          foo: {
            '1': {
              foo: 'abc',
              beep: 'boop'
            }
          }
        }
      });
    });
  });
});
