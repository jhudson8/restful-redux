/**
 * Utility method for a consistent fetch pattern.  Return the state if applicable and false otherwise.
 * Options
 * - state: the reducer state
 * - domain: the domain used to isolate the event type names
 * - action: action
 */
export default function (domain) {

  function update (
    state,
    id,
    entities,
    meta,
    clearModel
  ) {
    // make sure our necessary data structure is initialized
    let stateEntities = state.entities || {};
    stateEntities._meta = stateEntities._meta || {};

    // make sure we are immutable
    state = Object.assign({}, state);
    state.entities = Object.assign({}, entities
      ? updateEntityModels(entities, stateEntities)
      : stateEntities);
    state.entities._meta = Object.assign({}, state.entities._meta);

    // update the metadata
    stateEntities = state.entities;
    const metaDomain = Object.assign({}, stateEntities._meta[domain]);
    stateEntities._meta[domain] = metaDomain;
    meta = Object.assign({}, metaDomain[id], meta);

    // clear out any undefined fields
    for (var key in meta) {
      if (meta.hasOwnProperty(key) && typeof meta[key] === 'undefined') {
        delete meta[key];
      }
    }
    metaDomain[id] = meta;

    if (clearModel) {
      // just delete the model if this action requires it
      stateEntities[domain] = Object.assign({}, stateEntities[domain]);
      delete(stateEntities[domain][id]);
    }

    return state;
  }

  // prepare the action types that we'll be looking for
  var handlers = [{
    state: 'FETCH_SUCCESS',
    meta: {
      fetched: 'full',
      fetchPending: undefined,
      fetchError: undefined,
      actionId: undefined,
      actionPending: undefined,
      actionError: undefined,
      actionResponse: undefined
    }
  }, {
    state: 'FETCH_PENDING',
    clearModel: true,
    meta: {
      fetched: undefined,
      fetchPending: true
    }
  }, {
    state: 'FETCH_ERROR',
    clearModel: true,
    meta: {
      _responseProp: 'fetchError',
      fetched: false,
      fetchPending: undefined
    }
  }, {
    state: 'ACTION_ERROR',
    meta: {
      _responseProp: 'actionError',
      actionPending: undefined
    }
  }, {
    state: 'ACTION_PENDING',
    meta: {
      actionPending: true,
      actionError: undefined,
      actionResponse: undefined
    }
  }, {
    state: 'ACTION_SUCCESS',
    meta: {
      _responseProp: 'actionResponse',
      actionPending: false,
      actionSuccess: true
    }
  }, {
    state: 'ACTION_CLEAR',
    meta: {
      actionId: undefined,
      actionPending: undefined,
      actionError: undefined,
      actionResponse: undefined,
      actionSuccess: undefined
    }
  }].map(function (data) {
    return [`${domain}_${data.state}`, data];
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
        const id = payload.result || payload.id;
        const actionId = payload.actionId;
        const meta = Object.assign({}, options.meta);
        const responseProp = meta._responseProp;

        if (actionId) {
          meta.actionId = actionId;
        }
        if (responseProp) {
          delete meta._responseProp;
          meta[responseProp] = response;
        }

        return update(
          state,
          id,
          entities,
          meta,
          options.clearModel
        );
      }
    }
    return state;
  }
}

function updateEntityModels (values, entities) {
  var rtn = Object.assign({}, entities);
  var domainIndex = {};
  for (let domain in values) {
    if (values.hasOwnProperty(domain)) {
      rtn[domain] = Object.assign({}, rtn[domain], values[domain]);
    }
  }
  return rtn;
}
