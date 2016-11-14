'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = modelProvider;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _commonUtil = require('./common-util');

var _model2 = require('./model');

var _model3 = _interopRequireDefault(_model2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
function modelProvider(_Component, options) {
  if (!_Component) {
    throw new Error('Undefined modelProvider component');
  }

  // organize up our model and collection requirements
  var entitiesProp = options.entitiesProp || 'entities';
  var _models = [];
  if (options.id) {
    _models.push(organizeProps('modelProp', 'model', 'idProp', 'id', options));
  } else if (options.models) {
    for (var i = 0; i < options.models.length; i++) {
      var _model = options.models[i];
      _models.push(organizeProps('modelProp', 'model', 'idProp', 'id', _model));
    }
  }

  // optimize for deep fetching
  _models.forEach(function (source) {
    var data = source.fetchOptions;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (typeof data[key] === 'string') {
          data[key] = data[key].split('.');
        }
      }
    }
  });

  function getModelId(props, options) {
    var id = options.id;
    if (typeof id === 'function') {
      return id(props);
    } else {
      return (0, _commonUtil.deepPropValue)(id, props);
    }
  }

  function getModelData(id, props, options) {
    // if a model is provided directly, we short circuit
    if (props[options.propName]) {
      return props[options.propName];
    }
    var entities = props[entitiesProp];
    // gracefully handle the parent state
    entities = entities && (entities.entities || entities);
    if (entities) {
      var entityModels = entities[options.entityType];
      return entityModels && entityModels[id];
    }
  }

  function maybeFetchModels(props) {
    var _this = this;

    _models.forEach(function (options) {
      if (options.fetchProp) {
        (function () {
          var id = getModelId(props, options);
          var modelData = getModelData(id, props, options);
          if (!modelData && (!_this.state || !_this.state._fetched || !_this.state._fetched[id])) {
            var model = new _model3.default(Object.assign({}, options, {
              id: id,
              entities: props[entitiesProp]
            }));
            if (model.canBeFetched()) {
              fetchModel(id, props, options);
              _this.setState(function (state) {
                state._fetched = state._fetched || {};
                state._fetched[id] = true;
                return state;
              });
            }
          }
        })();
      }
    });
  }

  function fetchModel(id, props, options) {
    var fetchOptions = {};
    var fetchOptionsDef = options.fetchOptions;
    for (var key in fetchOptionsDef) {
      if (fetchOptionsDef.hasOwnProperty(key)) {
        fetchOptions[key] = (0, _commonUtil.deepPropValue)(fetchOptionsDef[key], props);
      }
    }
    props[options.fetchProp](id, fetchOptions);
  }

  return _react2.default.createClass({
    componentWillMount: function componentWillMount() {
      maybeFetchModels.call(this, this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(props) {
      maybeFetchModels.call(this, props, this.props);
    },
    render: function render() {
      var props = Object.assign({}, this.props);
      _models.forEach(function (options) {
        var id = getModelId(props, options);
        var modelOptions = Object.assign({}, options, {
          id: id,
          entities: props[entitiesProp]
        });
        var model = new _model3.default(modelOptions);
        props[options.idPropName] = id;
        props[options.propName] = model;
      });

      return _react2.default.createElement(_Component, props, props.children);
    }
  });
}

function organizeProps(propNameKey, propNameDefault, idNameKey, idNameDefault, options) {
  (0, _commonUtil.checkRequiredOptions)(['id', 'entityType'], options);
  var id = options.id;
  return {
    id: typeof id === 'string' ? id.split('.') : id,
    entityType: options.entityType,
    propName: options[propNameKey] || propNameDefault,
    idPropName: options[idNameKey] || idNameDefault,
    fetchProp: options.fetchProp,
    fetchOptions: Object.assign({}, options.fetchOptions)
  };
}