// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';
// allow for actions to be functon(dispatch)
import thunk from 'redux-thunk';
// provide meaningful default configuration to fetch payloads (support cookies, JSON post payloads)
import { fetchConfigMiddleware } from 'restful-redux';

export default [
  multi,
  thunk,
  effects,
  fetchConfigMiddleware(),
  fetch
];
