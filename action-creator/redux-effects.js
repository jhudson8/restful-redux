/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */
const FETCH = 'FETCH';
const ACTION = 'ACTION';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';
const PENDING = 'PENDING';

export default function (
  domain, // the domain key used for all of the event type values
  options // { actions: {}}; action response formatters
) {
  options = options || {};
  const normalize = options.normalize;
  const schema = options.schema;

  return {

    /* return the action to be dispatched when a model/REST document should be fetched
     * - FETCH_SUCCESS_{domain}: the data was retrieved successfully
     * - FETCH_ERROR_{domain}: there was an error with the request
     * - FETCH_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain:
     */
    createFetchAction: function ({
      id, // the model id (to be added to the payloads for the reducer)
      url, // the endpoint URI
      payload, // [effects-fetch payload](https://github.com/redux-effects/redux-effects-fetch#creating-a-user)
      format, // function used to format the response - must respond with { result: _id_, entries: { _domain_: { _id_: {...} } } }
      onSuccess,
      onError
    }) {
      return [
        createPendingAction(domain, id),
        bind(
          fetch(url, payload),
          asyncResponseAction({
            domain: domain,
            fetchOrAction: FETCH,
            type: SUCCESS,
            id: id,
            format: format,
            callback: onSuccess
          }),
          asyncResponseAction({
            domain: domain,
            fetchOrAction: FETCH,
            type: ERROR,
            id: id,
            format: format,
            callback: onError
          }),
        )
      ];
    },

    /**
     * return the action to be dispatched when an XHR-based action should be taken on a model/REST document
     * - ACTION_SUCCESS_{domain}: the data was retrieved successfully
     * - ACTION_ERROR_{domain}: there was an error with the request
     * - ACTION_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain: the domain key used for all of the event type values
     * - id: the model id (to be added to the payloads for the reducer)
     * - url: the endpoint URI
     * - payload: [effects-fetch payload](https://github.com/redux-effects/redux-effects-fetch#creating-a-user)
     * - clearAfter: clear the action results after N milliseconds (optional)
     */
    createXHRAction: function ({
      id,
      actionId,
      url,
      payload,
      format,
      replaceModel,
      onSuccess,
      onError,
      clearAfter
    }) {
      return [
        createPendingAction(domain, id, actionId),
        bind(
          fetch(url, payload),
          asyncResponseAction({
            domain: domain,
            fetchOrAction: ACTION,
            type: SUCCESS,
            id: id,
            actionId: actionId,
            format: format,
            replaceModel: replaceModel,
            normalize: normalize,
            schema: schema,
            callback: onSuccess,
            clearAfter: clearAfter
          }),
          asyncResponseAction({
            domain: domain,
            fetchOrAction: ACTION,
            type: ERROR,
            id: id,
            actionId: actionId,
            format: format,
            normalize: normalize,
            schema: schema,
            callback: onError,
            clearAfter: clearAfter
          })
        )
      ];
    },

    /**
     * return the action to be dispatched when an promise-based action should be taken on a model/REST document
     * - ACTION_SUCCESS_{domain}: the data was retrieved successfully
     * - ACTION_ERROR_{domain}: there was an error with the request
     * - ACTION_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain: the domain key used for all of the event type values
     * - id: the model id (to be added to the payloads for the reducer)
     * - promise: the promise representing the async work to do
     * - clearAfter: clear the action results after N milliseconds (optional)
     */
    createPromiseAction: function ({
      id,
      actionId,
      promise,
      clearAfter
    }) {
      return [
        createPendingAction(domain, id, actionId),
        // requires `redux-thunk`
        function (dispatch) {
          promise.then(function (value) {
            dispatch(asyncResponseAction({
              domain: domain,
              fetchOrAction: ACTION,
              type: SUCCESS,
              id: id,
              actionId: actionId,
              clearAfter: clearAfter
            }));
          }, function (value) {
            dispatch(asyncResponseAction({
              domain: domain,
              fetchOrAction: ACTION,
              type: ERROR,
              id: id,
              actionId: actionId,
              clearAfter: clearAfter
            }));
          });
        }
      ];
    }
  };
}


// return a callback handler which includes the provided id in the payload as a top level attribute
function asyncResponseAction ({
  domain,
  fetchOrAction,
  type,
  id,
  actionId,
  replaceModel,
  format,
  normalize,
  schema,
  callback,
  clearAfter
}) {
  return function (response) {
    callback && callback(response.value);
    // response is assumed to be in [normalizr](https://github.com/paularmstrong/normalizr) format of
    // {result: _id_, entities: {_domain_: {_id_: ...}}}
    let payload;
    if (type === SUCCESS) {
      if (!actionId || replaceModel) {
        payload = (format || defaultFormat)(response.value, id, domain);
        if (normalize && schema) {
          payload = normalize(payload, schema);
        }
      } else {
        payload = {
          id: id,
          response: format ? format(response.value, id, actionId, domain) : response.value
        };
      }
    } else {
      payload = { id: id, response: response.value };
    }
    if (actionId) {
      payload.actionId = actionId;
    }
    const action = createAction(`${domain}_${fetchOrAction}_${type}`, payload);

    if (clearAfter) {
      // requires `redux-thunk`
      return [action, function (dispatch) {
        setTimeout(function () {
          dispatch(asyncResponseAction ({
            domain: domain,
            fetchOrAction: fetchOrAction,
            type: 'CLEAR',
            id: id
          }));
        }, clearAfter);
      }];
    } else {
      return action;
    }
  }
}

// create a dispatchable action that represents a pending model/REST document action
function createPendingAction (domain, id, actionId) {
  const type = actionId ? ACTION : FETCH;
  const payload = { id };
  if (actionId) {
    payload.actionId = actionId;
  }
  return createAction(`${domain}_${type}_PENDING`, payload);
}

// return an action using the given type and payload
function createAction (type, response) {
  return {
    type: type,
    payload: response
  };
}

// duplicate a little redix-effects/redux-effects-fetch/redux-actions code so this lib is not dependant on either lib
const EFFECT_COMPOSE = 'EFFECT_COMPOSE'
const EFFECT_FETCH = 'EFFECT_FETCH'

function bind (action, ...args) {
  return {
    type: EFFECT_COMPOSE,
    payload: action,
    meta: {
      steps: [args]
    }
  };
}

function fetch (url = '', params = {}) {
  return {
    type: EFFECT_FETCH,
    payload: {
      url,
      params
    }
  };
}

// // {result: _id_, entities: {_domain: {_id_: ...
function defaultFormat (value, id, domain) {
  var rtn = {
    result: id,
    entities: {}
  };
  var domainData = rtn.entities[domain] = {};
  domainData[id] = value;
  return rtn;
}
