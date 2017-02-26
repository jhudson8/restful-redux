# restful-redux

## tl;dr
REST oriented action creators, reducers and model utilities to DRY up boilerplate XHR functionality.


## More Details
GraphQL has it's place but many applications use REST-based service APIs for a variety of reasons.

There are always commonalities between action creators, reducers and smart components with redux like

* action creators have to supply the action type that the associated reducers will be scanning for
* reducers have to save state where data consuming smart components will be looking

Goals of this project

* Simplify and DRY up REST document/model oriented XHR action creation
* Simplify and DRY up associated reducers
* Provide a React component wrapper that will auto-fetch your document/model data
* Support collections
* Support additional model metadata (which can be set if the document/model has not yet been retrieved)
* Support [normalizr](https://github.com/paularmstrong/normalizr)


## Installation
```
npm install --save restful-redux redux-effects redux-effects-fetch redux-multi redux-thunk
```

And apply the middleware dependencies
```
import effects from 'redux-effects'; // encapsulate side effects into middleware (like XHR activity)
import fetch from 'redux-effects-fetch'; // XHR middleware handler for redux-effects
import multi from 'redux-multi'; // allow arrays of actions to be dispatched
import thunk from 'redux-thunk'; // allow async callback functions to be dispatched

// when creating the redux store
applyMiddleware(multi, thunk, effects, fetch);
```


## Basic Example
This is all you need to fetch, reduce and get access to your model data.  Here we will be fetching user data.
### user action creator
```javascript
import { createActionCreator } from 'restful-redux';
const userActionCreator = createActionCreator({
  entityType: 'user', // root attribute of normalized entity structure in redux state
  actionPrefix: 'USER', // prefix for dispatched actions
});
// export our fetch method
export function fetch (id) {
  return userActionCreator.createFetchAction({
    id: id,
    url: `/my/user/api/${id}`
  });
}
```

### user model reducer
```javascript
import { createReducer } from 'restful-redux';
export createReducer({
  // notice how these match the action creator attributes
  entityType: 'user',
  actionPrefix: 'USER',
});
```

### React component model provider
```javascript
// notice how your React component can be a pure function
function UserProfileComponent ({ model }) {
  if (model.isFetchPending()) {
    return <div>Loading...</div>;
  } else if (model.fetchError()) {
    // you can also get more details from the fetchError response
    return <div>Fetch error...</div>
  } else {
    const user = model.value();
    return (
      <div>
        {user.firstName} {user.lastName}
      </div>
    )
  }
}

// now wrap up your component in a "modeProvider" to auto-fetch the model data
import { modelProvider } from 'restful-redux';
export modelProvider({
  id: 'params.id', // will look for an id in `props.params.id`
  entityType: 'user',
  fetchProp: 'fetch'
})(UserProfileComponent);
```
That's it!  The `modelProvider` is expected to be wrapped in a `smart component` with an `entities` prop available which represents the same state available to your reducer.


## Docs
* [Action Creator](./docs/action-creator.md)
* [Model Provider React component](./docs/model-provider.md)
* [Model Class](./docs/model.md)
* [Model Reducer](./docs/model-reducer.md)


## Examples
* [simple profile viewer using github API (demonstrating XHR auto-fetch and loading state indication)](./examples/01-github-profile-viewer)
* [simple github project search using github API (demonstrating collections)](./examples/02-github-project-search)
* [previous example with paging using custom model class](./examples/03-github-paged-project-search)
* [previous example with normalized entities using normalizr and helpful debug settings](./examples/04-normalizr-github-paged-project-search)
* [previous example with additional project details page (demonstrating no additional XHR fetch for details page because of normalized entities) ](./examples/05-normalizr-github-paged-project-search-and-viewer)
