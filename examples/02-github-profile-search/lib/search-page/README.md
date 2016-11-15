Github Profile Search Example
--------------------------------------------------------
This contains the action creators, reducer and smart/dumb components to display the webpage for showing github profiles.  You would normally organize your project to be a bit more robust but this keeps things simple for example purposes.


### Redux action types

* `SEARCH_FETCH_PENDING`: Triggered by the action creator when a fetch request is made
* `SEARCH_FETCH_SUCCESS`: Triggered by the action creator if the fetch was a success
* `SEARCH_FETCH_ERROR`: Triggered by the action creator if there was a fetch error


### Populated Redux State
```
{
  // from ../reducers.js (used with combineReducers)
  routing: {... react router state ...},
  app: {
    // created with ./reducer (using the entityType option) assuming a single search for "cat"
    entities: {
      _meta: {
        search: {
          cat: {
            // this is included using the `formatter` attribute in ./index.js
            data: {
              totalCount: ...total search results
            },
            ... some other meta values which keep track of fetch state
          }
        }
      },
      search: {
        cat: [
          {... search result item ...},
        ]
      }
    }
  }
}
```
