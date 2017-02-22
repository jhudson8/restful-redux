## v2.2.1
updated examples to use new normalizr schema (and denormalizr impl from normalizr)

## v2.2.0
- add middleware to handle fetch actions with JSON post body content (will serialize content and update headers)
```javascript
import { dispatchPromise } from 'restful-redux';
// "store" is the redux store
dispatchPromise(store);
```
- add helper function to allow dispatched actions to return a promise
```javascript
import { fetchJSONMiddleware } from 'restful-redux';
// include this middleware when creating the redux store
```

## v2.1.1
- allow forceFetch to trigger a fetch even if id does not change

## v2.1.0
- allow forceFetch to be a function for finer grained detail
- provide completedAt/initiatedAt attributes for `wasFetched`, `isFetchPending`, `isActionPending`, `wasActionPerformed` Model functions

## v2.0.1
- fix `bubbleUp` behavior

## v2.0.0
- *only* support new 3.x denormalizr function provided by normalizr (import { denormalizrs } from 'normalizr' - not external `denormalizr` package)
- add `arrayEntrySchema` modelProvider option to allow for collections models value() function to return an array of Models
- standardize action creator formatting { data, result, entities }
- added Model.clearCache(id, entityType, cache)
- if a denormalized entity from a collection is updated, the collection is shallow copied to allow collection consumers to know about the change


## v1.5.0
Added useful entity manipulation reducer utility functions and beforeReduce/afterReduce reducer attributes
See https://github.com/jhudson8/restful-redux/blob/master/docs/model-reducer.md (Util section) for more details

## v1.4.4
allow false when checking for required fields

## v1.4.3
not really a bug fix but not worth a minor release;  allow model provider id to be a static value (it will check props first but, if not found, will be the value provided)

## v1.4.2
bug fix - support id=false in modelProvider

## v1.4.1
bug fix - allow Model.fromCache to use id: false to match an action creator

## v1.4.0
- added a `Model.fromCache` function to reuse cached models if possible
- model providers will now cache models (so no `componentWillReceiveProps`) execution for every render

## v1.3.2
- fix issue with returned action.promise not resolving

## v1.3.1
- fixed bug with error response handling

## v1.3.0
- use "params" attribute instead of "payload" for XHR actions.  This value represents the 2nd parameter of the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

## v1.2.0
- Added `successAction` and `errorAction` as optional attributes to the action creator
- Added `promise` as an attribute of the returned action from the creator
- `redux-thunk` is now required if using the redux effects action creator

## v1.1.1
- bug fix: allow state or state.entities to be passed to model (instead of just state.entities)

## v1.1.0
- Added alternative Model constructor useful for unit testing (id, value)
```
import { Model } from 'restful-redux';
// data() value can be included as {_meta: {data: {...}}}

const myModel = new Model('_modelid_', {
  _meta: {
    data: {
      someMetaValue: 'foo'
    }
  },
  someModelValue: 'bar'
});
```
