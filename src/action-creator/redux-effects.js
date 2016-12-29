import { checkRequiredOptions, logger } from '../common-util';

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
  name: 'Delete',
  method: 'DELETE'
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
    isDelete,
    schema,
    formatter,
    callback,
    clearAfter
  }) {
    return function (response) {
      callback && callback(response.value);
      // response is assumed to be in [normalize](https://github.com/paularmstrong/normalize) format of
      // {result: _id_, entities: {_entityType_: {_id_: ...}}}
      let payload = response.value;
      if (type === SUCCESS) {
        if (!actionId || replaceModel) {
          if (formatter) {
            payload = formatter(payload, id, entityType);
          }
          if (schema && normalize) {
            payload = Object.assign(normalize(payload.result || payload, schema), {
              id: payload.id,
              data: payload.data
            });
          } else if (!formatter) {
            payload = defaultFormat(payload, id, entityType);
          }
        } else {
          payload = {
            id: id,
            response: formatter
              ? formatter(response.value, id, actionId, entityType)
              : response.value
          };
        }
      } else {
        payload = { id: id, response: response.value };
      }
      if (actionId) {
        payload.actionId = actionId;
      }
      if (isDelete) {
        payload.delete = true;
      }
      const actionType = `${actionPrefix}_${fetchOrAction}_${type}`;
      const action = createAction(actionType, payload);

      if (debug) {
        log(`triggering ${actionType} with `, action);
      }

      if (clearAfter) {
        // requires `redux-thunk`
        return [action, function (dispatch) {
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
        }];
      } else {
        return action;
      }
    };
  }

  var rtn = {
    /* return an action which will set meta data to be associated with a model */
    createDataAction: function (id, data) {
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
      url,
      payload,
      schema,
      formatter,
      replaceModel,
      onSuccess,
      onError,
      clearAfter
    }) {
      const fetchOrAction = options.fetchOrAction || ACTION;
      payload = Object.assign({}, payload, {
        method: options.method
      });

      const rtn = [
        createPendingAction(actionPrefix, id, actionId),
        bind(
          fetch(url, payload),
          asyncResponseAction({
            entityType,
            fetchOrAction: fetchOrAction,
            type: SUCCESS,
            id,
            actionId,
            replaceModel,
            isDelete: options.isDelete,
            schema,
            formatter,
            callback: onSuccess,
            clearAfter
          }),
          asyncResponseAction({
            entityType,
            fetchOrAction: fetchOrAction,
            type: ERROR,
            id,
            actionId,
            formatter,
            callback: onError,
            clearAfter
          })
        )
      ];
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

// // {result: _id_, entities: {_entityType: {_id_: ...
function defaultFormat (value, id, entityType) {
  const rtn = {
    result: id,
    entities: {}
  };
  const entityTypeData = rtn.entities[entityType] = {};
  entityTypeData[id] = value;
  return rtn;
}
