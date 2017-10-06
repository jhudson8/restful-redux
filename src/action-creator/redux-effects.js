import { checkRequiredOptions, logger } from '../common-util';

const NO_ID = '_noid_';

/**
 * IMPORTANT: Usage of [multi](https://github.com/ashaffer/redux-multi) middleware or a lib of similar nature is required
 */
const FETCH = 'FETCH';
const ACTION = 'ACTION';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

var REST_METHODS = [{
  name: 'Fetch',
  method: 'GET',
  fetchOrAction: FETCH
}, {
  name: 'Get',
  method: 'GET',
  fetchOrAction: ACTION,
  replaceModel: true
}, {
  name: 'Delete',
  method: 'DELETE',
  isDelete: true,
  fetchOrAction: ACTION
}, {
  name: 'Put',
  method: 'PUT',
  fetchOrAction: ACTION,
  replaceModel: true
}, {
  name: 'Patch',
  method: 'PATCH',
  fetchOrAction: ACTION,
  replaceModel: true
}, {
  name: 'Post',
  method: 'POST',
  fetchOrAction: ACTION,
  replaceModel: true
}];

var STATIC_METHODS = [{
  name: 'LocalPut',
  action: 'SET',
  mapParamTo: 'result'
}, {
  name: 'ModelData',
  action: 'SET_DATA',
  mapParamTo: 'data'
}, {
  name: 'LocalDelete',
  action: 'DELETE',
  payload: {}
}];

