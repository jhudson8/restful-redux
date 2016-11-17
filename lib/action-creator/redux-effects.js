'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  (0, _commonUtil.checkRequiredOptions)(['actionPrefix', 'entityType'], options);

  var actionPrefix = options.actionPrefix,
      entityType = options.entityType,
      normalize = options.normalize;

  // return a callback handler which includes the provided id in the payload as a top level attribute

  function asyncResponseAction(_ref) {
    var fetchOrAction = _ref.fetchOrAction,
        type = _ref.type,
        id = _ref.id,
        actionId = _ref.actionId,
        replaceModel = _ref.replaceModel,
        schema = _ref.schema,
        formatter = _ref.formatter,
        callback = _ref.callback,
        clearAfter = _ref.clearAfter;

    return function (response) {
      callback && callback(response.value);
      // response is assumed to be in [normalize](https://github.com/paularmstrong/normalize) format of
      // {result: _id_, entities: {_entityType_: {_id_: ...}}}
      var payload = response.value;
      if (type === SUCCESS) {
        if (!actionId || replaceModel) {
          if (formatter) {
            payload = formatter(payload, id, entityType);
          }
          if (schema && normalize) {
            payload = normalize(payload, schema);
          } else if (!formatter) {
            payload = defaultFormat(payload, id, entityType);
          }
        } else {
          payload = {
            id: id,
            response: formatter ? formatter(response.value, id, actionId, entityType) : response.value
          };
        }
      } else {
        payload = { id: id, response: response.value };
      }
      if (actionId) {
        payload.actionId = actionId;
      }
      var action = createAction(actionPrefix + '_' + fetchOrAction + '_' + type, payload);

      if (clearAfter) {
        // requires `redux-thunk`
        return [action, function (dispatch) {
          setTimeout(function () {
            dispatch(asyncResponseAction({
              entityType: entityType,
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

  return {
    /* return the action to be dispatched when a model/REST document should be fetched
     * - FETCH_SUCCESS_{entityType}: the data was retrieved successfully
     * - FETCH_ERROR_{entityType}: there was an error with the request
     * - FETCH_PENDING_{entityType}: an XHR request was submitted
     * parameters include
     * - entityType:
     */
    createFetchAction: function createFetchAction(options) {
      (0, _commonUtil.checkRequiredOptions)(['id', 'url'], options);

      var id = options.id,
          url = options.url,
          payload = options.payload,
          schema = options.schema,
          formatter = options.formatter,
          onSuccess = options.onSuccess,
          onError = options.onError;

      return [createPendingAction(actionPrefix, id), bind(fetch(url, payload), asyncResponseAction({
        entityType: entityType,
        fetchOrAction: FETCH,
        type: SUCCESS,
        id: id,
        schema: schema,
        formatter: formatter,
        callback: onSuccess
      }), asyncResponseAction({
        entityType: entityType,
        fetchOrAction: FETCH,
        type: ERROR,
        id: id,
        schema: schema,
        formatter: formatter,
        callback: onError
      }))];
    },

    /**
     * return the action to be dispatched when an XHR-based action should be taken on a model/REST document
     * - ACTION_SUCCESS_{entityType}: the data was retrieved successfully
     * - ACTION_ERROR_{entityType}: there was an error with the request
     * - ACTION_PENDING_{entityType}: an XHR request was submitted
     * parameters include
     * - entityType: the entityType key used for all of the event type values
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
          schema = _ref2.schema,
          formatter = _ref2.formatter,
          replaceModel = _ref2.replaceModel,
          onSuccess = _ref2.onSuccess,
          onError = _ref2.onError,
          clearAfter = _ref2.clearAfter;

      return [createPendingAction(actionPrefix, id, actionId), bind(fetch(url, payload), asyncResponseAction({
        entityType: entityType,
        fetchOrAction: ACTION,
        type: SUCCESS,
        id: id,
        actionId: actionId,
        replaceModel: replaceModel,
        schema: schema,
        formatter: formatter,
        callback: onSuccess,
        clearAfter: clearAfter
      }), asyncResponseAction({
        entityType: entityType,
        fetchOrAction: ACTION,
        type: ERROR,
        id: id,
        actionId: actionId,
        formatter: formatter,
        callback: onError,
        clearAfter: clearAfter
      }))];
    }
  };
};

var _commonUtil = require('../common-util');

/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */
var FETCH = 'FETCH';
var ACTION = 'ACTION';
var SUCCESS = 'SUCCESS';
var ERROR = 'ERROR';
var PENDING = 'PENDING';

// create a dispatchable action that represents a pending model/REST document action
function createPendingAction(actionPrefix, id, actionId) {
  var type = actionId ? ACTION : FETCH;
  var payload = { id: id };
  if (actionId) {
    payload.actionId = actionId;
  }
  return createAction(actionPrefix + '_' + type + '_PENDING', payload);
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

// // {result: _id_, entities: {_entityType: {_id_: ...
function defaultFormat(value, id, entityType) {
  var rtn = {
    result: id,
    entities: {}
  };
  var entityTypeData = rtn.entities[entityType] = {};
  entityTypeData[id] = value;
  return rtn;
}