export default function (origState) {
  let state;
  let entities = origState.entities || {};
  const operations = {};
  let operationCount = 0;

  function operation (entityType, callback) {
    operationCount++;
    var ops = operations[entityType];
    if (!ops) {
      ops = operations[entityType] = [];
    }
    callback(ops);
  }

  const rtn = {
    delete: function (id, entityType) {
      operation(entityType, function (ops) {
        ops.push({
          action: 'delete',
          id: id
        });
      });
      return rtn;
    },
    replaceAttributes: function (id, entityType, data) {
      operation(entityType, function (ops) {
        ops.push({
          action: 'replaceAttributes',
          id: id,
          data: data
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
      const modelEntities = entities[entityType];
      const modelMeta = entities._meta && entities._meta[entityType] || {};
      if (modelEntities) {
        for (let id in modelEntities) {
          callback.call(rtn, id, modelEntities[id], modelMeta && modelMeta[id]);
        }
      }
      return rtn;
    },
    execute: function () {
      if (operationCount > 0) {
        state = Object.assign({}, origState, {
          entities: Object.assign({}, origState.entities)
        });
        entities = state.entities;
        entities._meta = Object.assign({}, entities._meta);
      }

      let changeMade = false;
      // entity specific operations
      for (let entityType in operations) {
        const entityOperations = operations[entityType];
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
          // entity specific operation
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
            } else if (action === 'replaceAttributes') {
              if (data.value) {
                _entities[id] = replaceAttributes(_entities[id], data.value);
                changeMade = true;
              }
              if (data.data) {
                _meta[id] = Object.assign({}, _meta[id], { data: replaceAttributes(_meta[id] && _meta[id].data, data.data) });
                changeMade = true;
              }
              if (data.meta) {
                _meta[id] = Object.assign({}, replaceAttributes(_meta[id], data.meta));
                changeMade = true;
              }
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

function replaceAttributes (source, replaceWith) {
  if (!replaceWith) {
    return source;
  }
  source = Object.assign({}, source);
  for (var key in replaceWith) {
    if (replaceWith.hasOwnProperty(key)) {
      var value = replaceWith[key];
      if (typeof value === 'undefined' || value === null) {
        delete source[key];
      } else {
        source[key] = value;
      }
    }
  }
  return source;
}
