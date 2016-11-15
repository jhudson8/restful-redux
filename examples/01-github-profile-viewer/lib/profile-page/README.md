Github Profile Viewer Example
--------------------------------------------------------
This contains the action creators, reducer and smart/dumb components to display the webpage for showing github profiles.  You would normally organize your project to be a bit more robust but this keeps things simple for example purposes.

The redux action types used (automatically) are

* `PROFILE_FETCH_PENDING`: Triggered by the action creator when a fetch request is made
* `PROFILE_FETCH_SUCCESS`: Triggered by the action creator if the fetch was a success
* `PROFILE_FETCH_ERROR`: Triggered by the action creator if there was a fetch error

The `PROFILE` action prefix is defined by the [action creator](https://github.com/jhudson8/react-redux-model/blob/master/examples/simple-fetch-with-redux-effects/lib/profile-page/actions.js#L4) `actionPrefix` option value.

The `PROFILE` action prefix must also match the [reducer](https://github.com/jhudson8/react-redux-model/blob/master/examples/simple-fetch-with-redux-effects/lib/profile-page/reducer.js#L5) `actionPrefix` value.

Both of these files should have matching `entityType` values as well.

The rest of the model handling is done by the [modelProvider](https://github.com/jhudson8/react-redux-model/blob/master/examples/simple-fetch-with-redux-effects/lib/profile-page/index.js#L26) React component which auto-fetches the model data and adds the model as a property value to your component.  The `entityType` option value should match what is defined in the action creator and reducer.
