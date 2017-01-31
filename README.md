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


## Examples

* [simple profile viewer using github API (demonstrating XHR auto-fetch and loading state indication)](./examples/01-github-profile-viewer)
* [simple github project search using github API (demonstrating collections)](./examples/02-github-project-search)
* [previous example with paging using custom model class](./examples/03-github-paged-project-search)
* [previous example with normalized entities using normalizr and helpful debug settings](./examples/04-normalizr-github-paged-project-search)
* [previous example with additional project details page (demonstrating no additional XHR fetch for details page because of normalized entities) ](./examples/05-normalizr-github-paged-project-search-and-viewer)


## Docs
* [Action Creator (using redux-effects)](./docs/action-creator.md)
* [Model Provider React component](./docs/model-provider.md)
* [Model Class](./docs/model.md)
* [Model Reducer](./docs/model-reducer.md)


## Installation
```
npm install --save restful-redux
```
Following is only required if using the [redux-effects](https://github.com/redux-effects/redux-effects)-based action creator
```
npm install --save restful-redux redux-effects redux-effects-fetch redux-multi redux-thunk
```

And apply the middleware dependencies
```
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
import multi from 'redux-multi';
import thunk from 'redux-thunk';

applyMiddleware(multi, thunk, effects, fetch);
```
