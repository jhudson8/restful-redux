'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or entityType state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the entityType state object
 */
var Model = function () {
  function Model(options) {
    _classCallCheck(this, Model);

    var id = this.id = options.id;
    var entityType = this.entityType = options.entityType;
    var entities = options.entities || {};
    // allow for the root state to be provided as entities object
    this.entities = entities.entities || entities;
    this.options = options;
    this._meta = deepValue(this.entities, ['_meta', entityType, id]) || {};
  }

  _createClass(Model, [{
    key: 'data',
    value: function data() {
      return this._meta.data;
    }

    /**
     * Return the (optionally formatted) model data
     */

  }, {
    key: 'value',
    value: function value() {
      if (!this._formatted) {
        this._formatted = true;
        var options = this.options;
        if (options.schema && options.denormalize) {
          this._formattedData = options.denormalize(deepValue(this.entities, [this.entityType, this.id]), this.entities, options.schema);
        } else {
          var formatter = options.formatter;
          this._formattedData = formatter ? formatter(options) : deepValue(this.entities, [this.entityType, this.id]);
        }
      }
      return this._formattedData;
    }

    /**
     * Return true if the model has been fetched
     */

  }, {
    key: 'wasFetched',
    value: function wasFetched() {
      if (this.value()) {
        return this._meta.fetched ? this._meta.fetched : 'exists';
      }
      return false;
    }
  }, {
    key: 'canBeFetched',
    value: function canBeFetched() {
      return !(this._meta.fetchPending || this._meta.fetchError || this._meta.fetched || this.value());
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
