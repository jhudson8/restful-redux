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

* Make XHR fetching easy and be able to support multiple XHR libs (see example)[./examples/github-profile-view/lib/profile-page/actions.js]
* Make reducer creation easy [see example]()./examples/github-profile-view/lib/profile-page/reducer.js)
* Provide a component wrapper that will auto-fetch your models [see example](./examples/github-profile-view/lib/profile-page/index.js#L26)
* Support [normalizr](https://github.com/paularmstrong/normalizr) (TODO example)
* Support collections (TODO example)
* Auto-add model object (wrapper of your plain old JSON) to your React component [see example](./examples/github-profile-view/lib/profile-page/profile-page.js#L28)
* Support additional model specific "XHR actions" (TODO example)

[See example applications](./examples)

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
