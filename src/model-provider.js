import React from 'react';
import { deepPropValue, checkRequiredOptions, logger } from './common-util';
import Model from './model';

const NO_ID = '_noid_';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
export default function modelProvider (options) {
  const debug = options.debug;
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
    if (id === false || id === NO_ID) {
      return NO_ID;
    } else if (typeof id === 'function') {
      return id(props);
    } else if (id) {
      return deepPropValue(id, props);
    }
  }

  function maybeFetchModels (props, prevProps) {
    const self = this;
    const state = this.state;
    _models.forEach((options) => {
      if (options.fetchProp && !props[options.modelProp || 'model']) {
        const id = getModelId(props, options);
        if (id) {
          const prevId = state.fetched[options.fetchProp];
          const isDifferentId = prevId !== id;
          const modelCache = self.state.modelCache;
          const isForceFetchFunction = typeof options.forceFetch === 'function';
          if (isDifferentId || isForceFetchFunction) {
            // we may need to fetch
            const modelOptions = Object.assign({}, options, {
              id: id,
              entities: props[entitiesProp]
            });
            const model = Model.fromCache(modelOptions, modelCache);
            let shouldFetch = model && model.canBeFetched() && !model.fetchError();
            if (!shouldFetch || isForceFetchFunction) {
              // see if we should force it
              shouldFetch = isForceFetchFunction
                ? options.forceFetch(id, model, props, prevProps) : isDifferentId && options.forceFetch;
            }
            if (shouldFetch) {
              if (debug) {
                log(`fetching model data using "${options.fetchProp}" with id value ${id}`);
              }

              Model.clearCache(prevId, options.entityType, modelCache);
              fetchModel(id, props, options);
              state.fetched[options.fetchProp] = id;
            } else if (debug) {
              if (isDifferentId) {
                log(`not fetching model using "${options.fetchProp}"; id changed from ${prevId} to ${id} but data exists in state`);
              }
            }
          } else if (debug) {
            log(`not fetching model using "${options.fetchProp}" because id value has not changed from ${id}`);
          }
        } else if (debug) {
          log(`not fetching model using "${options.fetchProp}" for ${id} because no change in id value`);
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
    const fetchFunc = props[options.fetchProp];
    if (typeof fetchFunc !== 'function') {
      console.error(options.fetchProp); // eslint-disable-line no-console
      throw new Error(`props.${options.fetchProp} is a ${typeof fetchFunc} but should be a function`);
    }
    props[options.fetchProp](id, fetchOptions);
  }

  return function (_Component) {
    if (!_Component) {
      throw new Error('Undefined modelProvider component');
    }

    return React.createClass({
      getInitialState: function () {
        return {
          modelCache: {},
          fetched: {}
        };
      },

      componentWillMount () {
        maybeFetchModels.call(this, this.props);
        triggerIdChanges(undefined, this.props, this.state);
      },

      componentWillReceiveProps (props) {
        maybeFetchModels.call(this, props, this.props);
        triggerIdChanges(this.props, props, this.state);
      },

      render () {
        const props = this.props;
        return React.createElement(_Component, generateProps(props, this.state), props.children);
      }
    });

    function checkForMissingOrChangedIds (oldProps, newProps) {
      return _models.map(function (options) {
        if (!oldProps) {
          return {
            options: options,
            oldId: undefined,
            newId: getModelId(newProps, options)
          };
        }
        const oldId = getModelId(oldProps, options);
        const newId = getModelId(newProps, options);
        if (oldId !== newId) {
          return {
            options: options,
            oldId: undefined,
            newId: getModelId(newProps, options)
          };
        }
      }).filter(function (o) { return o; });
    }

    function triggerIdChanges (oldProps, newProps, state) {
      const changelist = checkForMissingOrChangedIds(oldProps, newProps);
      if (changelist.length > 0) {
        const props = generateProps(newProps, state);
        changelist.forEach(function (data) {
          if (options.onIdChange) {
            const options = data.options;
            const oldId = data.oldId;
            const newId = data.newId;
            options.onIdChange(newId, oldId, props);
          }
        });
      }
    }

    function generateProps (origProps, state) {
      const props = Object.assign({}, origProps);
      const modelCache = state.modelCache;

      _models.forEach((options) => {
        const id = getModelId(props, options);
        if (id) {
          const modelOptions = Object.assign({}, options, {
            id: id,
            entities: props[entitiesProp]
          });
          // reuse the same model object if we can
          let model = Model.fromCache(modelOptions, modelCache);
          setPropValue(props, options.idPropName, id);
          setPropValue(props, options.propName, model);
        }
      });
      return props;
    }
  };
}

function setPropValue (parent, keyParts, value) {
  for (var i = 0; i < keyParts.length; i++) {
    var key = keyParts[i];
    if (i === keyParts.length - 1) {
      parent[key] = value;
    } else {
      if (!parent[key]) {
        parent[key] = {};
      }
      parent = parent[key];
    }
  }
}

function organizeProps (options) {
  checkRequiredOptions(['id', 'entityType'], options);
  const id = options.id;
  return Object.assign({}, options, {
    id: id === false ? NO_ID : ((typeof id === 'string') ? id.split('.') : id),
    entityType: options.entityType,
    propName: (options.modelProp || 'model').split('.'),
    idPropName: (options.idProp || 'id').split('.'),
    fetchProp: options.fetchProp,
    modelClass: options.modelClass || Model,
    fetchOptions: Object.assign({}, options.fetchOptions)
  });
}
