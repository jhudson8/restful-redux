/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or entityType state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the entityType state object
 */

const NO_ID = '_noid_';

export default class Model {
  constructor (options, value, meta) {
    let entities;
    let id;
    let entityType;
    if (typeof meta !== 'undefined' || typeof value !== 'undefined') {
      if (meta) {
        // (id, value, meta)
        id = options;
        options = {};
      } else {
        // (value, meta)
        meta = value;
        value = options;
        options = {};
        id = value ? determineId(value.id) : NO_ID;
      }
    } else {
      if (value === true) {
        // (value)
        id = NO_ID;
        value = options;
        options = {};
        meta = {};
      } else {
        // (options)
        id = determineId(options.id);
        entities = options.entities;
        if (entities) {
          // allow for root state to be passed
          entities = entities.entities || entities;
        }
        entityType = options.entityType;
        value = deepValue(entities, [entityType, id]);
        meta = deepValue(entities, ['_meta', entityType, id]);
      }
    }

    this.id = id;
    this._entities = entities;
    this._value = value;
    this._options = options;
    this._meta = meta || {};
    this._meta_data = this._meta.data || {};
    this._fetchedInfo = this._meta.fetched ? this._meta.fetched : this._value ? { type: 'set' } : false;
  }

  meta () {
    return this._meta;
  }

  /**
   * Return the (optionally formatted) model data
   */
  value () {
    if (!this._formattedValue) {
      this._formatted = true;
      const options = this._options;
      if (this._value && options.schema && options.denormalize) {
        this._formattedValue = options.denormalize(
          this._value,
          options.schema,
          this._entities
        );
      } else {
        const formatter = options.formatter;
        this._formattedValue = formatter
          ? formatter(options)
          : this._value;
      }
      let arrayEntrySchema = options.arrayEntrySchema;
      let ArrayEntryModel = Model;
      if (arrayEntrySchema && this._formattedValue) {
        if (arrayEntrySchema.model) {
          ArrayEntryModel = arrayEntrySchema.model || Model;
          arrayEntrySchema = arrayEntrySchema.schema;
        }
        this._formattedValue = this._formattedValue.map((data) => {
          return new ArrayEntryModel({
            entities: this._entities,
            id: arrayEntrySchema.getId(data),
            entityType: arrayEntrySchema.key
          });
        });
      }
    }
    return this._formattedValue;
  }
}

var functions = {
  data: function (meta) {
    return (this && this._meta_data) || meta.data;
  },

  /**
   * Return true if the model has been fetched
   */
  wasFetched: function (meta) {
    let rtn = meta.fetch && meta.fetch.success;
    if (!rtn && typeof this.value === 'function' && this.value()) {
      rtn = 'exists';
    }
    return rtn;
  },

  /**
   * Return true if there is not a fetch pending or the model has been sucessfully fetched
   */
  canBeFetched: function (meta) {
    const fetchData = meta.fetch;
    const hasValue = typeof this.value === 'function' && this.value();
    if (fetchData) {
      if (fetchData.pending) {
        return false;
      } else {

        return !(fetchData.success || !!hasValue);
      }
    } else {
      return !hasValue;
    }
  },

  /**
   * Return a boolean indicating if a model fetch is currently in progress
   */
  isFetchPending: function (meta) {
    const fetchData = meta.fetch;
    return fetchData && fetchData.pending && (fetchData.initiatedAt || true) || false;
  },

  /**
   * Return a fetch success result or false
   */
  fetchSuccess: function (meta) {
    const fetchData = meta.fetch;
    return (fetchData && fetchData.success) || false;
  },

  /**
   * Return a boolean indicating if a model fetch is currently in progress
   * @param {string} id: optinal identifier to see if a specific action is currently in progress
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   */
  isActionPending: function (meta, actionId) {
    verifyActionId(actionId);
    const actionData = meta.actions && meta.actions[actionId];
    return (actionData && actionData.pending && actionData) || false;
  },

  /**
   * If an action was performed and successful, return { success, error, pending }.  `success` and `error` will be mutually exclusive and will
   * represent the XHR response payload
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   */
  wasActionPerformed: function (meta, actionId) {
    verifyActionId(actionId);
    const actionData = meta.actions;
    return (actionData && actionData[actionId]) || false;
  },

  /**
   * If an action was performed and is an in error state, return the error response
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   */
  actionError: function (meta, actionId) {
    verifyActionId(actionId);
    const actionData = meta.actions;
    return (actionData && actionData[actionId] && actionData[actionId].error) || false;
  },

  /**
   * If an action was performed and is in success state, return the success response
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   */
  actionSuccess: function (meta, actionId) {
    verifyActionId(actionId);
    const actionData = meta.actions;
    return (actionData && actionData[actionId] && actionData[actionId].success) || false;
  },

  /**
   * Return the number of milis since the last fetch completion (success or error)
   */
  timeSinceFetch: function (meta, currentTime) {
    const fetchTime = (meta.fetch && meta.fetch.completedAt);
    return fetchTime ? (currentTime || new Date().getTime()) - fetchTime : -1;
  }
};

