/* global it, describe */
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { modelProvider } from '../src';
import assign from 'object-assign';
var expect = require('chai').expect;

function Stub () {}

describe('model-provider', function () {
  const Component = modelProvider({
    model: {
      id: 'id',
      entityType: 'foo',
      fetchProp: 'fetch'
    }
  })(Stub);
  const ComponentMultipleModels = modelProvider({
    models: [{
      id: 'id1',
      entityType: 'foo',
      fetchProp: 'fetch1'
    }, {
      id: 'id2',
      entityType: 'foo',
      fetchProp: 'fetch2'
    }]
  })(Stub);
  const ComponentNestedId = modelProvider({
    model: {
      id: 'params.id',
      entityType: 'foo',
      fetchProp: 'fetch'
    }
  })(Stub);

  describe('models and collections', function () {
    it('should trigger fetch when mounted', function () {
      const fetch1 = sinon.spy();
      const fetch2 = sinon.spy();
      shallow(React.createElement(ComponentMultipleModels, {
        id1: '1',
        id2: '2',
        entities: {
          foo: {}
        },
        fetch1: fetch1,
        fetch2: fetch2
      }));
      expect(fetch1.callCount).to.eql(1);
      expect(fetch2.callCount).to.eql(1);
    });
    it('should not trigger fetch if models already exists', function () {
      const fetch1 = sinon.spy();
      const fetch2 = sinon.spy();
      shallow(React.createElement(ComponentMultipleModels, {
        id1: '1',
        id2: '2',
        entities: {
          foo: {
            '1': {},
            '2': {}
          }
        },
        fetch1: fetch1,
        fetch2: fetch2
      }));

      expect(fetch1.callCount).to.eql(0);
      expect(fetch2.callCount).to.eql(0);
    });
  });

  it('should trigger fetch when mounted', function () {
    const fetch = sinon.spy();
    shallow(React.createElement(Component, {
      id: '1',
      entities: {
        foo: {}
      },
      fetch: fetch
    }));

    expect(fetch.callCount).to.eql(1);
    const callArgs = fetch.firstCall.args;
    expect(callArgs[0]).to.equal('1');
  });

  it('should handle nested ids', function () {
    const fetch = sinon.spy();
    shallow(React.createElement(ComponentNestedId, {
      params: { id: '1' },
      entities: {
        foo: {}
      },
      fetch: fetch
    }));

    expect(fetch.callCount).to.eql(1);
    const callArgs = fetch.firstCall.args;
    expect(callArgs[0]).to.equal('1');
  });

  describe('onIdChange', function () {
    function createComponent(spy, options) {
      return modelProvider(assign({
        model: {
          id: 'id',
          entityType: 'foo',
          onIdChange: spy
        }
      }, options))(Stub);
    }

    it('should always call on mount', function () {
      const spy = sinon.spy();
      const Component = createComponent(spy);
      shallow(React.createElement(Component, {
        id: undefined,
        entityType: 'foo'
      }));
      expect(spy.callCount).to.equal(1);

      shallow(React.createElement(Component, {
        id: '1',
        entityType: 'foo'
      }));
      expect(spy.callCount).to.equal(2);
    });

    it('should also call only when id changes', function () {
      const spy = sinon.spy();
      const Component = createComponent(spy);
      let component = shallow(React.createElement(Component, {
        id: '1',
        entityType: 'foo'
      }));
      expect(spy.callCount).to.equal(1);
      component = component.setProps({
        id: '2',
        entityType: 'foo'
      });
      expect(spy.callCount).to.equal(2);
      component.setProps({
        id: '2',
        entityType: 'foo',
        foo: 'bar'
      });
      expect(spy.callCount).to.equal(2);
    });
    it('should not call if model encountered an XHR error', function () {
      const fetchSpy = sinon.spy();
      const Component = createComponent(sinon.spy(), {
        id: 'id',
        forceFetch: sinon.spy(),
        fetchProp: 'fetch',
        fetch: 'fetch'
      });
      shallow(React.createElement(Component, {
        id: '1',
        idValue: 'foo',
        entityType: 'foo',
        fetch: fetchSpy,
        entities: {
          _meta: {
            foo: {
              '1': {
                fetch: { error: true }
              }
            }
          }
        }
      }));
      expect(fetchSpy.callCount).to.equal(0);
    });
  });

  describe('forceFetch', function () {
    it('should trigger fetch even if id does not change (but only when mounted)', function () {
      const fetch = sinon.spy();
      const entities = {
        foo: {
          '1': 'foo'
        }
      };

      const ComponentForceFetch = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          forceFetch: function () { return true; }
        }
      })(Stub);
      let component = shallow(React.createElement(ComponentForceFetch, {
        id: '1',
        entities: entities,
        fetch: fetch
      }));
      expect(fetch.callCount).to.eql(1);

      component.setProps({
        id: '1',
        entities: entities,
        fetch: fetch,
        foo: 'bar'
      });
      expect(fetch.callCount).to.eql(2);
    });

    it('should trigger fetch even if id does not change', function () {
      const fetch = sinon.spy();
      const entities = {
        foo: {
          '1': 'foo'
        }
      };

      const ComponentForceFetch = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          forceFetch: function () { return true; }
        }
      })(Stub);
      let component = shallow(React.createElement(ComponentForceFetch, {
        id: '1',
        entities: entities,
        fetch: fetch
      }));
      expect(fetch.callCount).to.eql(1);

      component.setProps({
        id: '1',
        entities: entities,
        fetch: fetch,
        foo: 'bar'
      });
      expect(fetch.callCount).to.eql(2);
    });

    it('should not trigger fetch or allow forceFetch if a fetch is pending', function () {
      const fetch = sinon.spy();
      const forceFetch = sinon.spy();
      const ComponentForceFetch = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          forceFetch: forceFetch
        }
      })(Stub);
      shallow(React.createElement(ComponentForceFetch, {
        id: '1',
        fetch: fetch,
        entities: {
          _meta: {
            foo: {
              '1': {
                fetch: {
                  pending: true,
                  initiatedAt: 12345
                }
              }
            }
          }
        }
      }));
      expect(fetch.callCount).to.eql(0);
      expect(forceFetch.callCount).to.eql(0);
    });

    it('should never trigger fetch if `forceFetch` function returns false', function () {
      const fetch = sinon.spy();
      const entities = {
        foo: {
          '1': 'foo'
        }
      };

      const ComponentForceFetch = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          forceFetch: function () { return false; }
        }
      })(Stub);
      let component = shallow(React.createElement(ComponentForceFetch, {
        id: '1',
        entities: entities,
        fetch: fetch
      }));
      expect(fetch.callCount).to.eql(0);
      component.setProps({
        id: '1',
        entities: entities,
        fetch: fetch,
        foo: 'bar'
      });
      expect(fetch.callCount).to.eql(0);
    });

    it('should not call forceFetch if we are already going to fetch', function () {
      const fetch = sinon.spy();
      const forceFetch = sinon.spy();
      const ComponentForceFetch = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          forceFetch: forceFetch
        }
      })(Stub);
      shallow(React.createElement(ComponentForceFetch, {
        id: '1',
        entities: { test: 'poop' },
        fetch: fetch
      }));
      expect(fetch.callCount).to.eql(1);
      expect(forceFetch.callCount).to.eql(0);
    });
  });

  it('should trigger fetch when id changes', function () {
    const fetch = sinon.spy();
    shallow(React.createElement(Component, {
      id: '1',
      entities: {
        foo: {}
      },
      fetch: fetch
    }));

    // now change id values
    Component.prototype.componentWillReceiveProps.call({
      setState: sinon.spy(),
      state: {
        modelCache: {},
        fetched: {}
      },
      props: {
        id: '1'
      }
    }, {
      id: '2',
      entities: {
        foo: {}
      },
      fetch: fetch
    });
    expect(fetch.callCount).to.eql(2);
    const callArgs = fetch.secondCall.args;
    expect(callArgs[0]).to.equal('2');
  });

  it('should not trigger fetch if model already exists', function () {
    const fetch = sinon.spy();
    shallow(React.createElement(Component, {
      id: '1',
      entities: {
        foo: { '1': {} }
      },
      fetch: fetch
    }));

    expect(fetch.callCount).to.eql(0);
  });

  it('should gracefully handle the parent state', function () {
    const fetch = sinon.spy();
    shallow(React.createElement(Component, {
      id: '1',
      entities: {
        entities: {
          foo: { '1': {} }
        }
      },
      fetch: fetch
    }));

    expect(fetch.callCount).to.eql(0);
  });

  describe('should obey "propName"', function () {
    const Component = modelProvider({
      model: {
        id: 'id',
        entityType: 'foo',
        propName: 'bar',
        fetchProp: 'fetch'
      }
    })(Stub);

    it('should handle nested model properties', function () {
      const Component = modelProvider({
        model: {
          id: 'id',
          propName: 'foo.bar',
          entityType: 'foo'
        }
      })(Stub);

      const impl = shallow(React.createElement(Component, {
        id: '1',
        entities: {
          foo: {}
        }
      }));
      const props = impl.props();
      expect(!!props.foo.bar.canBeFetched()).to.equal(true);
    });

    it('should not fetch if model is provided', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
        id: '1',
        entities: {
          foo: {}
        },
        fetch: fetch,
        bar: 'test'
      }));

      expect(fetch.callCount).to.eql(0);
      const renderedProps = impl.find(Stub).first().props;
      expect(renderedProps.bar = 'test');
    });

    it ('should fetch if model is not provided', function () {
      const fetch = sinon.spy();
      shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        fetch: fetch,
        model: {} // shouldn't be used
      }));

      expect(fetch.callCount).to.eql(1);
    });
  });

  describe ('should obey "idProp"', function () {
    const Component = modelProvider({
      model: {
        id: 'id',
        entityType: 'foo',
        idProp: 'bar',
        fetchProp: 'fetch'
      }
    })(Stub);

    it ('should set id value on child component', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        fetch: fetch,
        model: {}
      }));

      expect(fetch.callCount).to.eql(0);
      const renderedProps = impl.find(Stub).first().props;
      expect(renderedProps.bar = '1');
    });
  });

  describe ('should obey "fetchProp"', function () {
    const Component = modelProvider({
      model: {
        id: 'id',
        entityType: 'foo',
        fetchProp: 'bar'
      }
    })(Stub);

    it ('should set id value on child component', function () {
      const fetch = sinon.spy();
      shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        bar: fetch
      }));

      expect(fetch.callCount).to.eql(1);
      const callArgs = fetch.firstCall.args;
      expect(callArgs[0]).to.equal('1');
    });
  });

  describe('should obey "indexProp"', function () {
    it ('should first look for "index" within "models"', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
        id: '1',
        foo: { index: { '1': 'right' }, '1': 'wrong' },
        fetch: fetch
      }));

      const renderedProps = impl.find(Stub).first().props;
      expect(renderedProps.model = 'right');
    });

    it ('should first look for "index" within "models"', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
        id: '1',
        foo: { index: { '1': 'right' }, '1': 'wrong' },
        fetch: fetch
      }));

      const renderedProps = impl.find(Stub).first().props;
      expect(renderedProps.model = 'right');
    });
  });

  describe('should obey "fetchOptions"', function () {
    const Component = modelProvider({
      model: {
        id: 'id',
        entityType: 'foo',
        fetchProp: 'fetch',
        fetchOptions: {
          abc: 'params.def',
          ghi: 'params.jkl'
        }
      }
    })(Stub);

    it ('should pass values as 2nd fetch parameter', function () {
      const fetch = sinon.spy();
      shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        fetch: fetch,
        params: {
          def: 'boop',
          jkl: 'beep'
        }
      }));

      expect(fetch.callCount).to.eql(1);
      const callArgs = fetch.firstCall.args;
      expect(callArgs[0]).to.equal('1');
      expect(callArgs[1]).to.deep.equal({ abc: 'boop', ghi: 'beep' });
    });

    it ('should allow function value (props, id)', function () {
      const Component = modelProvider({
        model: {
          id: 'id',
          entityType: 'foo',
          fetchProp: 'fetch',
          fetchOptions: function (props) {
            return {
              abc: props.params.jkl,
              ghi: props.params.def
            };
          }
        }
      })(Stub);
      const fetch = sinon.spy();
      shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        fetch: fetch,
        params: {
          def: 'boop',
          jkl: 'beep'
        }
      }));

      expect(fetch.callCount).to.eql(1);
      const callArgs = fetch.firstCall.args;
      expect(callArgs[0]).to.equal('1');
      expect(callArgs[1]).to.deep.equal({ abc: 'beep', ghi: 'boop' });
    });
  });
});
