/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or domain state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the domain state object
 */
export default class Model {
  constructor (options) {
    const id = this.id = options.id;
    const domain = this.domain = options.domain;
    let entities = options.entities || {};
    // allow for the root state to be provided as entities object
    this.entities = entities.entities || entities;
    this.options = options;
    this._meta = deepValue(entities, ['_meta', domain, id]) || {};
  }

  data () {
    return this._meta.data;
  }

  /**
   * Return the (optionally formatted) model data
   */
  value () {
    if (!this._formatted) {
      this._formatted = true;
      const options = this.options;
      if (options.schema && options.denormalize) {
        this._formattedData = options.denormalize(
          deepValue(this.entities, [this.domain, this.id]),
          this.entities,
          options.schema
        );
      } else {
        const formatter = options.formatter;
        this._formattedData = formatter
          ? formatter(options)
          : deepValue(this.entities, [this.domain, this.id]);
      }
    }
    return this._formattedData;
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
