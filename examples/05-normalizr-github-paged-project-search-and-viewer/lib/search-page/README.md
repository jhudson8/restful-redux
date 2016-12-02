Github Project Search Example
--------------------------------------------------------
This example builds upon [04-normalizr-github-paged-profile-search](../../../04-normalizr-github-paged-profile-search) with additional [normalizr](https://github.com/paularmstrong/normalizr) support.


### Differences from previous example

* added `normalizr` and `denormalizr` as [package.json](../../package.json) dependencies
* a normalizr schema was created in [./schema](./schema.js)
* the `normalize` function from `normalizr` and `./schema` are provided as options in the [action creator](./actions.js)
* the `denormalize` function from `denormalizr` and `./schema` are provided as options in the [model provider](./index.js)
* to demonstrate debugging capabilities, added the `debug: true` to the [action creator](./actions.js), [model provider](./index.js), and [model reducer](./reducer.js) (see console logging when viewing the web app)

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
      // "repository" from the schema definition in ./schema.js
      repository: {
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
