'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  (0, _commonUtil.checkRequiredOptions)(['entityType', 'actionPrefix'], options);

  var entityType = options.entityType,
      actionPrefix = options.actionPrefix,
      _options$fetchType = options.fetchType,
      fetchType = _options$fetchType === undefined ? 'full' : _options$fetchType;


  function update(_ref) {
    var state = _ref.state,
        id = _ref.id,
        result = _ref.result,
        entities = _ref.entities,
        meta = _ref.meta,
        clear = _ref.clear,
        type = _ref.type;

    // make sure our necessary data structure is initialized
    var stateEntities = state.entities || {};
    stateEntities._meta = stateEntities._meta || {};

    // make sure we are immutable
    state = Object.assign({}, state);
    if (result) {
      // our collection entity value is the results
      entities = entities || {};
      entities[entityType] = entities[entityType] || {};
      entities[entityType][id] = entities[entityType][id] || result;
    }
    state.entities = Object.assign({}, entities ? updateEntityModels(entities, stateEntities) : stateEntities);
    state.entities._meta = Object.assign({}, state.entities._meta);

    // update the metadata
    stateEntities = state.entities;
    var metaDomain = Object.assign({}, stateEntities._meta[entityType]);
    stateEntities._meta[entityType] = metaDomain;
    var _data = metaDomain[id] && metaDomain[id].data;
    var _meta = meta;
    meta = Object.assign({}, metaDomain[id], meta);

    // handle special `data` meta attribute
    if (_meta.data === false) {
      delete meta.data;
    } else if (_data || meta.data) {
      meta.data = _data = Object.assign({}, _data, meta.data);
      for (var _key in _data) {
        if (_data.hasOwnProperty(_key) && typeof _data[_key] === 'undefined') {
          delete _data[_key];
        }
      }
    }

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
      delete stateEntities[entityType][id];
    }

    return state;
  }

  // prepare the action types that we'll be looking for
  var handlers = [createMeta({
    type: 'FETCH_SUCCESS',
    meta: {
      fetched: fetchType,
      _timestamp: 'fetch'
    }
  }, ['fetchPending', 'fetchError', 'actionId', 'actionPending', 'actionSuccess', 'actionError', 'actionResponse']), createMeta({
    // same as FETCH_SUCCESS but if more semantically correct if we're setting manually
    type: 'SET',
    meta: {
      fetched: fetchType,
      _timestamp: 'fetch'
    }
  }, ['fetchPending', 'fetchError', 'actionId', 'actionPending', 'actionSuccess', 'actionError', 'actionResponse']), createMeta({
    type: 'FETCH_PENDING',
    meta: {
      fetchPending: true
    }
  }, ['fetched', 'fetchTimestamp']), createMeta({
    type: 'FETCH_ERROR',
    clear: true,
    meta: {
      _responseProp: 'fetchError',
      fetched: false
    }
  }, ['fetchPending']), createMeta({
    type: 'ACTION_ERROR',
    meta: {
      _responseProp: 'actionError'
    }
  }, ['actionPending']), createMeta({
    type: 'ACTION_PENDING',
    meta: {
      actionPending: true
    }
  }, ['actionTimestamp', 'actionError', 'actionResponse']), createMeta({
    type: 'ACTION_SUCCESS',
    meta: {
      _responseProp: 'actionResponse',
      _timestamp: 'action',
      actionSuccess: true
    }
  }, ['actionPending', 'actionError']), createMeta({
    type: 'ACTION_CLEAR',
    meta: {}
  }, ['actionId', 'actionPending', 'actionTimestamp', 'actionError', 'actionResponse', 'actionSuccess', 'actionTimestamp']), { type: 'DATA' }].map(function (data) {
    return [actionPrefix + '_' + data.type, data];
  });

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var type = action.type;
    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i][0] === type) {
        // we've got a match
        var _options = handlers[i][1];
        var payload = action.payload;
        var entities = payload.entities;
        var response = payload.response;
        var result = payload.result;
        var id = payload.id || result;
        var actionId = payload.actionId;
        var meta = Object.assign({}, _options.meta);
        var responseProp = meta._responseProp;
        var timestampProp = meta._timestamp;

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
          meta[timestampProp + 'Timestamp'] = new Date().getTime();
        }

        return update({
          state: state,
          id: id,
          result: result,
          entities: entities,
          meta: meta,
          clear: _options.clear,
          type: _options.type
        });
      }
    }
    return state;
  };
};

var _commonUtil = require('./common-util');

function createMeta(props, clearProps) {
  clearProps.forEach(function (propType) {
    props.meta[propType] = undefined;
  });
  return props;
}

/**
 * Utility method for a consistent fetch pattern.  Return the state if applicable and false otherwise.
 * Options
 * - state: the reducer state
 * - entityType: the entityType used to isolate the event type names
 * - action: action
 */


function updateEntityModels(values, entities) {
  var rtn = Object.assign({}, entities);
  var index = {};
  for (var entityType in values) {
    if (values.hasOwnProperty(entityType)) {
      rtn[entityType] = Object.assign({}, rtn[entityType], values[entityType]);
    }
  }
  return rtn;
}