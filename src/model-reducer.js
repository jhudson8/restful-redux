import { checkRequiredOptions, logger } from './common-util';

const NO_ID = '_noid_';

/**
 * Utility method for a consistent fetch pattern.  Return the state if applicable and false otherwise.
 * Options
 * - state: the reducer state
 * - entityType: the entityType used to isolate the event type names
 * - action: action
 */
function reducer (options) {
  checkRequiredOptions(['entityType', 'actionPrefix'], options);

  const {
    entityType,
    actionPrefix,
    beforeReduce,
    afterReduce,
    bubbleUp,
    debug
  } = options;
  const verbose = debug === 'verbose';
  const log = logger(`model-reducer "${entityType}"`);

  function update ({
    state,
    action,
    id,
    result,
    entities,
    actionBubbleUp,
    meta,
    clear,
    actionType
  }) {
    // make sure our necessary data structure is initialized
    let stateEntities = Object.assign({}, state.entities);
    const prevState = state;
    state = Object.assign({}, state, { entities: stateEntities});
    stateEntities._meta = Object.assign({}, stateEntities._meta);

    if (beforeReduce) {
      state = beforeReduce({ action, id, entities: stateEntities, result, data: meta.data }, state) || state;
      stateEntities = state.entities;
    }

    if (result && !entities) {
      // our collection entity value is the results
      stateEntities[entityType] = Object.assign({}, stateEntities && [entityType]);
      stateEntities[entityType][id] = result;
    } else if (entities) {
      stateEntities = state.entities = updateEntityModels(entities, stateEntities, id, entityType, meta.fetched);
      // in this case `result` and `id` will match because this is a normalized result
    }

    // update the metadata
    const metaDomain = stateEntities._meta[entityType] = Object.assign({}, stateEntities._meta[entityType]);
    let _data = metaDomain[id] && metaDomain[id].data;
    meta = metaDomain[id] = Object.assign({}, metaDomain[id], meta);

    // handle special `data` meta attribute
    if (meta.data === false) {
      delete meta.data;
    } else if (_data || meta.data) {
      meta.data = _data = Object.assign({}, _data, meta.data);
      for (let key in _data) {
        if (_data.hasOwnProperty(key) && typeof _data[key] === 'undefined') {
          delete _data[key];
        }
      }
    }

    if (clear) {
      // just delete the model if this action requires it
      stateEntities[entityType] = Object.assign({}, stateEntities[entityType]);
      delete(stateEntities[entityType][id]);
    }

    // dirty parent entity if applicable
    const cancelBubbleUp = bubbleUp === false || actionBubbleUp === false;
    const fetchedBy = meta.fetchedBy;
    if (fetchedBy && !cancelBubbleUp) {
      const fetchedByEntityType = fetchedBy.entityType;
      if (stateEntities[fetchedByEntityType]) {
        const fetchedById = fetchedBy.id;
        const fetchedByEntities = stateEntities[fetchedByEntityType] = Object.assign({}, stateEntities[fetchedByEntityType]);
        const fetchedBySource = fetchedByEntities[fetchedById];
        if (fetchedBySource) {
          fetchedByEntities[fetchedById] = Array.isArray(fetchedBySource)
            ? fetchedBySource.slice(0)
            : Object.assign({}, fetchedBySource);
        }
      }
    }

    if (afterReduce) {
      state = afterReduce({ action, id, entities: stateEntities, result, data: meta.data }, state) || state;
    }

    // clear out any undefined fields
    for (var key in meta) {
      if (meta.hasOwnProperty(key) && typeof meta[key] === 'undefined') {
        delete meta[key];
      }
    }

    if (debug) {
      log(`${actionType} (${id}) handled\n\tprevious state:\n\t`, prevState, '\n\tpost state:\n\t', state, '\n\tresult:\n\t', result, '\n\tentities:\n\t', entities);
    }
    return state;
  }

  // prepare the action types that we'll be looking for
  var handlers = [
    createMeta({
      type: 'FETCH_SUCCESS',
      meta: {
        fetched: true
      }
    }, ['fetchPending', 'fetchError', 'actionId', 'actionPending', 'actionSuccess',
      'actionError', 'actionResponse', 'actionInitiatedAt', 'actionCompletedAt']),
    createMeta({
      // same as FETCH_SUCCESS but if more semantically correct if we're setting manually
      type: 'SET',
      meta: {
        fetched: true
      }
    }, ['fetchPending', 'fetchError', 'actionId', 'actionPending', 'actionSuccess',
      'actionError', 'actionResponse', 'fetchInitiatedAt', 'fetchCompletedAt']),
    createMeta({
      type: 'FETCH_PENDING',
      meta: {
        fetchPending: true,
        fetchInitiatedAt: '_timestamp'
      }
    }, ['fetched', 'fetchCompletedAt']),
    createMeta({
      type: 'FETCH_ERROR',
      clear: true,
      meta: {
        _responseProp: 'fetchError'
      }
    }, ['fetchPending']),
    createMeta({
      type: 'ACTION_ERROR',
      meta: {
        _responseProp: 'actionError',
        actionCompletedAt: '_timestamp'
      }
    }, ['actionPending']),
    createMeta({
      type: 'ACTION_PENDING',
      meta: {
        actionPending: true,
        actionInitiatedAt: '_timestamp'
      }
    }, ['actionCompletedTimestamp', 'actionError', 'actionResponse']),
    createMeta({
      type: 'ACTION_SUCCESS',
      meta: {
        _responseProp: 'actionResponse',
        actionSuccess: true,
        actionCompletedAt: '_timestamp'
      }
    }, ['actionPending', 'actionError']),
    createMeta({
      type: 'ACTION_CLEAR',
      meta: {}
    }, ['actionId', 'actionPending', 'actioninitiatedAt', 'actionCompletedAt', 'actionError', 'actionResponse',
      'actionSuccess']),
    { type: 'DATA' }
  ].map(function (data) {
    return [`${actionPrefix}_${data.type}`, data];
  });
  if (verbose) {
    log('loaded\n\tlistening for ' + handlers.map(data => data[0]).join(', '));
  }

  return function (state = {}, action) {
    const type = action.type;
    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i][0] === type) {
        // we've got a match
        const now = new Date().getTime();
        const options = handlers[i][1];
        const payload = action.payload;
        const entities = payload.entities;
        const response = payload.response;
        const result = payload.result;
        const bubbleUp = payload.bubbleUp;
        const id = (payload.id === false ? NO_ID : payload.id) || result;
        const actionId = payload.actionId;
        const meta = Object.assign({}, options.meta);
        const responseProp = meta._responseProp;

        if (meta.fetched) {
          meta.fetched = {
            type: 'full',
            completedAt: now
          };
        }

        if (actionId) {
          meta.actionId = actionId;
        }
        meta.data = payload.data;
        if (responseProp) {
          delete meta._responseProp;
          meta[responseProp] = response;
        }

        for (var key in meta) {
          if (meta[key] === '_timestamp') {
            meta[key] = now;
          }
        }

        return update({
          state,
          action,
          id,
          result,
          entities,
          actionBubbleUp: bubbleUp,
          meta,
          clear: options.clear,
          type: options.type,
          actionType: type
        });
      }
    }

    if (verbose) {
      log(`action *not* handled: ${type}`);
    }
    return state;
  };
}

function createMeta (props, clearProps) {
  clearProps.forEach(function (propType) {
    props.meta[propType] = undefined;
  });
  return props;
}

function updateEntityModels (values, entities, primaryId, primaryEntityType, fetchData) {
  const fetchedBy = Object.assign({}, fetchData, { entityType: primaryEntityType, id: primaryId } );
  const rtn = Object.assign({}, entities);
  const _meta = rtn._meta = Object.assign({}, entities._meta);
  for (let entityType in values) {
    if (values.hasOwnProperty(entityType)) {
      rtn[entityType] = Object.assign({}, rtn[entityType], values[entityType]);
      if (fetchData) {
        var entitiesMeta = _meta[entityType] = Object.assign({}, _meta[entityType]);
        for (var id in values[entityType]) {
          if (id === primaryId && entityType === primaryEntityType) {
            entitiesMeta[id] = Object.assign({ fetched: fetchData }, entitiesMeta[id]);
          } else {
            entitiesMeta[id] = Object.assign({ fetched: { type: 'normalized' } }, entitiesMeta[id], { fetchedBy: fetchedBy });
          }
        }
      }
    }
  }
  return rtn;
}

export default reducer;
