/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or entityType state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the entityType state object
 */

const NO_ID = '_noid_';

export default class Model {
  constructor (options, value) {
    let entities;
    let id;
    let entityType;
    let meta;
    if (value) {
      // (id, value)
      id = determineId(options);
      options = undefined;
      meta = value._meta;
      options = {};
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

    this.id = id;
    this._entities = entities;
    this._value = value;
    this._options = options;
    this._meta = meta || {};
    this._metadata = this._meta.data || {};
  }

  data () {
    return this._metadata;
  }

  /**
   * Return the (optionally formatted) model data
   */
  value () {
    if (!this._formattedValue) {
      this._formatted = true;
      const options = this._options;
      if (options.schema && options.denormalize) {
        this._formattedValue = options.denormalize(
          this._value,
          this._entities,
          options.schema
        );
      } else {
        const formatter = options.formatter;
        this._formattedValue = formatter
          ? formatter(options)
          : this._value;
      }
    }
    return this._formattedValue;
  }

  /**
   * Return true if the model has been fetched
   */
  wasFetched () {
    if (this.value()) {
      return this._meta.fetched ? this._meta.fetched : 'exists';
    }
    return false;
  }

  canBeFetched () {
    return !(this._meta.fetchPending || this._meta.fetchError || this._meta.fetched || this.value());
  }

  /**
   * Return a boolean indicating if a model fetch is currently in progress
   */
  isFetchPending () {
    return !!this._meta.fetchPending;
  }

  /**
   * Return a fetch error if one was encountered
   */
  fetchError () {
    return this._meta.fetchError;
  }

  /**
   * Return a boolean indicating if a model fetch is currently in progress
   * @param {string} id: optinal identifier to see if a specific action is currently in progress
   */
  isActionPending (actionId) {
    const meta = this._meta;
    if (meta.actionPending) {
      return actionId ? meta.actionId === actionId : (meta.actionId || true);
    }
    return false;
  }

  /**
   * Return true if either a fetch or action is pending
   */
  isPending (id) {
    return this.isFetchPending() || this.isActionPending(id);
  }

  /**
   * If an action was performed and successful, return { id, success, error }.  `success` and `error` will be mutually exclusive and will
   * represent the XHR response payload
   * @paramm {string} id: optional action id to only return true if a specific action was performed
   */
  wasActionPerformed (id) {
    const meta = this._meta;
    if (!meta.actionPending && meta.actionId && (!id || id === meta.actionId)) {
      return {
        id: meta.actionId,
        success: meta.actionResponse,
        error: meta.actionError
      };
    }
  }
}

Model.fromCache = function(options, cache) {
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