/**
 * Include all defined functions to be included as instance functions as well as static
 * functions that accept `meta` as the 1st parameter
 */
Object.keys(functions).forEach((functionName) => {
  const func = functions[functionName];
  function exec (isModelObject) {
    return function () {
      if (isModelObject) {
        const meta = this._meta;
        if (arguments.length == 0) {
          return func.call(this, meta);
        } else if (arguments.length === 1) {
          // we know we don't have any of these methods with more than 1 arg
          return func.call(this, meta, arguments[0]);
        }
      } else {
        return func.apply(this, arguments);
      }
    };
  }
  Model.prototype[functionName] = exec(true);
  Model[functionName] = exec();
});

/**
 * Return a model from the cache object and create one if one does not exist
 */
Model.fromCache = function (options, cache) {
  const id = determineId(options.id);
  const entityType = options.entityType;
  const ModelClass = options.modelClass || Model;
  let entities = options.entities || {};
  // allow for root state to be provided
  entities = entities.entities || entities;
  const cachedEntities = cache[entityType] = cache[entityType] || {};
  const cachedMeta = cache._meta = cache._meta || {};
  const cachedModels = cachedEntities.__models = cachedEntities.__models || {};

  let cachedModel = cachedModels[id];
  const cachedData = getMetaAndValue(id, cache, entityType);
  const checkData = getMetaAndValue(id, entities, entityType);
  if (!cachedModel || cachedData.meta !== checkData.meta || cachedData.value !== checkData.value) {
    // we need to cache and return a new model
    cachedEntities[id] = checkData.value;
    const cachedMetaEntity = cachedMeta[entityType] = cachedMeta[entityType] || {};
    cachedMetaEntity[id] = checkData.meta;
    cachedModel = new ModelClass(options);
    cachedModels[id] = cachedModel;
  }
  return cachedModel;
};

/**
 * Clear the model referred to by the entity type and id from the cache
 */
Model.clearCache = function (id, entityType, cache) {
  id = determineId(id);
  var metaTypes = deepValue(cache, ['_meta', entityType]);
  if (metaTypes) {
    delete metaTypes[id];
  }
  const entityTypes = cache[entityType];
  if (entityTypes) {
    delete entityTypes[id];
  }
  const models = deepValue(cache, [entityType, '__models']);
  if (models) {
    delete models[id];
  }
};

function determineId (id) {
  return id === false ? NO_ID : id;
}

function getMetaAndValue (id, entities, entityType) {
  return {
    meta: deepValue(entities, ['_meta', entityType, id]) || null,
    value: deepValue(entities, [entityType, id]) || null
  };
}

function deepValue (parent, parts) {
  for (let i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}

function verifyActionId (actionId) {
  if (!actionId) {
    throw new Error('action id must be provided');
  }
}
