/* global it, describe */

import reducer from '../src/model-reducer';
var util = reducer.util;
var expect = require('chai').expect;
var sinon = require('sinon');

var emptyState = {};
var savedEmptyState = JSON.parse(JSON.stringify(emptyState));
var initialState1 = {
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
var savedInitialState1 = JSON.parse(JSON.stringify(initialState1));
var initialState2 = {
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
var savedInitialState2 = JSON.parse(JSON.stringify(initialState2));

describe('model-reducer', function () {
  var fooReducer = reducer({
    actionPrefix: 'FOO',
    entityType: 'foo'
  });

  describe('actions', function () {
    it('clear', function () {
      var state = util(initialState2).clear('foo').execute();
      expect(state).to.deep.equal({entities:{_meta:{}}});
      expect(initialState2).to.deep.equal(savedInitialState2);
    });

    describe('item operations', function () {
      it('replace', function () {
        var state = util(initialState2)
          .replace('1', 'foo', { test1: 'test1' })
          .replace('2', 'foo', { test2: 'test2' }, { meta2: 'test2' })
          .replace('3', 'foo', { test3: 'test3' })
          .execute();
        expect(state).to.deep.equal({entities:{_meta:{foo:{
          '1':{data:{customMetaProp:'foo'}},
          '2':{data:{customMetaProp:'bar'}},
          id:{'data':{'meta2':'test2'}}}},'foo':{'1':{'foo':'abc','beep':'boop'},'2':{'abc':'def','ghi':'jkl'},'id':{'test3':'test3'}}}});
      });
      it('delete', function () {
        var spy = sinon.spy();
        var state = util(initialState2)
          .iterate('foo', function (id, value, meta) {
            spy(id, value, meta);
            if (id === '1') {
              this.delete(id, 'foo');
            }
          })
          .execute();
        expect(spy.callCount).to.equal(2);
        expect(spy.firstCall.args).to.deep.equal([
          '1',
          { foo: 'abc', beep: 'boop' },
          { data: { customMetaProp: 'foo' } }
        ]);
        expect(state).to.deep.equal({entities:{_meta:{foo:{'2':{data:{customMetaProp:'bar'}}}},foo:{'2':{abc:'def',ghi:'jkl'}}}});
        expect(initialState2).to.deep.equal(savedInitialState2);
      });
    });
  });

  describe('join', function () {
    var origState = {};
    var reducer1 = function (state, action) {
      if (action === 'foo') {
        return 'foo';
      }
      return state;
    };
    var reducer2 = function (state, action) {
      if (action === 'bar') {
        return 'bar';
      }
      return state;
    };
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
      expect(!!state.entities._meta.foo['1'].fetched.timestamp).to.equal(true);
      delete state.entities._meta.foo['1'].fetched.timestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
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
      });
      expect(initialState1).to.deep.equal(savedInitialState1);
      delete state.entities._meta.foo['1'].fetched.timestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  entityType: 'foo',
                  id: '1',
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
      var state = fooReducer(initialState1, {
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
      delete state.entities._meta.foo['1'].fetched.timestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  entityType: 'foo',
                  id: '1',
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
                  type: 'partial'
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
      delete state.entities._meta.foo['1'].fetched.timestamp;
      expect(state).to.deep.equal({
        entities: {
          _meta: {
            foo: {
              '1': {
                fetched: {
                  entityType: 'foo',
                  id: '1',
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
