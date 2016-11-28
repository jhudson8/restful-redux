Github Profile Search Example
--------------------------------------------------------
This example builds upon [./03-github-paged-profile-search](./03-github-paged-profile-search) with additional [normalizr](https://github.com/paularmstrong/normalizr) support.


### Differences from previous example

* a normalizr schema was created in [./schema](./schema.js)
* the `normalize` function from `normalizr` and `./schema` are provided as options in the [action creator](./actions.js)
* the `denormalize` function from `denormalizr` and `./schema` are provided as options in the [model provider](./index.js)

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
          'repo_id_1', 'repo_id_2', ...
        ],
        ...
      },
      repositories: {
        repo_id_1: {
          ...
        },
        repo_id_2: {
          ...
        },
        ...
      }
    }
  }
}
```
