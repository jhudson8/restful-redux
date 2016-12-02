# react-redux-model
Simple to use XHR fetching and model-oriented utility functions.

## tl;dr
Most applications have common and consistent needs.  Load data using XHR and know the fetch status so it can be represented with a loading indicator.  This lib provides action creators, reducers and React component wrappers that work with each other to simplify and DRY up your code.

## More Details
There are ties between action creators, reducers and state-aware components in that

* action creators have to supply the action type that the reducers will be scanning for
* reducers have to save state where state-aware components will be pulling from
* this pattern is common for almost every bit of XHR data that we retrieve so why not DRY that up?

Goals of this project

* Make XHR fetching easy and be able to support multiple XHR libs
* Make reducer creation easy
* Provide a component wrapper that will auto-fetch your models
* Support [normalizr](https://github.com/paularmstrong/normalizr)
* Support collections
* Auto-add model object (wrapper of your plain old JSON) to your React component
* Support additional model specific "XHR actions"


## Examples

* [simple github profile page viewer (demonstrating XHR auto-fetch and loading state indication)](./examples/01-github-profile-viewer)
* [simple github project search (demonstrating collections)](./examples/02-github-project-search)
* [github project search with paging using custom model class](./examples/03-github-paged-project-search)
* [paged github project search with normalized entities using normalizr and helpful debug settings](./examples/04-normalizr-github-paged-project-search)
* [previous project with additional project viewer page from search (demonstrating no additional XHR fetch because of normalized entities) ](./examples/05-normalizr-github-paged-project-search-and-viewer)


## Docs
* [Action Creators](./docs/action-creator.md)
* [Model Provider React component](./docs/model-provider.md)
* [Model Class](./docs/model.md)
* [Model Reducer](./docs/model-reducer.md)


## Installation
```
npm install --save react-redux-model redux-effects redux-effects-fetch redux-multi
```
***note*** `redux-effects`, `redux-effects-fetch` and `redux-multi` are only required if the `reduxEffectsActionCreator` is used.

And apply the middleware dependencies
```
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
import multi from 'redux-multi';

applyMiddleware(multi, effects, fetch);
```
