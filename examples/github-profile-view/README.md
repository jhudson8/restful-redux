Example project using Github API to show profile details
--------------------------------------------------------

See [./lib](./lib) for code example

Small example using
- [react](https://facebook.github.io/react/): view lib
- [redux](https://github.com/reactjs/redux): state container
- [react-router](https://github.com/ReactTraining/react-router): to present react components based on the current browser URL
- [redux-effects](https://github.com/redux-effects/redux-effects): keep side effects out of your app (and into your middleware) - and it makes action creators very unit testable
- [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch): XHR handler for `redux-effects` which uses [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)


## Installation
```
git clone https://github.com/jhudson8/redux-model-util.git
cd redux-model-util/examples/github-profile-view
npm i
npm start
```
browse to [http://localhost:8080/profile/jhudson8](http://localhost:8080/profile/jhudson8)
