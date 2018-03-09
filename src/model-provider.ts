import * as React from 'react';
import { deepPropValue, checkRequiredOptions, logger } from './common-util';
import * as createReactClass from 'create-react-class';
import Model from './model';
import { ModelProviderOptions, ModelProviderResponse, ModelProviderModelOptions } from './types';
import * as assign from 'object-assign';

const NO_ID = '_noid_';

/**
 * smart component utility function to ensure a component-specific model will be fetched if it doesn't
 * exist in the store.  A `fetch` prop value is expected to be provided with `mapDispatchToProps`
 * - Component: the "dumb" component
 */
export default function modelProvider (options: ModelProviderOptions): ModelProviderResponse {
  const {
    debug,
    model,
    models,
    entitiesProp ='entities'
  } = options;
  if (!models && !model) {
    throw new Error('either `models` or `model` are required');
  }
  const log = logger('model-provider');

  // organize up our model and collection requirements
  const _models = [];
  if (model) {
    _models.push(organizeProps(model));
  } else {
    for (let i = 0; i < models.length; i++) {
      let _model: any = models[i];
      _models.push(organizeProps(_model));
    }
  }

  // optimize for deep fetching
  _models.forEach(function (source: any) {
    const data = source.fetchOptions;
    if (typeof data === 'object') {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          if (typeof data[key] === 'string') {
            data[key] = data[key].split('.');
          }
        }
      }
    }
  });

  function getModelId (props, options: any) {
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
    const self: any = this;
    const state = self.state;
    _models.forEach((options: ModelProviderModelOptions, index: number) => {
      if (options.fetchProp && !props[options.propName || 'model']) {
        const id = getModelId(props, options);
        if (id) {
          const prevId = state.fetched[index];
          const isDifferentId = prevId !== id;
          const modelCache = self.state.modelCache;
          const isForceFetchFunction = typeof options.forceFetch === 'function';
          if (isDifferentId || isForceFetchFunction) {
            // we may need to fetch
            const modelOptions = assign({}, options, {
              id: id,
              entities: props[entitiesProp]
            });
            const model = Model.fromCache(modelOptions, modelCache);
            const isFetchPending = model && model.isFetchPending();
            const isFetchError = model && model.fetchError();
            const value = model && model.value();
            let shouldFetch = model && !isFetchPending && !isFetchError && !value;
            if (!shouldFetch && !isFetchPending && (!shouldFetch || isForceFetchFunction)) {
              // see if we should force it
              shouldFetch = isForceFetchFunction
                ? options.forceFetch(id, model, props, prevProps) : isDifferentId && options.forceFetch;
            }
            if (shouldFetch) {
              if (debug) {
                log(`fetching model data using "${options.fetchProp}" with id value ${id}`);
              }

              Model.clearCache(prevId, options.entityType, modelCache);
              if (id !== undefined && options.entityType) {
                // seed our state so a model will show up in the props
                const meta = state.modelCache._meta = state.modelCache._meta || {};
                const entities = meta[options.entityType] = meta[options.entityType] || {};
                entities[id] = {
                  fetch: {
                    pending: true,
                    initiatedAt: new Date().getTime()
                  }
                };
              }
              fetchModel(id, props, options);
              state.fetched[index] = id;
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
    const fetchOptionsDef = options.fetchOptions;
    let fetchOptions = {};
    if (typeof fetchOptionsDef === 'function') {
      fetchOptions = fetchOptionsDef(props, id);
    } else if (fetchOptionsDef) {
      for (var key in fetchOptionsDef) {
        if (fetchOptionsDef.hasOwnProperty(key)) {
          fetchOptions[key] = deepPropValue(fetchOptionsDef[key], props);
        }
      }
    }

    if (debug) {
      log(`triggering fetch for model "${id}" using "${options.fetchProp}" prop"`);
    }
    const fetchFunc = props[options.fetchProp];
    if (typeof fetchFunc !== 'function') {
      throw new Error(`props.${options.fetchProp} is ${typeof fetchFunc} but should be a function`);
    }
    props[options.fetchProp](id === NO_ID ? false : id, fetchOptions);
  }

  return function (_Component: any) {
    if (!_Component) {
      throw new Error('Undefined modelProvider component');
    }

    return createReactClass({
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
        changelist.forEach(function (data: any) {
          if (data.options.onIdChange) {
            const options = data.options;
            const oldId = data.oldId;
            const newId = data.newId;
            data.options.onIdChange(newId, oldId, props);
          }
        });
      }
    }

    function generateProps (origProps, state) {
      const props = assign({}, origProps);
      const modelCache = state.modelCache;

      _models.forEach((options: ModelProviderModelOptions) => {
        const id = getModelId(props, options);
        if (id) {
          const modelOptions = assign({}, options, {
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

function organizeProps (options: ModelProviderModelOptions): ModelProviderModelOptions {
  checkRequiredOptions(['id', 'entityType'], options);
  const id = options.id;
  return assign({}, options, {
    id: id === false ? NO_ID : ((typeof id === 'string') ? id.split('.') : id),
    entityType: options.entityType,
    propName: (options.propName || 'model').split('.'),
    idPropName: (options.idPropName || 'id').split('.'),
    fetchProp: options.fetchProp,
    modelClass: options.modelClass || Model,
    fetchOptions: typeof options.fetchOptions === 'object' ? assign({}, options.fetchOptions) : options.fetchOptions
  });
}
