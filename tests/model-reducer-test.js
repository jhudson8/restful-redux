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
          data: {
            customMetaProp: 'foo'
          }
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
  var fooReducer = reducer({
    actionPrefix: 'FOO',
    entityType: 'foo'
  });

  describe('join', function () {
    var origState = {};
    var reducer1 = function (state, action) {
      if (action === 'foo') {
        return 'foo';
      }
      return state;
    }
    var reducer2 = function (state, action) {
      if (action === 'bar') {
        return 'bar';
      }
      return state;
    }
    var joined = reducer.join([reducer1, reducer2]);

    it('should return orig state if no reducers are matched', function () {
      var state = joined(origState, 'abc');
      expect(state).to.equal(origState);
    });
    it('should return new state if a reducer is matched', function () {
      var state = joined(origState, 'foo');
      expect(state).to.equal('foo');
    });
    it('should work with multiple reducers', function () {
      var state = joined(origState, 'bar');
      expect(state).to.equal('bar');
    });
  });

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

  describe('DATA', function () {
    it('should add new data attribute', function () {
      var state = fooReducer(initialState1, {
        type: 'FOO_DATA',
        payload: {
          id: '1',
          data: {
            boop: 'beep'
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
                data: {
                  customMetaProp: 'foo',
                  boop: 'beep'
                }
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

    it('should remove existing data attribute', function () {
      var state = fooReducer(initialState1, {
        type: 'FOO_DATA',
        payload: {
          id: '1',
          data: {
            boop: 'beep',
            customMetaProp: undefined
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
                data: {
                  boop: 'beep'
                }
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

    it('should remove all data state', function () {
      var state = fooReducer(initialState1, {
        type: 'FOO_DATA',
        payload: {
          id: '1',
          data: false
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
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

  describe('FETCH_SUCCESS', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'FOO_FETCH_SUCCESS',
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
      // don't deal with dymanic value
      delete state.entities._meta.foo['1'].fetchTimestamp;
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
        type: 'FOO_FETCH_SUCCESS',
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
      delete state.entities._meta.foo['1'].fetchTimestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'full',
                data: {
                  customMetaProp: 'foo'
                }
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

    it('should handle "data" state', function () {
      var state = fooReducer(emptyState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            foo: {
              '1': {
                beep: 'boop'
              }
            }
          },
          data: {
            abc: 'def'
          }
        }
      });
      // don't deal with dymanic value
      delete state.entities._meta.foo['1'].fetchTimestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'full',
                data: {
                  abc: 'def'
                }
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
        type: 'FOO_FETCH_PENDING',
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
          }
        }
      });
    });
    it('should keep current model details and set new state', function () {
      var state = fooReducer(initialState1, {
        type: 'FOO_FETCH_PENDING',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetchPending: true,
                data: {
                  customMetaProp: 'foo'
                }
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


  describe('FETCH_ERROR', function () {
    it('should handle empty state', function () {
      var state = fooReducer(emptyState, {
        type: 'FOO_FETCH_ERROR',
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
        type: 'FOO_FETCH_ERROR',
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
                fetched: false,
                fetchError: {
                  code: 'bad'
                },
                data: {
                  customMetaProp: 'foo'
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
        type: 'FOO_ACTION_SUCCESS',
        payload: {
          id: '1',
          actionId: 'test',
          response: {
            foo: 'bar'
          }
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      delete state.entities._meta.foo['1'].actionTimestamp;
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
        type: 'FOO_ACTION_SUCCESS',
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
      delete state.entities._meta.foo['1'].actionTimestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'partial',
                actionId: 'test',
                actionSuccess: true,
                data: {
                  customMetaProp: 'foo'
                }
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
        type: 'FOO_ACTION_PENDING',
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
        type: 'FOO_ACTION_PENDING',
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
                data: {
                  customMetaProp: 'foo'
                }
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
        type: 'FOO_ACTION_ERROR',
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
        type: 'FOO_ACTION_ERROR',
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
                fetched: 'partial',
                data: {
                  customMetaProp: 'foo'
                }
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
        type: 'FOO_ACTION_CLEAR',
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
        type: 'FOO_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'partial',
                data: {
                  customMetaProp: 'foo'
                }
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
        type: 'FOO_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: 'partial',
                data: {
                  customMetaProp: 'foo'
                }
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
