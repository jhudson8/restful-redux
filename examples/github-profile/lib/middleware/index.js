import effects from 'redux-effects';
import fetch, { fetchEncodeJSON } from 'redux-effects-fetch';
import multi from 'redux-multi';

export default [
  effects,
  fetch,
  fetchEncodeJSON,
  multi
];
