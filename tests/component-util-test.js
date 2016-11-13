import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
var modelProvider = require('../src/component-util').modelProvider;
var expect = require('chai').expect;

function Stub () {}

describe('component-util', function () {
  const Component = modelProvider(Stub, {
    id: 'id',
    domain: 'foo',
    fetchProp: 'fetch'
  });
  const ComponentNestedId = modelProvider(Stub, {
    id: 'params.id',
    domain: 'foo',
    fetchProp: 'fetch'
  });

  it('should trigger fetch when mounted', function () {
    const fetch = sinon.spy();
    const impl = shallow(React.createElement(Component, {
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
    const impl = shallow(React.createElement(ComponentNestedId, {
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

  it('should trigger fetch when id changes', function () {
    const fetch = sinon.spy();
    const impl = shallow(React.createElement(Component, {
      id: '1',
      entities: {
        foo: {}
      },
      fetch: fetch
    }));

    // now change id values
    Component.prototype.componentWillReceiveProps.call({
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
    const impl = shallow(React.createElement(Component, {
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
    const impl = shallow(React.createElement(Component, {
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

  describe('should obey "modelProp"', function () {
    const Component = modelProvider(Stub, {
      id: 'id',
      domain: 'foo',
      modelProp: 'bar',
      fetchProp: 'fetch'
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
      const impl = shallow(React.createElement(Component, {
        id: '1',
        foo: {},
        fetch: fetch,
        model: {} // shouldn't be used
      }));

      expect(fetch.callCount).to.eql(1);
    });
  });

  describe ('should obey "idProp"', function () {
    const Component = modelProvider(Stub, {
      id: 'id',
      domain: 'foo',
      idProp: 'bar',
      fetchProp: 'fetch'
    });

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
    const Component = modelProvider(Stub, {
      id: 'id',
      domain: 'foo',
      fetchProp: 'bar'
    });

    it ('should set id value on child component', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
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
  })

  describe('should obey "fetchOptions"', function () {
    const Component = modelProvider(Stub, {
      id: 'id',
      domain: 'foo',
      fetchProp: 'fetch',
      fetchOptions: {
        abc: 'params.def',
        ghi: 'params.jkl'
      }
    });

    it ('should pass values as 2nd fetch parameter', function () {
      const fetch = sinon.spy();
      const impl = shallow(React.createElement(Component, {
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
  });
});
