import React from 'react';
import { deepPropValue, checkRequiredOptions } from './common-util';
import Model from './model';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
function modelProvider (_Component, options) {
  if (!_Component) {
    throw new Error('Undefined modelProvider component');
  }

  // organize up our model and collection requirements
  const entitiesProp = options.entitiesProp || 'entities';
  const _models = [];
  if (options.id) {
    _models.push(organizeProps('modelProp', 'model', 'idProp', 'id', false, options));
  } else if (options.models) {
    for (let i = 0; i < options.models.length; i++) {
      let _model = options.models[i];
      _models.push(organizeProps('modelProp', 'model', 'idProp', 'id', false, _model));
    }
  }
  if (options.collections) {
    for (let i = 0; i < options.collections.length; i++) {
      let _collection = options.collections[i];
      _models.push(organizeProps('collectionProp', 'collection', true, _collection));
    }
  }

  // optimize for deep fetching
  _models.forEach(function (source) {
    const data = source.fetchOptions;
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (typeof data[key] === 'string') {
          data[key] = data[key].split('.');
        }
      }
    }
  });

  function getModelId (props, options) {
    const id = options.id;
    if (typeof id === 'function') {
      return id(props);
    } else {
      return deepPropValue(id, props);
    }
  }

  function getModelData (id, props, options) {
    // if a model is provided directly, we short circuit
    if (props[options.propName]) {
      return props[options.propName];
    }
    let entities = props[entitiesProp];
    // gracefully handle the parent state
    entities = entities && (entities.entities || entities);
    if (entities) {
      const domainModels = entities[options.domain];
      return domainModels && domainModels[id];
    }
  }

  function maybeFetchModels (props) {
    _models.forEach(function(options) {
      if (options.fetchProp) {
        const id = getModelId(props, options);
        const modelData = getModelData(id, props, options);
        if (!modelData) {
          fetchModel(id, props, options);
        }
      }
    });
  }

  function fetchModel (id, props, options) {
    const fetchOptions = {};
    const fetchOptionsDef = options.fetchOptions;
    for (var key in fetchOptionsDef) {
      if (fetchOptionsDef.hasOwnProperty(key)) {
        fetchOptions[key] = deepPropValue(fetchOptionsDef[key], props);
      }
    }
    props[options.fetchProp](id, fetchOptions);
  }

  return React.createClass({
    componentWillMount () {
      maybeFetchModels(this.props);
    },

    componentWillReceiveProps (props) {
      maybeFetchModels(props, this.props);
    },

    render () {
      const props = Object.assign({}, this.props);
      _models.forEach((options) => {
        const id = getModelId(props, options);
        const modelOptions = {
          id: id,
          domain: options.domain,
          entities: props[entitiesProp]
        };
        const model = new Model(modelOptions);
        props[options.idPropName] = model;
      });

      return React.createElement(_Component, props, props.children);
    }
  });
}

function organizeProps (propNameKey, propNameDefault,
    idNameKey, idNameDefault, isCollection, options) {
  checkRequiredOptions(['id', 'domain'], options);
  const id = options.id;
  return {
    id: (typeof id === 'string') ? id.split('.') : id,
    domain: isCollection ? `${options.domain}Collection` : options.domain,
    isCollection: isCollection,
    propName: options[propNameKey] || propNameDefault,
    idPropName: options[idNameKey] || idNameDefault,
    fetchProp: options.fetchProp,
    fetchOptions: Object.assign({}, options.fetchOptions)
  };
}

module.exports = {
  modelProvider
};
