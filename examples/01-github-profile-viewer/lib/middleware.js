// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';
import { fetchJSONMiddleware } from 'restful-redux';

export default [
  effects,
  fetchJSONMiddleware,
  fetch,
  multi
];
