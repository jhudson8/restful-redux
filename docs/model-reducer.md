Model Reducer
---------------
An automated reducer which understands dispatched actions created by the [action creators](./action creator);

This can either be used as a standalone reducer
```
import { createReducer } from 'restful-redux';

// simple example demonstrating a reducer dealing with "customer" data
export default createReducer({
  // should match the action creator `actionPrefix` option
  actionPrefix: 'CUSTOMER',
  // should match the action creator `entityType` option
  entityType: 'customer',
  // optional flag (default to true) to indicate if normalized collections should be cloned if a collection entity has changed
  bubbleUp: false,
  // optional value to help log info to console if you are having trouble getting things working
  debug: true
});
```
It's as simple as that!

Or you can compose several of these reducers into a single one using the `join` function
```
import { createReducer, chainReducers } from 'restful-redux';

// example reducer handling customer model data
const customerReducer = reducer({
  actionPrefix: 'CUSTOMER',
  entityType: 'customer'
});

// example reducer handling customer search collections
const customerSearchReducer = createReducer({
  actionPrefix: 'CUSTOMER_SEARCH',
  entityType: 'customerSearch'
});

// make sure to use your custom reducer first if you need specific state defaults
const allReducers = chainReducers([
  function (state = {}, action {
    // you can add your own additional reducer logic as well
  }),
  customerReducer,
  customerSearchReducer,
  _other_reducers_
]);

```


### options
* ***actionPrefix***: required identifier for all actions which must match the `actionPrefix` config option in the associated action creator
* ***entityType***: required identifier (used for root state key of domain specific models) which must match the `entityType` config option in the associated action creator
* ***debug***: optional value to help log info to console if you are having trouble getting things working.  Can be `true` or `verbose` for more detailed console logs.
* ***beforeReduce***: Callback function used to return new state ***before*** reducing happens. (see belor for function details)
  * ***action***: the redux action
  * ***util***: see ***Util*** section below - utility object used to manipulate entities
  * ***id***: the entity id which was the focus of the dispatched action
  * ***entities***: all entities from redux state
  * ***value***: the model value that will be set to be associated with the provided id
* ***afterReduce***: Callback function used to return new state ***after*** reducing happens. (see belor for function details)

#### beforeReduce / afterReduce
This callback function must return the updated state if any changes are made.  Using the `reducerUtil` is handy for these situations.

The function signature is (data, state) where `data` is { action, id, entities, result, data }
* ***action***: the dispatched action
* ***id***: the entity id specific to the action that initiated the reducer
* ***entities***: the `entities` action payload value (if provided) in the action payload (not the current state entities)
* ***result***: the `result` action payload value (if provided)
* ***data***: the `data` action payload value (if provided)


## Reducer Util
Utility functions which can be used to manipulate entities in state.  Utility events can be chained.

Note: The `execute` function must be called to return the new state ***unless used with beforeReduce/afterReduce***
```javascript
import { reducerUtil } from 'restful-redux';
...
const newState = reducerUtil(state)
  .delete(...)
  .iterate(...)
  .execute();
```

Or, if used with a ***beforeReduce/afterReduce*** reducer attribute
```javascript
import { createReducer, reducerUtil } from 'restful-redux';

// note, the reducer.util(state) is not necessary
const myReducer = createReducer({
  entityType: 'foo',
  actionPrefix: 'FOO',
  beforeReduce: function (data, state) {
    // see details above for data
    return reducerUtil(state)
      .delete(...)
      // do whatever - operations can be chained
      .execute();
  }
})

```

### delete function (id, entityType)
Delete an entity
* ***id***: the entity id
* ***entityType***: the entity type
```
const newState = reducerUtil(state).delete(_id_, _entityType_).execute();
```

### replace function (id, entityType, value[, data])
Replace an entity with the provided value and optional data
* ***id***: the entity id
* ***entityType***: the entity type
* ***value***: the model value (what would be returned from a fetch - and returned from model.value() )
* ***data***: any metadata which would stick around even if the model was replaced ( return from model.data() )
```javascript
const newState = reducerUtil(state).replace(_id_, _entityType_, {foo: 'bar'}).execute();
```

### clear function (entityType)
Clear out all entities associated with the provided entity type
* ***entityType***: the entity type
```javascript
const newState = reducerUtil(state).clear(_entityType_).execute();
```

### iterate function (entityType, callback ({ id, value, meta }, ))
* ***entityType***: the entity type
* ***id***: the entity id of the current iteration
* ***value***: the entity value (what was fetched) of the current iteration
* ***meta***: all metadata associated with the value { data, fetched, fetchedBy, actionError, actionPending, fetchError, fetchPending }
  * ***data***: any data set using the action creator ***data*** function - persists even after a model is re-fetched
  * ***fetched***: fetch data if the model has been fetched { type, timestamp, id, entityType }
    * ***type***: 'full' if the model value is from a fetch; 'normalized' if the model value was from another model fetch that was normalized; 'set' if a model was constructed directly with a model value
    * ***fetchedBy***: if a model was set from a normalization ( fetched.type === 'normalized '), will refer to the `fetched` value from the actual fetched model that was normalized
    * ***actionError***: XHR error response from the last restful-redux action that was taken
    * ***actionResponse***: XHR response from the last restful-redux action if successful
    * ***actionPending***: `true` if a restful-redux action is currently in flight
    * ***fetchError***: the XHR error if the model could not be fetched
    * ***fetchPending***: true if the entity XHR fetch is currently in flight

Note: _this_ can be used in your callback function to execute utility methods
```javascript
// delete all entities fetched more than 10 min ago
var checkTs = new Date().getTime() - (1000 * 60 * 10);
const newState = reducerUtil(state).iterate(_entityType_, function (id, value, meta) {
  var fetchTime = meta.fetchedBy ? meta.fetchedBy.timestamp : meta.fetched && meta.fetched.timestamp;
  if (fetchTime && fetchTime < checkTs) {
    this.delete(id, _entityType_);
  }
}).execute();
```

## Redux State
This reducer uses a normalized data structure (see [normalizr](https://github.com/paularmstrong/normalizr)).  Assuming the following reducer
```javascript
export default createReducer({
  actionPrefix: 'CUSTOMER',
  entityType: 'customer'
});
```
Assuming a model with an entityType of "foo" with id of "123" was fetched the resulting state would be
```
{
  entities: {
    _meta: {
      foo: {
        '123' : {
          ...model metadata indicating XHR status (available with the Model class)
        }
      }
    },
    foo {
      '123': {
        ...fetched model data
      }
    }
  }
}
```
