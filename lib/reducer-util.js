/**
 * Utility method for a consistent fetch pattern.  Return the state if applicable and false otherwise.
 * Options
 * - state: the reducer state
 * - domain: the domain used to isolate the event type names
 * - action: action
 */
export default function (domain) {
  // prepare the action types that we'll be looking for
  var handlers = [{
    state: 'FETCH_SUCCESS',
    wasFetchSuccess: true,
    meta: {
      fetchPending: false
    }
  }, {
    state: 'FETCH_PENDING',
    clearModel: true,
    meta: {
      fetched: false,
      fetchPending: true
    }
  }, {
    state: 'FETCH_ERROR',
    clearModel: true,
    meta: {
      _valueProp: 'fetchError',
      fetched: false,
      fetchPending: false
    }
  }, {
    state: 'ACTION_ERROR',
    meta: {
      _valueProp: 'actionError',
      actionPending: false
    }
  }, {
    state: 'ACTION_PENDING',
    meta: {
      actionPending: true
    }
  }, {
    state: 'ACTION_SUCCESS',
    meta: {
      _valueProp: 'actionResponse',
      actionPending: false
    }
  }, {
    state: 'ACTION_CLEAR'
  }].map(function (data) {
    return [`${domain}_${data.state}`, data];
  });

  return function (state = {}, action) {
    const type = action.type;
    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i][0] === type) {
        // we've got a match
        var options = handlers[i][1];
        const data = parsePayload(action);
        let value = data.value;

        if (!options.wasFetchSuccess) {
          // the value is the meta contents rather than the payload
          value = Object.assign({
            state: options.state
          }, options.meta);

          if (options.state === 'ACTION_CLEAR') {
            // special case: clear out action and state if we have a clear action request
            value = {
              state: undefined,
              actionId: undefined
            }
          } else if (data.actionId) {
            value.actionId = data.actionId;
          }
          if (options.meta && options.meta._valueProp) {
            // handle the custom payload property if applicable
            value[value._valueProp] = typeof data.value === 'undefined' ? true : data.value;
            delete value._valueProp;
          }
        }
        return update(state, data.id, value, !!options.wasFetchSuccess, !!options.clearModel);
      }
    }
    return state;
  }
}

function parsePayload (action) {
  let payload = action.payload;
  function value (key) {
    return (payload.__meta && payload.__meta[key]) || payload[key] || action[key]
  }

  var rtn = {
    id: value('id'),
    actionId: value('actionId')
  };

  if (payload && payload.__meta) {
    payload = Object.assign({}, payload);
    delete payload.__meta;
  }
  rtn.value = payload
  return rtn;
}

function update (state, id, value, wasFetchSuccess, clearModel) {
  var rtn = Object.assign({}, state, {
    index: Object.assign({}, state.index)
  });

  const index = rtn.index;
  const model = index[id] || {};
  const __meta = Object.assign({}, model.__meta, !wasFetchSuccess && value);
  __meta.id = id || __meta.id;
  ['actionId', 'actionResponse'].forEach(function (key) {
    if (wasFetchSuccess || typeof value[key] === 'undefined') {
      delete __meta[key];
    }
  });

  if (wasFetchSuccess) {
    // special case, overwrite the model completely
    delete __meta.state;
    __meta.fetched = 'full';
    __meta.fetchPending = false;
    index[id] = Object.assign({}, value, {
      __meta: __meta
    });

  } else {
    // we're just updating the meta state
    index[id] = Object.assign({}, clearModel ? {} : model, {
      __meta: __meta
    });
  }
  return rtn;
}
