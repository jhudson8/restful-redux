Model Reducer
---------------
An automated reducer which understands dispatched actions created by the [action creators](./action creator);

This can either be used as a standalone reducer
```
import { reducer } from 'react-redux-model';

// simple example demonstrating a reducer dealing with "customer" data
export default reducer({
  // should match the action creator `actionPrefix` option
  actionPrefix: 'CUSTOMER',
  // should match the action creator `entityType` option
  entityType: 'customer',
  // optional value to help log info to console if you are having trouble getting things working
  debug: true
});
```
It's as simple as that!

Or you can compose several of these reducers into a single one using the `join` function
```
import { reducer } from 'react-redux-model';

// example reducer handling customer model data
const customerReducer = reducer({
  actionPrefix: 'CUSTOMER',
  entityType: 'customer'
});

// example reducer handling customer search collections
const customerSearchReducer = reducer({
  actionPrefix: 'CUSTOMER_SEARCH',
  entityType: 'customerSearch'
});

const allReducers = reducer.join([customerReducer, customerSearchReducer]);

export default function (state = {}, action) {
  const newState = allReducers(state, action);
  // or, if you have no custom reducer logic... export default allReducers
  if (newState !== state) {
    return newState;
  }

  // you can add your own additional reducer logic as well
}
```


### options
* ***actionPrefix***: required identifier for all actions which must match the `actionPrefix` config option in the associated action creator
* ***entityType***: required identifier (used for root state key of domain specific models) which must match the `entityType` config option in the associated action creator
* ***debug***: optional value to help log info to console if you are having trouble getting things working.  Can be `true` or `verbose` for more detailed console logs.
