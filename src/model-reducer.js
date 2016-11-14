import { checkRequiredOptions } from './common-util';

/**
 * Utility method for a consistent fetch pattern.  Return the state if applicable and false otherwise.
 * Options
 * - state: the reducer state
 * - entityType: the entityType used to isolate the event type names
 * - action: action
 */
export default function (options) {
  checkRequiredOptions(['entityType', 'actionPrefix'], options);

  const {
    entityType,
    actionPrefix,
    fetchType = 'full'
  } = options;

  function update ({
    state,
    id,
    result,
    entities,
    meta,
    clear,
    type
  }) {
    // make sure our necessary data structure is initialized
    let stateEntities = state.entities || {};
    stateEntities._meta = stateEntities._meta || {};

    // make sure we are immutable
    state = Object.assign({}, state);
    if (result) {
      // our collection entity value is the results
      entities = entities || {};
      entities[entityType] = entities[entityType] || {};
      entities[entityType][id] = entities[entityType][id] || result;
    }
    state.entities = Object.assign({}, entities
      ? updateEntityModels(entities, stateEntities)
      : stateEntities);
    state.entities._meta = Object.assign({}, state.entities._meta);

    // update the metadata
    stateEntities = state.entities;
    const metaDomain = Object.assign({}, stateEntities._meta[entityType]);
    stateEntities._meta[entityType] = metaDomain;
    meta = Object.assign({}, metaDomain[id], meta);

    // clear out any undefined fields
    for (var key in meta) {
      if (meta.hasOwnProperty(key) && typeof meta[key] === 'undefined') {
        delete meta[key];
      }
    }
    metaDomain[id] = meta;

    if (clear) {
      // just delete the model if this action requires it
      stateEntities[entityType] = Object.assign({}, stateEntities[entityType]);
      delete(stateEntities[entityType][id]);
    }

    return state;
  }

  // prepare the action types that we'll be looking for
  var handlers = [{
    type: 'FETCH_SUCCESS',
    meta: {
      fetched: fetchType,
      _timestamp: 'fetch',
      fetchPending: undefined,
      fetchError: undefined,
      actionId: undefined,
      actionPending: undefined,
      actionSuccess: undefined,
      actionError: undefined,
      actionResponse: undefined
    }
  }, {
    // same as FETCH_SUCCESS but if more semantically correct if we're setting manually
    type: 'SET',
    meta: {
      fetched: fetchType,
      _timestamp: 'fetch',
      fetchPending: undefined,
      fetchError: undefined,
      actionId: undefined,
      actionPending: undefined,
      actionSuccess: undefined,
      actionError: undefined,
      actionResponse: undefined
    }
  }, {
    type: 'FETCH_PENDING',
    meta: {
      fetched: undefined,
      fetchTimestamp: undefined,
      fetchPending: true
    }
  }, {
    type: 'FETCH_ERROR',
    clear: true,
    meta: {
      _responseProp: 'fetchError',
      fetched: false,
      fetchPending: undefined
    }
  }, {
    type: 'ACTION_ERROR',
    meta: {
      _responseProp: 'actionError',
      actionPending: undefined
    }
  }, {
    type: 'ACTION_PENDING',
    meta: {
      actionPending: true,
      actionTimestamp: undefined,
      actionError: undefined,
      actionResponse: undefined
    }
  }, {
    type: 'ACTION_SUCCESS',
    meta: {
      _responseProp: 'actionResponse',
      _timestamp: 'action',
      actionPending: undefined,
      actionError: undefined,
      actionSuccess: true
    }
  }, {
    type: 'ACTION_CLEAR',
    meta: {
      actionId: undefined,
      actionPending: undefined,
      actionTimestamp: undefined,
      actionError: undefined,
      actionResponse: undefined,
      actionSuccess: undefined,
      actionTimestamp: undefined
    }
  }].map(function (data) {
    return [`${actionPrefix}_${data.type}`, data];
  });

  return function (state = {}, action) {
    const type = action.type;
    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i][0] === type) {
        // we've got a match
        const options = handlers[i][1];
        const payload = action.payload;
        const entities = payload.entities;
        const response = payload.response;
        const result = payload.result;
        const id = payload.id || result;
        const actionId = payload.actionId;
        const meta = Object.assign({}, options.meta);
        const responseProp = meta._responseProp;
        const timestampProp = meta._timestamp;

        if (actionId) {
          meta.actionId = actionId;
        }
        meta.data = payload.data;
        if (responseProp) {
          delete meta._responseProp;
          meta[responseProp] = response;
        }
        if (timestampProp) {
          delete meta._timestamp;
          meta[`${timestampProp}Timestamp`] = new Date().getTime();
        }

        return update({
          state,
          id,
          result,
          entities,
          meta,
          clear: options.clear,
          type: options.type,
        });
      }
    }
    return state;
  }
}

function updateEntityModels (values, entities) {
  var rtn = Object.assign({}, entities);
  var index = {};
  for (let entityType in values) {
    if (values.hasOwnProperty(entityType)) {
      rtn[entityType] = Object.assign({}, rtn[entityType], values[entityType]);
    }
  }
  return rtn;
}
