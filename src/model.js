/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or entityType state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the entityType state object
 */
export default class Model {
  constructor (options, value) {
    let entities;
    let id;
    let entityType;
    let meta;
    if (value) {
      // (id, value)
      id = options;
      options = undefined;
      meta = value._meta;
      options = {};
    } else {
      // (options)
      id = options.id;
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

function deepValue (parent, parts) {
  for (let i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}
