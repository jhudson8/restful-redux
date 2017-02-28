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
  fetchOrAction: FETCH
}, {
  name: 'Delete',
  method: 'DELETE',
  isDelete: true
}, {
  name: 'Put',
  method: 'PUT'
}, {
  name: 'Patch',
  method: 'PATCH'
}, {
  name: 'Post',
  method: 'POST'
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
    actionBubbleUp,
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
      const _formatter = formatter || defaultFormat(!actionId || replaceModel ? 'result' : 'response');
      const formatterOptions = {
        id: id,
        actionId: actionId,
        entityType: entityType
      };
      if (type === SUCCESS) {
        if (!actionId || replaceModel) {
          payload = _formatter(payload, formatterOptions);
          if (schema && normalize && payload) {
            payload = Object.assign(payload, normalize(payload.result, schema));
          }
        } else {
          payload = _formatter(response.value, formatterOptions);
        }
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
      if (bubbleUp === false || actionBubbleUp === false) {
        payload.bubbleUp = false;
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
          dispatch(reduxAction);
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
              type: 'CLEAR',
              id
            }));
          }, clearAfter);
        });
      }

      return rtn;
    };
  }

  var rtn = {
    /* return an action which will set meta data to be associated with a model */
    createModelDataAction: function (id, data) {
      return {
        type: `${actionPrefix}_DATA`,
        payload: {
          id: id,
          data: data
        }
      };
    }
  };

  REST_METHODS.forEach(function (options) {
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
    rtn[`create${options.name}Action`] = function ({
      id,
      actionId,
      bubbleUp,
      url,
      params,
      schema,
      formatter,
      replaceModel,
      successAction,
      errorAction,
      clearAfter
    }) {
      if (id === false) {
        id = NO_ID;
      }
      const fetchOrAction = options.fetchOrAction || ACTION;
      params = Object.assign({}, params, {
        method: options.method
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

      const pendingAction = createPendingAction(actionPrefix, id, actionId);
      const fetchAction = fetch(url, params);
      const composedAction = bind(fetchAction,
        asyncResponseAction({
          entityType,
          fetchOrAction: fetchOrAction,
          type: SUCCESS,
          id,
          actionId,
          replaceModel,
          isDelete: options.isDelete,
          actionBubbleUp: bubbleUp,
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
          actionBubbleUp: bubbleUp,
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


// create a dispatchable action that represents a pending model/REST document action
function createPendingAction (actionPrefix, id, actionId) {
  const type = actionId ? ACTION : FETCH;
  const payload = { id };
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
