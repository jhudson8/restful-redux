Github Profile Search Example
--------------------------------------------------------
This is similar to [02-github-profile-search](../../../02-github-profile-search) except that now we page out the results with `previous` and `next` buttons.


### Differences from previous example

* the `id` option in the [modelProvider](./index.js) is now a function returning a composite value of the search term *and* page number
* added page number references in the route definitions, search action creator and fetch action creator
* added a [custom model class](./collection) used to provide some helper methods.  This is defined with the `modelClass` attribute for our [modelProvider](./index.js)
* we used a custom property name `modelProp` to represent our search results (now we're calling it `collection`) in our [modelProvider](./index.js)
* added a 2nd `pageNum` parameter to the `search` prop (from mapDispatchToProps) and the showSearchPage action creator



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
          'cat:1': {
            // this is included using the `formatter` attribute in ./index.js
            data: {
              totalCount: ...total search results
            },
            ... some other meta values which keep track of fetch state
          },
          ...
        }
      },
      search: {
        'cat:1': [
          {... search result item ...},
        ],
        'cat:2': [
          {... search result item ...},
        ]
      }
    }
  }
}
```
