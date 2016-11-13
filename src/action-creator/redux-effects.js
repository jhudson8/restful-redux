import { checkRequiredOptions } from '../common-util';

/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */
const MODEL_FETCH = 'MODEL_FETCH';
const MODEL_ACTION = 'MODEL_ACTION';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';
const MODEL_PENDING = 'MODEL_PENDING';

export default function (
  domain, // the domain key used for all of the event type values
  options // { actions: {}}; action response formatters
) {
  options = options || {};
  const normalize = options.normalize;

  // return a callback handler which includes the provided id in the payload as a top level attribute
  function asyncResponseAction ({
    domain,
    fetchOrAction,
    type,
    id,
    actionId,
    replaceModel,
    schema,
    formatter,
    callback,
    clearAfter
  }) {
    return function (response) {
      callback && callback(response.value);
      // response is assumed to be in [normalize](https://github.com/paularmstrong/normalize) format of
      // {result: _id_, entities: {_domain_: {_id_: ...}}}
      let payload = response.value;
      if (type === SUCCESS) {
        if (!actionId || replaceModel) {
          if (formatter) {
            payload = formatter(payload, id, domain);
          }
          if (schema && normalize) {
            payload = normalize(payload, schema);
          } else if (!formatter) {
            payload = defaultFormat(payload, id, domain);
          }
        } else {
          payload = {
            id: id,
            response: formatter
              ? formatter(response.value, id, actionId, domain)
              : response.value
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
              domain,
              fetchOrAction,
              type: 'CLEAR',
              id
            }));
          }, clearAfter);
        }];
      } else {
        return action;
      }
    }
  }

  return {
    /* return the action to be dispatched when a model/REST document should be fetched
     * - FETCH_SUCCESS_{domain}: the data was retrieved successfully
     * - FETCH_ERROR_{domain}: there was an error with the request
     * - FETCH_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain:
     */
    modelFetchAction: function (options) {
      checkRequiredOptions(['id', 'url'], options);

      let {
        id, // the model id (to be added to the payloads for the reducer)
        url, // the endpoint URI
        payload, // [effects-fetch payload](https://github.com/redux-effects/redux-effects-fetch#creating-a-user)
        schema,
        formatter,
        onSuccess,
        onError
      } = options;
      return [
        createPendingAction(domain, id),
        bind(
          fetch(url, payload),
          asyncResponseAction({
            domain,
            fetchOrAction: MODEL_FETCH,
            type: SUCCESS,
            id,
            schema,
            formatter,
            callback: onSuccess
          }),
          asyncResponseAction({
            domain,
            fetchOrAction: MODEL_FETCH,
            type: ERROR,
            id,
            schema,
            formatter,
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
      schema,
      formatter,
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
            domain,
            fetchOrAction: MODEL_ACTION,
            type: SUCCESS,
            id,
            actionId,
            replaceModel,
            schema,
            formatter,
            callback: onSuccess,
            clearAfter
          }),
          asyncResponseAction({
            domain,
            fetchOrAction: MODEL_ACTION,
            type: ERROR,
            id,
            actionId,
            formatter,
            callback: onError,
            clearAfter
          })
        )
      ];
    }
  };
}


// create a dispatchable action that represents a pending model/REST document action
function createPendingAction (domain, id, actionId) {
  const type = actionId ? MODEL_ACTION : MODEL_FETCH;
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
  const rtn = {
    result: id,
    entities: {}
  };
  const domainData = rtn.entities[domain] = {};
  domainData[id] = value;
  return rtn;
}
