'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _commonUtil = require('./common-util');

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
function modelFetcher(_Component, options) {
  // sanity check required fields
  ['id', 'domain'].forEach(function (key) {
    if (!options[key]) {
      throw new Error('missing "' + key + '" options value');
    }
  });
  if (!_Component) {
    throw new Error('Undefined modelFetcher component');
  }

  // property name representing the model identifier with nesting using ".";  e.g. "params.id"
  var id = options.id.split('.');
  // the default domain for the entities reference
  var domain = options.domain;
  // property name used to pass the model object to the "real" component
  var modelProp = options.modelProp || 'model';
  // property name used to pass the actual id value to the "real" component
  var idProp = options.idProp || 'id';
  // property name used to fetch the model data
  var fetchProp = options.fetchProp || 'fetch';
  // prop name used to provide the `entities` state object
  var entitiesProp = options.entitiesProp || 'entities';
  // object of additional data provided when fetching (key is key and value is path to value from props)
  var fetchOptionsData = options.fetchOptions || {};

  // optimize for deep fetching
  for (var key in fetchOptionsData) {
    if (fetchOptionsData.hasOwnProperty(key)) {
      if (typeof fetchOptionsData[key] === 'string') {
        fetchOptionsData[key] = fetchOptionsData[key].split('.');
      }
    }
  }

  function getModelData(id, props) {
    // if a model is provided directly, we short circuit
    if (props[modelProp]) {
      return props[modelProp];
    }
    var entities = props[entitiesProp];
    // gracefully handle the parent state
    entities = entities && (entities.entities || entities);
    if (entities) {
      var domainModels = entities[domain];
      return domainModels && domainModels[id];
    }
  }

  function fetchModel(id, props) {
    var fetchOptions = {};
    for (var key in fetchOptionsData) {
      if (fetchOptionsData.hasOwnProperty(key)) {
        fetchOptions[key] = (0, _commonUtil.deepPropValue)(fetchOptionsData[key], props);
      }
    }
    props[fetchProp](id, fetchOptions);
  }

  return _react2.default.createClass({
    componentWillMount: function componentWillMount() {
      var props = this.props;
      var _id = (0, _commonUtil.deepPropValue)(id, props);
      var modelData = getModelData(_id, props);
      if (!modelData) {
        // we just mounted so if we don't have model data, fetch it
        fetchModel(_id, props);
      }
    },
    componentWillReceiveProps: function componentWillReceiveProps(props) {
      var _id = (0, _commonUtil.deepPropValue)(id, props);
      var prevId = (0, _commonUtil.deepPropValue)(id, this.props);

      if (prevId && prevId !== _id) {
        var modelData = getModelData(_id, props);
        if (!modelData) {
          // the id changed to fetch the new model
          fetchModel(_id, props);
        }
      }
    },
    render: function render() {
      var props = Object.assign({}, this.props);
      var _id = (0, _commonUtil.deepPropValue)(id, props);
      props[idProp] = _id;
      props[modelProp] = new _model2.default({
        id: _id,
        domain: options.domain,
        entities: props[entitiesProp]
      });

      return _react2.default.createElement(_Component, props, props.children);
    }
  });
}

module.exports = {
  modelFetcher: modelFetcher
};