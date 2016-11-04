'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (domain, // the domain key used for all of the event type values
options // { actions: {}}; action response formatters
) {
  options = options || {};
  var normalize = options.normalize;
  var schema = options.schema;

  return {

    /* return the action to be dispatched when a model/REST document should be fetched
     * - FETCH_SUCCESS_{domain}: the data was retrieved successfully
     * - FETCH_ERROR_{domain}: there was an error with the request
     * - FETCH_PENDING_{domain}: an XHR request was submitted
     * parameters include
     * - domain:
     */
    createFetchAction: function createFetchAction(_ref) {
      var id = _ref.id,
          url = _ref.url,
          payload = _ref.payload,
          format = _ref.format,
          onSuccess = _ref.onSuccess,
          onError = _ref.onError;

      return [createPendingAction(domain, id), bind(fetch(url, payload), asyncResponseAction({
        domain: domain,
        fetchOrAction: FETCH,
        type: SUCCESS,
        id: id,
        format: format,
        callback: onSuccess
      }), asyncResponseAction({
        domain: domain,
        fetchOrAction: FETCH,
        type: ERROR,
        id: id,
        format: format,
        callback: onError
      }))];
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
    createXHRAction: function createXHRAction(_ref2) {
      var id = _ref2.id,
          actionId = _ref2.actionId,
          url = _ref2.url,
          payload = _ref2.payload,
          format = _ref2.format,
          replaceModel = _ref2.replaceModel,
          onSuccess = _ref2.onSuccess,
          onError = _ref2.onError,
          clearAfter = _ref2.clearAfter;

      return [createPendingAction(domain, id, actionId), bind(fetch(url, payload), asyncResponseAction({
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
      }), asyncResponseAction({
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
      }))];
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
    createPromiseAction: function createPromiseAction(_ref3) {
      var id = _ref3.id,
          actionId = _ref3.actionId,
          promise = _ref3.promise,
          clearAfter = _ref3.clearAfter;

      return [createPendingAction(domain, id, actionId),
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
      }];
    }
  };
};

/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */
var FETCH = 'FETCH';
var ACTION = 'ACTION';
var SUCCESS = 'SUCCESS';
var ERROR = 'ERROR';
var PENDING = 'PENDING';

// return a callback handler which includes the provided id in the payload as a top level attribute
function asyncResponseAction(_ref4) {
  var domain = _ref4.domain,
      fetchOrAction = _ref4.fetchOrAction,
      type = _ref4.type,
      id = _ref4.id,
      actionId = _ref4.actionId,
      replaceModel = _ref4.replaceModel,
      format = _ref4.format,
      normalize = _ref4.normalize,
      schema = _ref4.schema,
      callback = _ref4.callback,
      clearAfter = _ref4.clearAfter;

  return function (response) {
    callback && callback(response.value);
    // response is assumed to be in [normalizr](https://github.com/paularmstrong/normalizr) format of
    // {result: _id_, entities: {_domain_: {_id_: ...}}}
    var payload = void 0;
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
    var action = createAction(domain + '_' + fetchOrAction + '_' + type, payload);

    if (clearAfter) {
      // requires `redux-thunk`
      return [action, function (dispatch) {
        setTimeout(function () {
          dispatch(asyncResponseAction({
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
  };
}

// create a dispatchable action that represents a pending model/REST document action
function createPendingAction(domain, id, actionId) {
  var type = actionId ? ACTION : FETCH;
  var payload = { id: id };
  if (actionId) {
    payload.actionId = actionId;
  }
  return createAction(domain + '_' + type + '_PENDING', payload);
}

// return an action using the given type and payload
function createAction(type, response) {
  return {
    type: type,
    payload: response
  };
}

// duplicate a little redix-effects/redux-effects-fetch/redux-actions code so this lib is not dependant on either lib
var EFFECT_COMPOSE = 'EFFECT_COMPOSE';
var EFFECT_FETCH = 'EFFECT_FETCH';

function bind(action) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return {
    type: EFFECT_COMPOSE,
    payload: action,
    meta: {
      steps: [args]
    }
  };
}

function fetch() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    type: EFFECT_FETCH,
    payload: {
      url: url,
      params: params
    }
  };
}

// // {result: _id_, entities: {_domain: {_id_: ...
function defaultFormat(value, id, domain) {
  var rtn = {
    result: id,
    entities: {}
  };
  var domainData = rtn.entities[domain] = {};
  domainData[id] = value;
  return rtn;
}