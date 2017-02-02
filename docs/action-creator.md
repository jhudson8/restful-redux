Action Creators
---------------
The action creator in this project is used to easily, and with very little code, create dispatchable actions that interact with this package's reducers.

This project contains 1 action creator impl (using [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch)).

You can create your own so we will discuss the interface (expected by the reducer) as well.

## Redux Effects Action Creator
### Import and Create New Action Creator
```javascript
import { reduxEffectsActionCreator } from 'restful-redux';

const actionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'CUSTOMER',
  // root domain for model data; redux store data structure would be { entities: { customer: { _id_: {_model_data} } } }
  entityType: 'customer',
  // optional normalizr normalize method (see https://github.com/paularmstrong/normalizr;  `import { normalize } from 'normalizr';`)
  normalize: normalize,
  // optional value to help log info to console if you are having trouble getting things working
  debug: true
});
```
### Example
[../examples/01-github-profile-viewer/lib/profile-page/actions.js](../examples/01-github-profile-viewer/lib/profile-page/actions.js)

### Action Creator API
* [createFetchAction / createGetAction](#createfetchaction--creategetaction)
* [createPostAction](#createpostaction)
* [createDeleteAction](#createdeleteaction)
* [createPutAction](#createputaction)
* [createPatchAction](#createpatchaction)
* [createModelDataAction](#createmodeldataaction)

#### createFetchAction / createGetAction
Both functions are the same (depending on if you prefer a rest method-based name or a standard `fetch` name).  Returns a redux action used to initiate an XHR to fetch model data.  A Promise is also available as an attribute
on all actions if needed.

##### options
* ***id***: required model id
* ***url***: required fetch url
* ***params***: optional effects-fetch parameters (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
* ***schema***: optional normalizr schema if response should be normalized
* ***formatter***: optional function(payload, id) used to format the response before being evaluated by normalizr
* ***successAction***: optional action to be dispatched if the XHR is successful: function(_normalized_payload_)
* ***errorAction***: optional action to be dispatched if the XHR is not successful: function({id, actionId, response})

##### example
```javascript
export function fetch (id) {
  const action = actionCreator.createFetchAction({
    // or return actionCreator.createGetAction({
    id: id,
    url: `/customer/endpoint/${id}`,
    // if you want to do something with action dispatching
    successAction: ...,
    errorAction: ...
  });
  // if you want to do something without action dispatching
  const promise = action.promise;
  return action;
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


#### createPostAction
Returns a redux action used to initiate a `POST` request.  See [XHR action details](#xhr-action) for more details.

[API table of contents](#action-creator-api)


#### createDeleteAction
Returns a redux action used to initiate an DELETE request.  See [XHR action details](#xhr-action) for more details.

[API table of contents](#action-creator-api)


#### createPutAction
Returns a redux action used to initiate a `PUT` request.  See [XHR action details](#xhr-action) for more details.

[API table of contents](#action-creator-api)


#### createPatchAction
Returns a redux action used to initiate a `PATCH` request.  See [XHR action details](#xhr-action) for more details.

[API table of contents](#action-creator-api)


#### XHR Action
Returns a dispatchable redux action used to perform an arbitrary XHR request associated with a model.  The last successful action (and response) will be saved in redux state and available using the Model API (see Model docs).

##### options
* ***id***: required model id
* ***actionId***: required action identifier (for example `update`)
* ***url***: required url
* ***params***: optional effects-fetch params (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
* ***schema***: optional normalizr schema if response should be normalized
* ***formatter***: optional function(payload, id) used to format the response before being evaluated by normalizr
* ***replaceModel***: `true` if the model contents should be replaced with this XHR response
* ***clearAfter***: optional time in milis to clear out this recorded action in redux state

##### example
```javascript
export function updateCustomer (id, customerData) {
  // we're using `createPostAction` for example but could be any of
  // createPostAction, createDeleteAction, createPutAction, createPatchAction
  return actionCreator.createPostAction({
    id: id,
    url: `/customer/endpoint/${id}`,
    payload: { // see https://github.com/redux-effects/redux-effects-fetch#actions
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
* ***CUSTOMER_ACTION_ERROR***: if the XHR fetch failed; ```{ payload: { id: _model id_, actionId: _action id_, response: { headers, status, statusText, url, value } } }```
* ***CUSTOMER_ACTION_SUCCESS***: if the XHR fetch succeeded; ```{ payload: { id: _model id_, actionId: _action id_, response: _response payload_  } }```
*** note***: if `replaceModel` is `true`, use the `createFetchAction` response shape instead of the `response` attribute

[API table of contents](#action-creator-api)


#### createModelDataAction
Returns a dispatchable redux action used to apply model specific meta data.  This data will persist even if the model is updated and can be retrieved using the `data()` function on a model.

##### example
```javascript
export function setLocalCustomerPreference (id, preferenceInfo) {
  // this will be able to retrieved in your React class (assuming the use of the model provider)
  // using model.data().customerPreference
  return actionCreator.createModelDataAction(id, { customerPreference: preferenceInfo });
}
```

##### dispatched actions
Assuming example above using `CUSTOMER` as the `actionPrefix` value
* ***CUSTOMER_DATA***: when the fetch has been initiated; ```{ payload: { id: _model id_, data: _data_ } }```

[API table of contents](#action-creator-api)
