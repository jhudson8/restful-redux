Github Profile Viewer Example
--------------------------------------------------------
This contains the action creators, reducer and smart/dumb components to display the webpage for showing github profiles.  You would normally organize your project to be a bit more robust but this keeps things simple for example purposes.


### Redux action types

* `REPOSITORY_FETCH_PENDING`: Triggered by the action creator when a fetch request is made
* `REPOSITORY_FETCH_SUCCESS`: Triggered by the action creator if the fetch was a success
* `REPOSITORY_FETCH_ERROR`: Triggered by the action creator if there was a fetch error

The `REPOSITORY` action prefix is defined by the [action creator](./actions.js) `actionPrefix` option value.

The `REPOSITORY` action prefix must also match the [reducer](./reducer.js) `actionPrefix` value.

Both of these files should have matching `entityType` values as well.

The rest of the model handling is done by the [modelProvider](./index.js) React component which auto-fetches the model data and adds the model as a property value to your component.  The `entityType` option value should match what is defined in the action creator and reducer.


### Populated Redux State
The populated redux state is as follows
```
{
  // from ../reducers.js (used with combineReducers)
  routing: {... react router state ...},
  app: {
    // created with ./reducer (using the entityType option) assuming a profile view of `jhudson8`
    entities: {
      _meta: {
        repository: {
          _repo_full_name_: {
            ... some meta values which keep track of fetch state
          }
        }
      },
      repository: {
        _repo_full_name_: { ... project details ... }
      }
    }
  }
}
```
