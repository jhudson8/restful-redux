// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import { fetchJSONMiddleware } from 'restful-redux';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';
import thunk from 'redux-thunk';

export default [
  routerMiddleware(browserHistory),
  effects,
  fetchJSONMiddleware,
  fetch,
  thunk,
  multi
];
