import { checkRequiredOptions, logger } from './common-util';

const NO_ID = '_noid_';

function util (origState) {
  var state = origState;
  var entities = Object.assign({}, state);
  if (entities.entities) {
    state = entities;
    entities = state.entities = Object.assign({}, state.entities);
  } else {
    state = entities;
  }
  entities._meta = Object.assign({}, entities._meta);
  var operations = {};

  function operation (entityType, callback) {
    var ops = operations[entityType];
    if (!ops) {
      ops = operations[entityType] = [];
    }
    callback(ops);
  }

  var rtn = {
    delete: function (id, entityType) {
      operation(entityType, function (ops) {
        ops.push({
          action: 'delete',
          id: id
        });
      });
      return rtn;
    },
    replace: function (id, entityType, value, data) {
      operation(entityType, function (ops) {
        ops.push({ action: 'replace', id: 'id', value: value, data: data });
      });
      return rtn;
    },
    // clear out all entities
    clear: function (entityType) {
      operation('_global', function (ops) {
        ops.push({
          action: 'delete',
          entityType: entityType
        });
      });
      return rtn;
    },
    // iterate through each entityType
    iterate: function (entityType, callback) {
      var modelEntities = entities[entityType];
      var modelMeta = entities._meta && entities._meta[entityType] || {};
      if (modelEntities) {
        for (var id in modelEntities) {
          callback.call(rtn, id, modelEntities[id], modelMeta && modelMeta[id]);
        }
      }
      return rtn;
    },
    execute: function () {
      var changeMade = false;
      // entity specific operations
      for (var entityType in operations) {
        var entityOperations = operations[entityType];
        if (entityType === '_global') {
          // global operations
          entityOperations.forEach(function (operation) {
            var action = operation.action;
            var entityType = operation.entityType;
            if (action === 'delete') {
              changeMade = true;
              delete entities[entityType];
              delete entities._meta[entityType];
            }
          });
        } else {
          // entity specific operaiont
          var _entities = entities[entityType] = Object.assign({}, entities[entityType]);
          var _meta = entities._meta[entityType] = Object.assign({}, entities._meta[entityType]);
          entityOperations.forEach(function (operation) {
            var id = operation.id;
            var action = operation.action;
            var value = operation.value;
            var data = operation.data;

            if (action === 'delete') {
              delete _entities[id];
              delete _meta[id];
              changeMade = true;
            } else if (action === 'replace') {
              if (value) {
                _entities[id] = value;
              }
              if (data) {
                _meta[id] = Object.assign({}, _meta[id], { data: data });
              }
              changeMade = true;
            }
          });
        }
      }
      if (changeMade) {
        return state;
      } else {
        return origState;
      }
    }
  };
  return rtn;
}

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
    meta,
    clear,
    actionType
  }) {
    // make sure our necessary data structure is initialized
    let stateEntities = Object.assign({}, state.entities);
    state = Object.assign({}, state, { entities: stateEntities});
    stateEntities._meta = Object.assign({}, stateEntities._meta);

    if (beforeReduce) {
      var context = util(state.entities);
      beforeReduce(action, util, { action, id, entities, value: result });
      state.entities = context.execute();
    }

    if (result) {
      // our collection entity value is the results
      stateEntities[entityType] = entities ? Object.assign({}, entities[entityType]) : {};
      stateEntities[entityType][id] = result;
    } else if (entities) {
      result = entities[entityType][id];
    }

    if (entities) {
      state.entities = stateEntities = updateEntityModels(entities, stateEntities, id, entityType, meta.fetched);
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

    // clear out any undefined fields
    for (var key in meta) {
      if (meta.hasOwnProperty(key) && typeof meta[key] === 'undefined') {
        delete meta[key];
      }
    }

    if (clear) {
      // just delete the model if this action requires it
      stateEntities[entityType] = Object.assign({}, stateEntities[entityType]);
      delete(stateEntities[entityType][id]);
    }

    // dirty parent entity if applicable
    const fetchedBy = meta.fetchedBy;
    if (fetchedBy) {
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
      context = util(state.entities);
      afterReduce(action, context, action, util, { action, id, entities, value: result });
      state.entities = context.execute();
    }

    if (debug) {
      log(`${actionType} (${id}) handled\n\tprevious state:\n\t`, state, '\n\tpost state:\n\t', state, '\n\tresult:\n\t', result, '\n\tentities:\n\t', entities);
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
      'actionError', 'actionResponse']),
    createMeta({
      // same as FETCH_SUCCESS but if more semantically correct if we're setting manually
      type: 'SET',
      meta: {
        fetched: true
      }
    }, ['fetchPending', 'fetchError', 'actionId', 'actionPending', 'actionSuccess',
      'actionError', 'actionResponse']),
    createMeta({
      type: 'FETCH_PENDING',
      meta: {
        fetchPending: true
      }
    }, ['fetched']),
    createMeta({
      type: 'FETCH_ERROR',
      clear: true,
      meta: {
        _responseProp: 'fetchError',
        fetched: false,
      }
    }, ['fetchPending']),
    createMeta({
      type: 'ACTION_ERROR',
      meta: {
        _responseProp: 'actionError'
      }
    }, ['actionPending']),
    createMeta({
      type: 'ACTION_PENDING',
      meta: {
        actionPending: true,
      }
    }, ['actionTimestamp', 'actionError', 'actionResponse']),
    createMeta({
      type: 'ACTION_SUCCESS',
      meta: {
        _responseProp: 'actionResponse',
        actionSuccess: true
      }
    }, ['actionPending', 'actionError']),
    createMeta({
      type: 'ACTION_CLEAR',
      meta: {}
    }, ['actionId', 'actionPending', 'actionTimestamp', 'actionError', 'actionResponse',
      'actionSuccess', 'actionTimestamp']),
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
        const options = handlers[i][1];
        const payload = action.payload;
        const entities = payload.entities;
        const response = payload.response;
        const result = payload.result;
        const id = (payload.id === false ? NO_ID : payload.id) || result;
        const actionId = payload.actionId;
        const meta = Object.assign({}, options.meta);
        const responseProp = meta._responseProp;

        if (meta.fetched) {
          meta.fetched = {
            type: 'full',
            timestamp: new Date().getTime(),
            entityType: entityType,
            id: id
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

        return update({
          state,
          action,
          id,
          result,
          entities,
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
reducer.util = util;

function createMeta (props, clearProps) {
  clearProps.forEach(function (propType) {
    props.meta[propType] = undefined;
  });
  return props;
}

function updateEntityModels (values, entities, primaryId, primaryEntityType, fetchData) {
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
            entitiesMeta[id] = Object.assign({ fetched: { type: 'normalized' } }, entitiesMeta[id], { fetchedBy: fetchData });
          }
        }
      }
    }
  }
  return rtn;
}

// allow multiple reducers to be joined together
reducer.join = function(reducers) {
  return function (state, action) {
    for (var i = 0; i < reducers.length; i ++) {
      state = reducers[i](state, action);
    }
    return state;
  };
};

export default reducer;
