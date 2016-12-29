# restful-redux
RESTful oriented action creators, reducers and model utilities.

## tl;dr
Most applications have common and consistent needs.  Load data using XHR and know the fetch status so it can be represented with a loading indicator.  This package provides action creators, reducers and React component wrappers that work with each other to simplify and DRY up your code.

## More Details
GraphQL has it's place.  Many applications still use a REST-based service API for a variety of reasons.

There are ties between action creators, reducers and state-aware components in that

* action creators have to supply the action type that the reducers will be scanning for
* reducers have to save state where state-aware components will be pulling from
* this pattern is common for almost every bit of XHR data that we retrieve so why not DRY that up?

Goals of this project

* Make XHR fetching easy and be able to support multiple XHR libs
* Make reducer creation easy
* Provide a component wrapper that will auto-fetch your model data
* Support collections
* Support [normalizr](https://github.com/paularmstrong/normalizr)
* Auto-add model object (wrapper of your plain old JSON) to your React component
* Support additional model specific "XHR actions"


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
npm install --save restful-redux redux-effects redux-effects-fetch redux-multi
```

And apply the middleware dependencies
```
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
import multi from 'redux-multi';

applyMiddleware(multi, effects, fetch);
```
