Action Creators
---------------
The action creator in this project is used to easily, and with very little code, create dispatchable actions that interact with this package's reducers.

This project contains 1 action creator impl (using [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch)).

You can create your own so we will discuss the interface (expected by the reducer) as well.

## Redux Effects Action Creator
### Import and Create New Action Creator
```javascript
import { reduxEffectsActionCreator } from 'react-redux-model';

const actionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'CUSTOMER',
  // root domain for model data; store data structure is { entities: { profiles: { _id_: {_model_data} } } }
  entityType: 'customer',
  // optional normalizr normalize method (see https://github.com/paularmstrong/normalizr... `import { normalize } from 'normalizr';`)
  normalize: normalize
});
```
### Example
[../examples/01-github-profile-viewer/lib/profile-page/actions.js](../examples/01-github-profile-viewer/lib/profile-page/actions.js)

### Action Creator API
* [createFetchAction](#createfetchaction)
* [createXHRAction](#createxhraction)

#### createFetchAction
Returns a dispatchable redux action used to initiate an XHR to fetch model data.

##### options
* ***id***: required model id
* ***url***: required fetch url
* ***payload***: optional effects-fetch payload (https://github.com/redux-effects/redux-effects-fetch#actions)
* ***schema***: optional normalizr schema if response should be normalized
* ***formatter***: optional function(payload, id) used to format the response before being evaluated by normalizr

##### example
```javascript
export function fetch (id) {
  return actionCreator.createFetchAction({
    id: id,
    url: `/customer/endpoint/${id}`
  });
}
```

##### dispatched actions
Assuming example above using `CUSTOMER` as the `actionPrefix` value
* ***CUSTOMER_FETCH_PENDING***: when the fetch has been initiated; ```{ payload: { id: _model id_ } }```
* ***CUSTOMER_FETCH_ERROR***: if the XHR fetch failed; ```{ payload: { id: _model id_, response: _error response payload_ } }```
* ***CUSTOMER_FETCH_SUCCESS***: if the XHR fetch succeeded; ```{ payload: { /see response shapes below/ } }```

##### response shapes
Either the API response, `formatter` or `normalizr schema` should return one of the following responses.

Simple
```
{
  id: _model id_
  result: _model data_ (accessed using model.value() - see Model docs)
  data: _meta data_ (accessed using model.data() - see Model docs; good for collections where the "model" is an array)
}
```
Advanced
```
{
  result: _model id_
  entities: { // useful for multiple entities provided with a single response
    _entityType_: { // must match the `entityType` attribute for the action creator options
      _model id_: {
        // the model data
      }
    },
    data: _meta data_ (accessed using model.data() - see Model docs; good for collections where the "model" is an array)
}
```
[API table of contents](#action-creator-api)

#### createXHRAction
Returns a dispatchable redux action used to perform an arbitrary action associated with a model.  The last successful action (and response) will be saved in redux state and available using the Model API (see Model docs).

##### options
* ***id***: required model id
* ***actionId***: required action identifier (for example `update`)
* ***url***: required url
* ***payload***: optional effects-fetch payload (https://github.com/redux-effects/redux-effects-fetch#actions)
* ***schema***: optional normalizr schema if response should be normalized
* ***formatter***: optional function(payload, id) used to format the response before being evaluated by normalizr
* ***replaceModel***: `true` if the model contents should be replaced with this XHR response
* ***clearAfter***: optional time in milis to clear out this recorded action in redux state

##### example
```javascript
export function updateCustomer (id, customerData) {
  return actionCreator.createXHRAction({
    id: id,
    url: `/customer/endpoint/${id}`,
    payload: { // see https://github.com/redux-effects/redux-effects-fetch#actions
      method: 'POST',
      body: customerData
    },
    replaceModel: true,
    clearAfter: 3000
  });
}
```

##### dispatched actions
Assuming example above using `CUSTOMER` as the `actionPrefix` value
* ***CUSTOMER_ACTION_PENDING***: when the fetch has been initiated; ```{ payload: { id: _model id_, actionId: _action id_ } }```
* ***CUSTOMER_ACTION_ERROR***: if the XHR fetch failed; ```{ payload: { id: _model id_, actionId: _action id_, response: _error response payload_ } }```
* ***CUSTOMER_ACTION_SUCCESS***: if the XHR fetch succeeded; ```{ payload: { id: _model id_, actionId: _action id_, response: _response payload_  } }```
*** note***: if `replaceModel` is `true`, use the `createFetchAction` response shape instead of the `response` attribute

[API table of contents](#action-creator-api)
