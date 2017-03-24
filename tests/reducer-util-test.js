/* global it, describe */
import { reducerUtil } from '../src';
var expect = require('chai').expect;
var sinon = require('sinon');

var initialState2 = {
  entities: {
    _meta: {
      foo: {
        '1': {
          data: {
            customMetaProp: 'foo'
          },
          metaProp1: '1',
          metaProp2: '2'
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
        beep: 'boop',
        aaa: 'bbb'
      },
      '2': {
        abc: 'def',
        ghi: 'jkl'
      }
    }
  }
};
Object.freeze(savedInitialState2);
var savedInitialState2 = JSON.parse(JSON.stringify(initialState2));

describe('reducer-util', function () {
  it('clear', function () {
    var state = reducerUtil(initialState2).clear('foo').execute();
    expect(state).to.deep.equal({entities:{_meta:{}}});
    expect(initialState2).to.deep.equal(savedInitialState2);
  });

  describe('item operations', function () {
    it('replace', function () {
      var state = reducerUtil(initialState2)
        .replace('1', 'foo', { test1: 'test1' })
        .replace('2', 'foo', { test2: 'test2' }, { meta2: 'test2' })
        .replace('3', 'foo', { test3: 'test3' })
        .execute();
      expect(state).to.deep.equal({entities:{_meta:{foo:{
        '1':{data:{customMetaProp:'foo'},metaProp1:'1',metaProp2:'2'},
        '2':{data:{customMetaProp:'bar'}},
        id:{'data':{'meta2':'test2'}}}},'foo':{'1':{aaa:'bbb','foo':'abc','beep':'boop'},'2':{'abc':'def','ghi':'jkl'},'id':{'test3':'test3'}}}});
    });
    it('replaceAttributes', function () {
      var state = reducerUtil(initialState2)
        .replaceAttributes('1', 'foo', {
          value: {
            foo: null,
            aaa: 'ccc'
          },
          data: {
            abc: 'def'
          },
          meta: {
            metaProp1: null
          }
        })
        .execute();
      expect(state).to.deep.equal({'entities':{'_meta':{'foo':{'1':{'data':{'customMetaProp':'foo','abc':'def'},'metaProp2':'2'},'2':{'data':{'customMetaProp':'bar'}}}},'foo':{'1':{'beep':'boop','aaa':'ccc'},'2':{'abc':'def','ghi':'jkl'}}}});
    });
    it('delete', function () {
      var spy = sinon.spy();
      var state = reducerUtil(initialState2)
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
        { aaa: 'bbb', foo: 'abc', beep: 'boop' },
        { data: { customMetaProp: 'foo' }, metaProp1: '1', metaProp2: '2' }
      ]);
      expect(state).to.deep.equal({entities:{_meta:{foo:{'2':{data:{customMetaProp:'bar'}}}},foo:{'2':{abc:'def',ghi:'jkl'}}}});
      expect(initialState2).to.deep.equal(savedInitialState2);
    });
  });
});
