Github Profile Viewer Example
--------------------------------------------------------
This demonstrates simple model XHR fetching, showing loading status and viewing final model details or error results.

See [./lib](./lib) for code example

Example is using the following libs:

* [react](https://facebook.github.io/react/): view lib
* [redux](https://github.com/reactjs/redux): state container
* [react-router](https://github.com/ReactTraining/react-router): to present react components based on the current browser URL
* [redux-effects](https://github.com/redux-effects/redux-effects): keep side effects out of your app (and into your middleware) - and it makes action creators very unit testable
* [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch): XHR handler for `redux-effects` which uses [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)


## Installation
```
git clone https://github.com/jhudson8/react-redux-model.git
cd react-redux-model/examples/01-github-profile-viewer
npm i
npm start
```
browse to [http://localhost:8080/profile/jhudson8](http://localhost:8080/profile/jhudson8)
