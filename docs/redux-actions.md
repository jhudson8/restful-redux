Action Payloads
---------------
If you want to implement your own action creator or just want to know more about the internals, these are actions that are produced (and expected by the corresponding reducer).  [See more details on the redux-effects-based action creator API](./action-creator.md).

Assuming the following action creator
```javascript
const actionCreator = reduxEffectsActionCreator({
  actionPrefix: 'CUSTOMER',
  entityType: 'customer',
  // if you have a normalized data structure, the source entity will be shallow copied if
  // the sub-entity action has this attribute
  bubbleUp: false
});
```

## createFetchAction
```javascript
// `id` represents the model id
export function fetch (id) {
  return actionCreator.createFetchAction({
    id: id,
    url: `/customer/endpoint/${id}`
  });
}
```
Will initially dispatch
```javascript
[
  { type: 'CUSTOMER_FETCH_PENDING', payload: { id } },
  { redux-effects-fetch specific action that will not make it to the reducer }
]
```

Once the XHR has completed one of the following actions will be dispatched
```javascript
{ type: 'CUSTOMER_FETCH_SUCCESS', payload: { id, result, entities, data  } }
```
For `payload` details, see the [action creator response format details](./action-creator.md#response-format).


Or, if the XHR returned with a non-200 http status code
```javascript
{ type: 'CUSTOMER_FETCH_ERROR', payload: { id, response: { headers, status, statusText, url, value } } }
```

## create(Get|Post|Path|Delete|Put)Action
```javascript
// `id` represents the model id
// `actionId` represents some general action identifier for this action type
export function fetch (id, actionId) {
  return actionCreator.createPostAction({
    id: id,
    actionId: id,
    url: `/customer/endpoint/${id}`,
    ...
  });
}
```
Will initially dispatch
```javascript
[
  { type: 'CUSTOMER_ACTION_PENDING', payload: { id, actionId } },
  { redux-effects-fetch specific action that will not make it to the reducer }
]
```

Once the XHR has completed one of the following actions will be dispatched
```javascript
{ type: 'CUSTOMER_ACTION_SUCCESS', payload: { id, actionId, response: { headers, status, statusText, url, value } } }
```
For `payload` details, see the [action creator response format details](./action-creator.md#response-format).

*** note***: if `replaceModel` is `true`, use the `createFetchAction` response shape instead of the `response` attribute

Or, if the XHR returned with a non-200 http status code
```javascript
{ type: 'CUSTOMER_ACTION_ERROR', payload: { id, actionId, response: { headers, status, statusText, url, value } } }
```

## createModelDataAction
```javascript
{ type: 'CUSTOMER_DATA', payload: { id, data: { ... } } }
```
