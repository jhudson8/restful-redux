/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or domain state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the domain state object
 */
export default function (modelOrDomain, id) {
  const model = id ? modelOrDomain && modelOrDomain.index && modelOrDomain.index[id] : modelOrDomain;
  const meta = (model && model.__meta) || {};

  return {
    data: model,

    /**
     * Return true if the model has been fetched
     */
    fetched: function () {
      return meta.fetched && model;
    },

    /**
     * Return a boolean indicating if a model fetch is currently in progress
     */
    isFetchPending: function () {
      return !!meta.fetchPending;
    },

    /**
     * Return a fetch error if one was encountered
     */
    fetchError: function () {
      return meta.fetchError;
    },

    /**
     * Return a boolean indicating if a model fetch is currently in progress
     * @param {string} id: optinal identifier to see if a specific action is currently in progress
     */
    isActionPending: function (id) {
      if (meta.actionPending) {
        return id ? meta.actionId === id : (meta.actionId || true);
      }
      return false;
    },

    /**
     * Return true if either a fetch or action is pending
     */
    isPending: function (id) {
      return isFetchPending() || isActionPending(id);
    },

    /**
     * If an action was performed and successful, return { id, success, error }.  `success` and `error` will be mutually exclusive and will
     * represent the XHR response payload
     * @paramm {string} id: optional action id to only return true if a specific action was performed
     */
    actionPerformed: function (id) {
      if (!meta.actionPending && meta.actionId && (!id || id === meta.actionId)) {
        return {
          id: meta.actionId,
          success: meta.actionResponse,
          error: meta.actionError
        };
      }
    }
  };
}
