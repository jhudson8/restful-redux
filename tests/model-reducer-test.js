/* global it, describe */

import { createReducer, chainReducers } from '../src';
const expect = require('chai').expect;

const emptyState = {};
Object.freeze(emptyState);
const savedEmptyState = JSON.parse(JSON.stringify(emptyState));
const initialState1 = {
  entities: {
    _meta: {
      foo: {
        '1': {
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
Object.freeze(savedInitialState1);
const savedInitialState1 = JSON.parse(JSON.stringify(initialState1));
const initialState2 = {
  entities: {
    _meta: {
      foo: {
        '1': {
          data: {
            customMetaProp: 'foo'
          }
        },
        '2': {
          data: {
            customMetaProp: 'bar'
          }
        },
      }
    },
    foo: {
      '1': {
        foo: 'abc',
        beep: 'boop'
      },
      '2': {
        abc: 'def',
        ghi: 'jkl'
      }
    }
  }
};
Object.freeze(savedInitialState2);
const savedInitialState2 = JSON.parse(JSON.stringify(initialState2));
var bubbleUpTestState = {
  entities: {
    _meta: {
      fooList: {
        'l1': {
          fetched: { type: 'full' }
        }
      },
      foo: {
        '1': {
          fetched: { type: 'normalized' },
          fetchedBy: { entityType: 'fooList', id: 'l1' }
        }
      }
    },
    fooList: {
      'l1': ['1']
    },
    foo: {
      '1': { foo: 'bar' }
    }
  }
};
Object.freeze(bubbleUpTestState);
const savedbubbleUpTestState = JSON.parse(JSON.stringify(bubbleUpTestState));

describe('model-reducer', function () {
  const fooReducer = createReducer({
    actionPrefix: 'FOO',
    entityType: 'foo'
  });

  describe('chainReducers', function () {
    const origState = {};
    const reducer1 = function (state, action) {
      if (action === 'foo') {
        return 'foo';
      }
      return state;
    };
    const reducer2 = function (state, action) {
      if (action === 'bar') {
        return 'bar';
      }
      return state;
    };
    const joined = chainReducers([reducer1, reducer2]);

    it('should return orig state if no reducers are matched', function () {
      const state = joined(origState, 'abc');
      expect(state).to.equal(origState);
    });
    it('should return new state if a reducer is matched', function () {
      const state = joined(origState, 'foo');
      expect(state).to.equal('foo');
    });
    it('should work with multiple reducers', function () {
      const state = joined(origState, 'bar');
      expect(state).to.equal('bar');
    });
  });

  it ('should return provided state for N/A action type', function () {
    const state = fooReducer(emptyState, {
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

  describe('bubbleUp', function () {
    it('should shallow copy the state by default', function () {
      const state = fooReducer(bubbleUpTestState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
          result: { beep: 'boop' }
        }
      });
      expect(savedbubbleUpTestState).to.deep.equal(bubbleUpTestState);
      expect(state.entities.fooList.l1).to.not.equal(bubbleUpTestState.entities.fooList.l1);
    });
    it('should not shallow bubbleUp=false in action payload', function () {
      const state = fooReducer(bubbleUpTestState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
          result: { beep: 'boop' },
          bubbleUp: false
        }
      });
      expect(savedbubbleUpTestState).to.deep.equal(bubbleUpTestState);
      expect(state.entities.fooList.l1).to.equal(bubbleUpTestState.entities.fooList.l1);
    });
    it('should not shallow copy if reducer option is false', function () {
      const reducer = createReducer({ actionPrefix: 'FOO', entityType: 'foo', bubbleUp: false });
      const state = reducer(bubbleUpTestState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
          result: { beep: 'boop' }
        }
      });
      expect(savedbubbleUpTestState).to.deep.equal(bubbleUpTestState);
      expect(state.entities.fooList.l1).to.equal(bubbleUpTestState.entities.fooList.l1);
    });
  });

  describe('DATA', function () {
    it('should add new data attribute', function () {
      const state = fooReducer(initialState1, {
        type: 'FOO_DATA',
        payload: {
          id: '1',
          data: {
            boop: 'beep'
          }
        }
      });
      expect(initialState2).to.deep.equal(savedInitialState2);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
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
      const state = fooReducer(initialState1, {
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
      const state = fooReducer(initialState1, {
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

  describe('lifeycle callbacks', function () {
    it('beforeReduce', function () {
      const reducer = createReducer({
        entityType: 'foo',
        actionPrefix: 'FOO',
        beforeReduce: function (data, state) {
          return Object.assign({ foo: 'bar' }, state);
        }
      });
      const state = reducer(emptyState, {
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
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(state).to.deep.equal({
        foo: 'bar',
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
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
    it('afterReduce', function () {
      const reducer = createReducer({
        entityType: 'foo',
        actionPrefix: 'FOO',
        afterReduce: function (data, state) {
          return Object.assign({ foo: 'bar' }, state);
        }
      });
      const state = reducer(emptyState, {
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
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(state).to.deep.equal({
        foo: 'bar',
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
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

  describe('FETCH_SUCCESS', function () {
    it('should handle empty state', function () {
      const state = fooReducer(emptyState, {
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
      expect(!!state.entities._meta.foo['1'].fetched.completedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
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

    it('should not clear out pre-existing values (entities)', function () {
      let state = fooReducer(emptyState, {
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
      state = fooReducer(state, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          result: '2',
          entities: {
            foo: {
              '2': {
                abc: 'def'
              }
            }
          }
        }
      });

      delete state.entities._meta.foo['1'].fetched.completedAt;
      delete state.entities._meta.foo['2'].fetched.completedAt;

      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                }
              },
              '2': {
                fetched: {
                  type: 'full'
                }
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            },
            '2': {
              abc: 'def'
            }
          }
        }
      });
    });

    it('should not clear out pre-existing values (result)', function () {
      let state = fooReducer(emptyState, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '1',
          result: { beep: 'boop' }
        }
      });
      state = fooReducer(state, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '2',
          result: { abc: 'def' }
        }
      });

      delete state.entities._meta.foo['1'].fetched.completedAt;
      delete state.entities._meta.foo['2'].fetched.completedAt;

      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                }
              },
              '2': {
                fetched: {
                  type: 'full'
                }
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            },
            '2': {
              abc: 'def'
            }
          }
        }
      });
    });

    it('should not clear out pre-existing values (mixed)', function () {
      let state = fooReducer(emptyState, {
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
      state = fooReducer(state, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          id: '2',
          result: { abc: 'def' }
        }
      });

      delete state.entities._meta.foo['1'].fetched.completedAt;
      delete state.entities._meta.foo['2'].fetched.completedAt;

      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                }
              },
              '2': {
                fetched: {
                  type: 'full'
                }
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            },
            '2': {
              abc: 'def'
            }
          }
        }
      });
    });

    it('should update an existing model but keep existing custom meta properties', function () {
      const state = fooReducer(initialState1, {
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
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(!!state.entities._meta.foo['1'].fetched.completedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                },
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

    it('should update/add normalized entities', function () {
      const state = fooReducer(initialState1, {
        type: 'FOO_FETCH_SUCCESS',
        payload: {
          result: '1',
          entities: {
            foo: {
              '1': {
                beep: 'boop'
              }
            },
            bar: {
              '1': {
                a: 'b'
              }
            }
          }
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(!!state.entities._meta.foo['1'].fetched.completedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(!!state.entities._meta.bar['1'].fetchedBy.completedAt).to.equal(true);
      delete state.entities._meta.bar['1'].fetchedBy.completedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                },
                data: {
                  customMetaProp: 'foo'
                }
              }
            },
            bar: {
              '1': {
                fetched: {
                  type: 'normalized'
                },
                fetchedBy: {
                  entityType: 'foo',
                  id: '1',
                  type: 'full'
                }
              }
            }
          },
          foo: {
            '1': {
              beep: 'boop'
            }
          },
          bar: {
            '1': {
              a: 'b'
            }
          }
        }
      });
    });

    it('should handle "data" state', function () {
      const state = fooReducer(emptyState, {
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
      expect(!!state.entities._meta.foo['1'].fetched.completedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetched.completedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  type: 'full'
                },
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
      const state = fooReducer(emptyState, {
        type: 'FOO_FETCH_PENDING',
        payload: { id: '1' }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(!!state.entities._meta.foo['1'].fetchInitiatedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetchInitiatedAt;
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
      const state = fooReducer(initialState1, {
        type: 'FOO_FETCH_PENDING',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(!!state.entities._meta.foo['1'].fetchInitiatedAt).to.equal(true);
      delete state.entities._meta.foo['1'].fetchInitiatedAt;
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
      const state = fooReducer(emptyState, {
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
      const state = fooReducer(initialState1, {
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
      const state = fooReducer(emptyState, {
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
      expect(!!state.entities._meta.foo['1'].actionCompletedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionCompletedAt;
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
      const state = fooReducer(initialState1, {
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
      expect(!!state.entities._meta.foo['1'].actionCompletedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionCompletedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
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
      const state = fooReducer(emptyState, {
        type: 'FOO_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'bar'
        }
      });
      expect(emptyState).to.deep.equal(savedEmptyState);
      expect(!!state.entities._meta.foo['1'].actionInitiatedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionInitiatedAt;
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
      const state = fooReducer(initialState1, {
        type: 'FOO_ACTION_PENDING',
        payload: {
          id: '1',
          actionId: 'bar'
        }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(!!state.entities._meta.foo['1'].actionInitiatedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionInitiatedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionPending: true,
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
      const state = fooReducer(emptyState, {
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
      expect(!!state.entities._meta.foo['1'].actionCompletedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionCompletedAt;
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
      const state = fooReducer(initialState1, {
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
      expect(!!state.entities._meta.foo['1'].actionCompletedAt).to.equal(true);
      delete state.entities._meta.foo['1'].actionCompletedAt;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                actionId: 'bar',
                actionError: {
                  abc: 'def'
                },
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
      const state = fooReducer(emptyState, {
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
      const state = fooReducer(initialState1, {
        type: 'FOO_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
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
      let state = JSON.parse(JSON.stringify(initialState1));
      const meta = state.entities._meta.foo['1'];
      meta.actionId = 'actionId';
      meta.actionResponse = 'foo';
      meta.actionError = 'bar';
      meta.actionSuccess = true;
      state = fooReducer(state, {
        type: 'FOO_ACTION_CLEAR',
        payload: { id: '1' }
      });
      expect(initialState2).to.deep.equal(savedInitialState2);
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
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
