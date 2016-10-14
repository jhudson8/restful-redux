// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch, { fetchEncodeJSON } from 'redux-effects-fetch';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';

export default [
  effects,
  fetch,
  fetchEncodeJSON,
  multi
];
