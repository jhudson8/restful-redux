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

