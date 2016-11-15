// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch, { fetchEncodeJSON } from 'redux-effects-fetch';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';

export default [
  routerMiddleware(browserHistory),
  effects,
  fetch,
  fetchEncodeJSON,
  multi
];
