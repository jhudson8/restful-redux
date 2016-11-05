import React from 'react';
import { deepPropValue, checkRequiredOptions } from './common-util';
import Model from './model';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
function modelFetcher (_Component, options) {
  checkRequiredOptions(['id', 'domain'], options);

  if (!_Component) {
    throw new Error('Undefined modelFetcher component');
  }

  // property name representing the model identifier with nesting using ".";  e.g. "params.id"
  const id = options.id.split('.');
  // the default domain for the entities reference
  const domain = options.domain;
  // property name used to pass the model object to the "real" component
  const modelProp = options.modelProp || 'model';
  // property name used to pass the actual id value to the "real" component
  const idProp = options.idProp || 'id';
  // property name used to fetch the model data
  const fetchProp = options.fetchProp || 'fetch';
  // prop name used to provide the `entities` state object
  const entitiesProp = options.entitiesProp || 'entities';
  // object of additional data provided when fetching (key is key and value is path to value from props)
  const fetchOptionsData = options.fetchOptions || {};

  // optimize for deep fetching
  for (var key in fetchOptionsData) {
    if (fetchOptionsData.hasOwnProperty(key)) {
      if (typeof fetchOptionsData[key] === 'string') {
        fetchOptionsData[key] = fetchOptionsData[key].split('.');
      }
    }
  }

  function getModelData (id, props) {
    // if a model is provided directly, we short circuit
    if (props[modelProp]) {
      return props[modelProp];
    }
    let entities = props[entitiesProp];
    // gracefully handle the parent state
    entities = entities && (entities.entities || entities);
    if (entities) {
      const domainModels = entities[domain];
      return domainModels && domainModels[id];
    }
  }

  function fetchModel (id, props) {
    const fetchOptions = {};
    for (var key in fetchOptionsData) {
      if (fetchOptionsData.hasOwnProperty(key)) {
        fetchOptions[key] = deepPropValue(fetchOptionsData[key], props);
      }
    }
    props[fetchProp](id, fetchOptions);
  }

  return React.createClass({
    componentWillMount () {
      const props = this.props;
      const _id = deepPropValue(id, props);
      const modelData = getModelData(_id, props);
      if (!modelData) {
        // we just mounted so if we don't have model data, fetch it
        fetchModel(_id, props);
      }
    },

    componentWillReceiveProps (props) {
      const _id = deepPropValue(id, props);
      const prevId = deepPropValue(id, this.props);

      if (prevId && prevId !== _id) {
        var modelData = getModelData(_id, props);
        if (!modelData) {
          // the id changed to fetch the new model
          fetchModel(_id, props);
        }
      }
    },

    render () {
      const props = Object.assign({}, this.props);
      const _id = deepPropValue(id, props);
      props[idProp] = _id;
      props[modelProp] = new Model({
        id: _id,
        domain: options.domain,
        entities: props[entitiesProp]
      });

      return React.createElement(_Component, props, props.children);
    }
  });
}

module.exports = {
  modelFetcher
};
