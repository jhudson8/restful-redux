react-redux-model
----------------
Simple to use XHR fetching and model-oriented utility functions.

## tl;dr
Most applications have common and consistent needs.  Load data using XHR and know fetch status so it can be represented with a loading indicator.  This package provides action creators, reducers and React component wrappers to make this easy and DRY up your code.

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

* [simple XHR auto-fetch and loading state indication](./examples/01-github-profile-viewer/lib/profile-page)
* [collection (multiple allowed) loading with formatting and result meta data storage](./examples/02-github-profile-search/lib/search-page)
* [paged collection from example above](./examples/03-github-paged-profile-search/lib/search-page)

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
