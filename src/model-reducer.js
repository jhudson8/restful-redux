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
    actionId,
    // action response
    response,
    // fetch result
    result,
    // normalized entities
    entities,
    // meta data
    data,
    // dispatched action payload `bubbleUp` attribute
    actionBubbleUp,
    meta,
    actionType
  }) {
    // should the value result be deleted
    const clearValue = meta._clearValue;
    // if there is a response, where it should be stored
    const responseProp = meta._responseProp;
    // if this is a fetch event
    const fetched = meta.fetch && meta.fetch.success;

    // make sure our necessary data structure is initialized
    let stateEntities = clone(state.entities);
    const prevState = state;
    state = clone(state, { entities: stateEntities});
    stateEntities._meta = clone(stateEntities._meta);

    if (beforeReduce) {
      state = beforeReduce({ action, id, entities: stateEntities, result, data: meta.data, state: state }, meta) || state;
      stateEntities = state.entities;
    }

    let _entities = stateEntities[entityType] = clone(stateEntities && stateEntities[entityType]);
    if (result && !entities) {
      // our collection entity value is the results
      _entities[id] = result;
    } else if (entities) {
      // in this case `result` and `id` will match because this is a normalized result
      stateEntities = state.entities = updateEntityModels(entities, stateEntities, id, entityType, fetched && {
        success: 'normalized',
        completedAt: new Date().getTime(),
        source: {
          id,
          entityType,
        }
      });
      _entities = stateEntities[entityType];
      if (_entities[result]) {
        // result is the id
        result = _entities[id];
      } else if (result) {
        // result is the value
        _entities[id] = result;
      }
    }

    // update the metadata
    const metaDomain = stateEntities._meta[entityType] = clone(stateEntities._meta[entityType]);
    meta = metaDomain[id] = mergeMeta(meta, metaDomain[id], {
      timestamp: new Date().getTime(),
      actionId
    });

    // handle special user data
    const _data = (data === false) ? data : meta.data ? clone(meta.data, data) : data;
    if (_data && typeof data !== 'boolean') {
      meta.data = _data;
      Object.keys(meta.data).forEach(function (key) {
        if (typeof meta.data[key] === 'undefined') {
          delete meta.data[key];
        }
      });
    } else {
      delete meta.data;
    }

    // handle special cases
    if (clearValue) {
      // just delete the model if this action requires it
      stateEntities[entityType] = clone(stateEntities[entityType]);
      delete(stateEntities[entityType][id]);
    }

    // set the (action) response value if specified
    if (responseProp) {
      let parent = meta;
      for (var i = 0; i < responseProp.length; i++) {
        let key = responseProp[i];
        if (i === responseProp.length - 1) {
          parent[key] = response || true;
        } else {
          parent[key] = parent[key] || {};
          parent = parent[key];
        }
      }
    }

    // dirty parent entity if applicable
    const cancelBubbleUp = bubbleUp === false || actionBubbleUp === false;
    const fetchedBy = meta.fetch && meta.fetch.source;
    if (fetchedBy && !cancelBubbleUp) {
      const fetchedByEntityType = fetchedBy.entityType;
      if (stateEntities[fetchedByEntityType]) {
        const fetchedById = fetchedBy.id;
        const fetchedByEntities = stateEntities[fetchedByEntityType] = clone(stateEntities[fetchedByEntityType]);
        const fetchedBySource = fetchedByEntities[fetchedById];
        if (fetchedBySource) {
          fetchedByEntities[fetchedById] = Array.isArray(fetchedBySource)
            ? fetchedBySource.slice(0)
            : clone(fetchedBySource);
        }
      }
    }

    if (afterReduce) {
      state = afterReduce({ action, id, entities: stateEntities, result, data: meta.data, state: state }, meta) || state;
    }

    if (debug) {
      log(`${actionType} (${id}) handled\n\tprevious state:\n\t`, prevState, '\n\tpost state:\n\t', state, '\n\tresult:\n\t', result, '\n\tentities:\n\t', entities);
    }

    return state;
  }

  // prepare the action types that we'll be looking for
  var handlers = [{
    type: 'FETCH_SUCCESS',
    meta: {
      fetch: {
        success: 'fetched',
        error: undefined,
        pending: undefined,
        _timestamp: 'completedAt'
      },
      action: undefined
    }
  }, {
    // same as FETCH_SUCCESS but if more semantically correct if we're setting manually
    type: 'SET',
    meta: {
      fetch: {
        success: 'set',
        initiatedAt: undefined,
        error: undefined,
        pending: undefined,
        _timestamp: 'completedAt',
      },
      fetchPending: undefined,
      fetched: true
    }
  }, {
    type: 'SET_DATA',
    meta: {}
  }, {
    type: 'DELETE',
    meta: {
      fetch: undefined,
      fetchPending: undefined,
      fetched: undefined,
      _clearValue: true
    }
  }, {
    type: 'FETCH_PENDING',
    meta: {
      fetch: {
        _timestamp: 'initiatedAt',
        pending: true,
        completedAt: undefined,
        success: undefined,
        error: undefined
      }
    }
  }, {
    type: 'FETCH_ERROR',
    meta: {
      _clearValue: true,
      fetch: {
        _timestamp: 'completedAt',
        success: undefined,
        pending: undefined
      },
      _responseProp: ['fetch', 'error']
    }
  }, {
    type: 'ACTION_ERROR',
    meta: {
      _responseProp: ['action', 'error'],
      action: {
        _replace: true,
        id: '$actionId',
        _timestamp: 'completedAt',
      }
    }
  }, {
    type: 'ACTION_PENDING',
    meta: {
      action: {
        _replace: true,
        id: '$actionId',
        pending: true,
        _timestamp: 'initiatedAt'
      }
    }
  }, {
    type: 'ACTION_SUCCESS',
    meta: {
      _responseProp: ['action', 'success'],
      action: {
        _replace: true,
        id: '$actionId',
        _timestamp: 'completedAt',
      }
    }
  }, {
    type: 'ACTION_CLEAR',
    meta: {
      action: {
        _delete: true
      }
    }
  }, {
    type: 'DATA',
    meta: {}
  }].map(function (data) {
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
        const options = handlers[i][1];
        const payload = action.payload;
        const entities = payload.entities;
        const response = payload.response;
        const result = payload.result;
        const bubbleUp = payload.bubbleUp;
        const id = (payload.id === false ? NO_ID : payload.id) || result;
        const actionId = payload.actionId;
        const meta = options.meta;
        const data = meta._data ? payload : payload.data;

        return update({
          state,
          action,
          id,
          response,
          result,
          entities,
          data,
          actionBubbleUp: bubbleUp,
          meta,
          actionId,
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

// things we don't want to end up in the meta object
var metaKeys = ['_timestamp', '_clearValue', '_responseProp', '_replace', '_replaceData', '_delete'];
function mergeMeta (newMeta, oldMeta, options) {
  if (newMeta._delete) {
    return undefined;
  }
  const meta = newMeta._replace ? clone(newMeta) : clone(oldMeta, newMeta);
  Object.keys(meta).forEach(function (key) {
    let value = meta[key];
    if (key === '_timestamp') {
      meta[value] = options.timestamp;
    } else if (metaKeys.indexOf(key) >= 0) {
      return;
    } else if (typeof value === 'object') {
      value = meta[key] = mergeMeta(value, oldMeta ? oldMeta[key] : undefined, options);
    } else if (value === '$actionId') {
      meta[key] = options.actionId || true;
    }

    if (typeof value === 'undefined') {
      delete meta[key];
    }
  });
  metaKeys.forEach(function (key) {
    delete meta[key];
  });
  return meta;
}

function updateEntityModels (values, entities, primaryId, primaryEntityType, fetchData) {
  const rtn = clone(entities);
  const _meta = rtn._meta = clone(entities._meta);
  for (let entityType in values) {
    if (values.hasOwnProperty(entityType)) {
      rtn[entityType] = clone(rtn[entityType], values[entityType]);
      if (fetchData) {
        var entitiesMeta = _meta[entityType] = clone(_meta[entityType]);
        for (var id in values[entityType]) {
          if (id !== primaryId || entityType !== primaryEntityType) {
            entitiesMeta[id] = clone(entitiesMeta[id], { fetch: fetchData } );
          }
        }
      }
    }
  }
  return rtn;
}

function clone () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift({});
  return Object.assign.apply(Object, args);
}

export default reducer;
