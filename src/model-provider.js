import React from 'react';
import { deepPropValue, checkRequiredOptions, logger } from './common-util';
import Model from './model';

const NO_ID = '_noid_';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
export default function modelProvider (_Component, options) {
  if (!_Component) {
    throw new Error('Undefined modelProvider component');
  }

  const debug = options.debug;
  const verbose = debug === 'verbose';
  const log = logger('model-provider');

  // organize up our model and collection requirements
  const entitiesProp = options.entitiesProp || 'entities';
  const _models = [];
  if (options.id || options.id === false) {
    _models.push(organizeProps(options));
  } else if (options.models) {
    for (let i = 0; i < options.models.length; i++) {
      let _model = options.models[i];
      _models.push(organizeProps(_model));
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
    if (id === false) {
      return NO_ID;
    } else if (typeof id === 'function') {
      return id(props);
    } else if (id) {
      return deepPropValue(id, props) || id;
    }
  }

  function maybeFetchModels (props, allowForceFetch) {
    const self = this;
    const state = this.state;
    _models.forEach((options) => {
      if (options.fetchProp && !props[options.modelProp || 'model']) {
        const id = getModelId(props, options);
        if (id) {
          const prevId = state.fetched[options.fetchProp];
          const isDifferentId = prevId !== id;
          const shouldForceFetch = options.forceFetch && allowForceFetch;
          if (isDifferentId) {
            const modelOptions = Object.assign({}, options, {
              id: id,
              entities: props[entitiesProp]
            });
            const modelCache = self.state.modelCache;
            const model = Model.fromCache(modelOptions, modelCache);
            if (model.canBeFetched() || shouldForceFetch) {
              Model.clearCache(prevId, options.entityType, modelCache);
              fetchModel(id, props, options);
              state.fetched[options.fetchProp] = id;
            }
          } else if (verbose) {
            log(`model ${id} is not available but "canBeFetched" returned false`);
          }
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
    if (debug) {
      log(`triggering fetch for model "${id}" using "${options.fetchProp}" prop"`);
    }
    props[options.fetchProp](id, fetchOptions);
  }

  return React.createClass({
    getInitialState: function () {
      return {
        modelCache: {},
        fetched: {}
      };
    },

    componentWillMount () {
      maybeFetchModels.call(this, this.props, true);
    },

    componentWillReceiveProps (props) {
      maybeFetchModels.call(this, props, this.props);
    },

    render () {
      const props = Object.assign({}, this.props);
      const modelCache = this.state.modelCache;

      _models.forEach((options) => {
        const id = getModelId(props, options);
        if (id) {
          const modelOptions = Object.assign({}, options, {
            id: id,
            entities: props[entitiesProp]
          });
          // reuse the same model object if we can
          let model = Model.fromCache(modelOptions, modelCache);
          props[options.idPropName] = id;
          props[options.propName] = model;
        }
      });

      return React.createElement(_Component, props, props.children);
    }
  });
}

function organizeProps (options) {
  checkRequiredOptions(['id', 'entityType'], options);
  const id = options.id;
  return Object.assign({}, options, {
    id: id === false ? NO_ID : ((typeof id === 'string') ? id.split('.') : id),
    entityType: options.entityType,
    propName: options.modelProp || 'model',
    idPropName: options.idProp || 'id',
    fetchProp: options.fetchProp,
    modelClass: options.modelClass || Model,
    fetchOptions: Object.assign({}, options.fetchOptions)
  });
}
