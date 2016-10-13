import React from 'react';
import { deepPropValue } from './common-util';
import modelUtil from './model-util';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 * - options
 *   * models: store key used for getting model data (signature: {_models_: {index: {...models}}})
 */
export function modelFetcher (_Component, options) {
  // sanity check required fields
  ['id', 'models'].forEach(function (key) {
    if (!options[key]) {
      throw new Error('missing "' + key + '" options value');
    }
  });
  if (!_Component) {
    throw new Error('Undefined modelFetcher component');
  }

  // property name representing the model identifier with nesting using ".";  e.g. "params.id"
  const id = options.id.split('.');
  // property name representing the object containing all models keyed by id
  const models = options.models.split('.');
  // property name used to pass the model object to the "real" component
  const modelProp = options.modelProp || 'model';
  // property name used to pass the actual id value to the "real" component
  const idProp = options.idProp || 'id';
  // property name used to fetch the model data
  const fetchProp = options.fetchProp || 'fetch';
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

  function getModel (id, props) {
    const model = props[modelProp];
    if (model) {
      return model;
    }
    const _models = deepPropValue(models, props);
    if (_models) {
      return _models.index && _models.index[id] || _models[id];
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
      const model = getModel(_id, props);
      if (!model) {
        // we just mounted so if we don't have a model, fetch it
        fetchModel(_id, props);
      }
    },

    componentWillReceiveProps (props) {
      const _id = deepPropValue(id, props);
      const prevId = deepPropValue(id, this.props);

      if (prevId && prevId !== _id) {
        // the id changed to fetch the new model
        fetchModel(_id, props);
      }
    },

    render () {
      const props = Object.assign({}, this.props);
      const _id = deepPropValue(id, props);
      props[idProp] = _id;
      props[modelProp] = modelUtil(getModel(_id, props));

      return React.createElement(_Component, props, props.children);
    }
  });
}
