'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or domain state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the domain state object
 */
var Model = function () {
  function Model(options) {
    _classCallCheck(this, Model);

    var id = this.id = options.id;
    var domain = this.domain = options.domain;
    var entities = this.entities = options.entities || {};
    this.options = options;
    this._meta = deepValue(entities, ['_meta', domain, id]) || {};
  }

  /**
   * Return the (optionally formatted) model data
   */


  _createClass(Model, [{
    key: 'data',
    value: function data() {
      if (!this._formatted) {
        this._formatted = true;
        var options = this.options;
        var formatter = options.formatter;
        this._formattedData = formatter ? formatter(options) : deepValue(this.entities, [this.domain, this.id]);
      }
      return this._formattedData;
    }

    /**
     * Return true if the model has been fetched
     */

  }, {
    key: 'wasFetched',
    value: function wasFetched() {
      if (this.data()) {
        return this._meta.fetched ? this._meta.fetched : 'exists';
      }
      return false;
    }

    /**
     * Return a boolean indicating if a model fetch is currently in progress
     */

  }, {
    key: 'isFetchPending',
    value: function isFetchPending() {
      return !!this._meta.fetchPending;
    }

    /**
     * Return a fetch error if one was encountered
     */

  }, {
    key: 'fetchError',
    value: function fetchError() {
      return this._meta.fetchError;
    }

    /**
     * Return a boolean indicating if a model fetch is currently in progress
     * @param {string} id: optinal identifier to see if a specific action is currently in progress
     */

  }, {
    key: 'isActionPending',
    value: function isActionPending(actionId) {
      var meta = this._meta;
      if (meta.actionPending) {
        return actionId ? meta.actionId === actionId : meta.actionId || true;
      }
      return false;
    }

    /**
     * Return true if either a fetch or action is pending
     */

  }, {
    key: 'isPending',
    value: function isPending(id) {
      return this.isFetchPending() || this.isActionPending(id);
    }

    /**
     * If an action was performed and successful, return { id, success, error }.  `success` and `error` will be mutually exclusive and will
     * represent the XHR response payload
     * @paramm {string} id: optional action id to only return true if a specific action was performed
     */

  }, {
    key: 'wasActionPerformed',
    value: function wasActionPerformed(id) {
      var meta = this._meta;
      if (!meta.actionPending && meta.actionId && (!id || id === meta.actionId)) {
        return {
          id: meta.actionId,
          success: meta.actionResponse,
          error: meta.actionError
        };
      }
    }
  }]);

  return Model;
}();

exports.default = Model;


function deepValue(parent, parts) {
  for (var i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}