/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */

const FETCH = 'FETCH';
const ACTION = 'ACTION';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';
const PENDING = 'PENDING';

export default function (domain) {
  return {

    /* return the action to be dispatched when a model/REST document should be fetched
     * - FETCH_SUCCESS_{domain}: the data was retrieved successfully
     * - FETCH_ERROR_{domain}: there was an error with the request
     * - FETCH_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain: the domain key used for all of the event type values
     * - id: the model id (to be added to the payloads for the reducer)
     * - url: the endpoint URI
     * - payload: [effects-fetch payload](https://github.com/redux-effects/redux-effects-fetch#creating-a-user)
     */
    createFetchAction: function ({ id, url, payload, onSuccess, onError }) {
      return [
        createPendingAction(domain, id, true),
        bind(
          fetch(url, payload),
          asyncResponseAction(domain, FETCH, SUCCESS, id, onSuccess),
          asyncResponseAction(domain, FETCH, ERROR, id, onError)
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
    createXHRAction: function ({ id, url, payload, onSuccess, onError, clearAfter }) {
      return [
        createPendingAction(domain, id),
        bind(
          fetch(url, payload),
          asyncResponseAction(domain, ACTION, SUCCESS, id, onSuccess, clearAfter),
          asyncResponseAction(domain, ACTION, ERROR, id, onError, clearAfter)
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
    createPromiseAction: function ({ id, promise, clearAfter }) {
      return [
        createPendingAction(domain, id),
        // requires `redux-thunk`
        function (dispatch) {
          promise.then(function (value) {
            dispatch(asyncResponseAction(domain, ACTION, SUCCESS, id, undefined, clearAfter)(value));
          }, function (value) {
            dispatch(asyncResponseAction(domain, ACTION, ERROR, id, undefined, clearAfter)(value));
          });
        }
      ];
    }
  };
}


// create a dispatchable action that represents a pending model/REST document action
function createPendingAction (domain, id, isFetch) {
  const type = isFetch ? FETCH : ACTION;
  return createAction(`${domain}_${type}_PENDING`, { id });
}

// return a callback handler which includes the provided id in the payload as a top level attribute
function asyncResponseAction (domain, fetchOrAction, type, id, callback, clearAfter) {
  return function (payload) {
    callback && callback(payload);

    const action = createAction(
      `${domain}_${fetchOrAction}_${type}`,
      id ? Object.assign({ __meta: { id: id } }, payload) : payload
    );

    if (clearAfter) {
      // requires `redux-thunk`
      return [action, function (dispatch) {
        setTimeout(function () {
          dispatch(asyncResponseAction (domain, fetchOrAction, 'CLEAR', id));
        }, clearAfter);
      }];
    } else {
      return action;
    }
  }
}

// return an action using the given type and payload
function createAction (type, payload) {
  return {
    type: type,
    payload: payload
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