export default function (options) {
  checkRequiredOptions(['actionPrefix', 'entityType'], options);

  const {
    actionPrefix,
    entityType,
    normalize,
    bubbleUp,
    debug
  } = options;
  const log = logger(`action-creator-redux-effects "${entityType}"`);

  // return a callback handler which includes the provided id in the payload as a top level attribute
  function asyncResponseAction ({
    fetchOrAction,
    type,
    id,
    actionId,
    replaceModel,
    bubbleUp,
    isDelete,
    schema,
    resolver,
    formatter,
    reduxAction,
    clearAfter
  }) {
    return function (response) {
      // response is assumed to be in [normalize](https://github.com/paularmstrong/normalize) format of
      // {result: _id_, entities: {_entityType_: {_id_: ...}}}
      let payload = response.value;
      const isActionType = actionId && !replaceModel;
      const typeKey = isActionType ? 'response' : 'result';
      const formatterOptions = {
        id: id,
        actionId: actionId,
        entityType: entityType
      };
      if (type === SUCCESS) {
        payload = formatSuccessPayload({
          payload: payload,
          formatter: formatter,
          formatterOptions: formatterOptions,
          type: typeKey,
          schema: schema,
          normalize: normalize
        });
      } else {
        payload = { response: response };
      }
      if (!payload) {
        payload = {};
      }
      payload.id = id;
      if (actionId) {
        payload.actionId = actionId;
      }
      if (isDelete) {
        payload.delete = true;
      }
      if (typeof bubbleUp !== 'undefined') {
        payload.bubbleUp = bubbleUp;
      }

      const actionType = `${actionPrefix}_${fetchOrAction}_${type}`;
      const action = createAction(actionType, payload);
      const genericAction = createAction(`${fetchOrAction}_${type}`, payload);

      if (debug) {
        log(`triggering ${actionType} with `, action);
      }
      const rtn = [genericAction, action, function (dispatch) {
        if (resolver) {
          resolver(payload);
        }
        if (reduxAction) {
          if (typeof reduxAction === 'function') {
            reduxAction = reduxAction(payload);
          }
          if (reduxAction) {
            dispatch(reduxAction);
          }
        }
      }];

      if (clearAfter) {
        // requires `redux-thunk`
        rtn.push(function (dispatch) {
          setTimeout(function () {
            if (debug) {
              log(`action timeout ${entityType}:${id}`);
            }
            dispatch(asyncResponseAction ({
              entityType,
              fetchOrAction,
              bubbleUp,
              type: 'CLEAR',
              id
            }));
          }, clearAfter);
        });
      }

      return rtn;
    };
  }

  var rtn = {};

  STATIC_METHODS.forEach(function (options) {
    const {
      mapParamTo,
      payload,
      action,
      name
    } = options;
    rtn[`create${name}Action`] = function (id, p1, options) {
      options = options || {};
      // if an actionId is provided for a createFetchAction, they really mean createGetAction
      if (options.actionId && name === 'Fetch') {
        return rtn.createGetAction(id, p1, options);
      }

      const {
        formatter,
        schema
      } = options;
      let _payload = payload;
      if (!_payload) {
        if (formatter || schema) {
          _payload = formatSuccessPayload({
            payload: payload,
            formatter: formatter,
            formatterOptions: { id: id },
            type: mapParamTo || 'result',
            schema: schema,
            normalize: normalize
          });
        } else if (mapParamTo) {
          _payload = {};
          _payload[mapParamTo] = p1;
        }
      }
      _payload.id = id;
      return createAction(`${actionPrefix}_${action}`, _payload);
    };
  });

  REST_METHODS.forEach(function (options) {
    const {
      fetchOrAction,
      method
    } = options;
    const isDelete = options.delete;
    const _replaceModel = options.replaceModel;
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
    rtn[`create${options.name}Action`] = function (options) {
      let {
        id,
        actionId,
        url,
        params,
        schema,
        formatter,
        replaceModel,
        successAction,
        errorAction,
        clearAfter
      } = options;
      const _bubbleUp = typeof options.bubbleUp === 'undefined' ? bubbleUp : options.bubbleUp;
      const _delete = typeof options.delete !== 'undefined' ? options.delete : isDelete;
      replaceModel = typeof replaceModel === 'undefined' ? _replaceModel : replaceModel;
      if (typeof actionId === 'undefined' && fetchOrAction === ACTION) {
        actionId = method;
      }
      if (id === false) {
        id = NO_ID;
      }
      params = Object.assign({}, params, {
        method: method
      });

      let resolve, reject, promise;
      if (typeof Promise !== 'undefined') {
        promise = new Promise(function(_resolve, _reject) {
          resolve = function (payload) {
            _resolve(payload);
          };
          reject = _reject;
        });
      }

      const pendingAction = createPendingAction({
        id,
        fetchOrAction,
        actionPrefix,
        actionId,
        bubbleUp: _bubbleUp
      });
      const fetchAction = fetch(url, params);
      const composedAction = bind(fetchAction,
        asyncResponseAction({
          entityType,
          fetchOrAction,
          type: SUCCESS,
          id,
          actionId,
          replaceModel,
          isDelete: _delete,
          bubbleUp: _bubbleUp,
          schema,
          formatter,
          resolver: resolve,
          reduxAction: successAction,
          clearAfter
        }),
        asyncResponseAction({
          entityType,
          fetchOrAction: fetchOrAction,
          type: ERROR,
          id,
          actionId,
          bubbleUp: _bubbleUp,
          formatter,
          resolver: reject,
          reduxAction: errorAction,
          clearAfter
        })
      );

      var rtn = [composedAction, pendingAction];
      rtn.promise = promise;

      if (debug) {
        log(`creating XHR action (${id}:${actionId}) with:\n\t`, rtn);
      }
      return rtn;
    };
  });

  return rtn;
}

function formatSuccessPayload ({ payload, formatter, formatterOptions, type, schema, normalize }) {
  formatter = formatter || defaultFormat(type);
  const _payload = formatter(payload, formatterOptions);
  if (!_payload || _payload === payload) {
    payload = defaultFormat(type)(payload);
  } else {
    payload = _payload;
  }
  if (schema && normalize && payload) {
    payload = Object.assign(payload, normalize(payload.result, schema));
  }
  return payload;
}

// create a dispatchable action that represents a pending model/REST document action
function createPendingAction ({ actionPrefix, id, actionId, fetchOrAction, bubbleUp }) {
  const type = fetchOrAction;
  const payload = { id };
  if (typeof bubbleUp !== 'undefined') {
    payload.bubbleUp = bubbleUp;
  }
  if (actionId) {
    payload.actionId = actionId;
  }
  return createAction(`${actionPrefix}_${type}_PENDING`, payload);
}

// return an action using the given type and payload
function createAction (type, response) {
  return {
    type: type,
    payload: response
  };
}

// duplicate a little redix-effects/redux-effects-fetch/redux-actions code so this lib is not dependant on either lib
const EFFECT_COMPOSE = 'EFFECT_COMPOSE';
const EFFECT_FETCH = 'EFFECT_FETCH';

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

function defaultFormat (type) {
  return function (value) {
    var rtn = {};
    rtn[type] = value;
    return rtn;
  };
}
