const EFFECT_FETCH = 'EFFECT_FETCH';
const fetchJSONMiddleware = (store) => (next) => (action) => { // eslint-disable-line no-unused-vars
  if (action.type === EFFECT_FETCH) {
    let params = action.payload.params || {};
    action = Object.assign({
      payload: Object.assign({
        params: Object.assign({
          credentials: params.credentials || 'same-origin'
        }, params)
      }, action.payload)
    }, action);
    params = action.payload.params;
    const body = params.body;
    if (typeof body === 'object' || Array.isArray(body)) {
      params.headers = Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      }, params.headers);
      params.body = JSON.stringify(body);
    }
  }
  return next(action);
};
export default fetchJSONMiddleware;
