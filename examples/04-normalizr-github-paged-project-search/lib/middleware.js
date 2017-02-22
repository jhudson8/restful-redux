// keep side effects out of the app and into middleware
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
// router middleware
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
// allow for redux actions to be arrays of actions
import multi from 'redux-multi';
// allow for actions to be functon(dispatch)
import thunk from 'redux-thunk';
// provide meaningful default configuration to fetch payloads (support cookies, JSON post payloads)
import { fetchConfigMiddleware } from 'restful-redux';

export default [
  multi,
  thunk,
  routerMiddleware(browserHistory),
  effects,
  fetchConfigMiddleware(),
  fetch
];
