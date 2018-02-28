import {
  ModelCacheOptions,
  ActionPerformResponse
} from './types';
/**
 * Return the model specific utility object
 * @param {object} modelOrDomain: the model object or entityType state object (if model `id` is provided)
 * @param {string} id: the model id if `modelOrDomain` represents the entityType state object
 */
import { ModelConstructorOptions } from './types';

const NO_ID = '_noid_';

export default class Model {
  constructor (options: ModelConstructorOptions) {
    let entities = options.entities;
    const id = determineId(options.id);
    const entityType = options.entityType;

    if (entities) {
      // allow for root state to be passed
      entities = entities.entities || entities;
    }

    const value: any = options.value || deepValue(entities, [entityType, id]);
    const meta: any = options.meta || deepValue(entities, ['_meta', entityType, id]);

    (<any> this).id = id;
    (<any> this)._entities = entities;
    (<any> this)._value = value;
    (<any> this)._options = options;
    (<any> this)._meta = meta || {};
    (<any> this)._meta_data = (<any> this)._meta.data || {};
    (<any> this)._fetchedInfo = (<any> this)._meta.fetched ? (<any> this)._meta.fetched : (<any> this)._value ? { type: 'set' } : false;
  }

  meta (): any {
    return (<any> this)._meta;
  }

  /**
   * Return the (optionally formatted) model data
   */
  value (): any {
    if (!(<any> this)._formattedValue) {
      (<any> this)._formatted = true;
      const options = (<any> this)._options;
      if ((<any> this)._value && options.schema && options.denormalize) {
        (<any> this)._formattedValue = options.denormalize(
          (<any> this)._value,
          options.schema,
          (<any> this)._entities
        );
      } else {
        const formatter = options.formatter;
        (<any> this)._formattedValue = formatter
          ? formatter(options)
          : (<any> this)._value;
      }
      let arrayEntrySchema = options.arrayEntrySchema;
      let ArrayEntryModel = Model;
      if (arrayEntrySchema && (<any> this)._formattedValue) {
        if (arrayEntrySchema.model) {
          ArrayEntryModel = arrayEntrySchema.model || Model;
          arrayEntrySchema = arrayEntrySchema.schema;
        }
        (<any> this)._formattedValue = (<any> this)._formattedValue.map((data) => {
          return new ArrayEntryModel({
            entities: (<any> this)._entities,
            id: arrayEntrySchema.getId(data),
            entityType: arrayEntrySchema.key
          });
        });
      }
    }
    return (<any> this)._formattedValue;
  }

  /**
   * Return metadata associated with this model
   */
  data (): any {
    const meta: any = getMeta(this);
    return meta ? meta.data : undefined;
  }

  /**
   * Return truthy if the model has been fetched (`fetched` if fetched and `set` if used with constructor to set value)
   */
  wasFetched (): boolean {
    const meta: any = getMeta(this);
    let rtn = !!meta.fetch && meta.fetch.success;
    if (!rtn && typeof this.value === 'function' && this.value()) {
      rtn = true;
    }
    return rtn;
  }

  /**
   * Return true if there is not a fetch pending or the model has been sucessfully fetched
   */
  canBeFetched (): boolean {
    const meta: any = getMeta(this);
    const fetchData = meta.fetch;
    const hasValue = typeof this.value === 'function' && this.value();
    if (fetchData) {
      if (fetchData.pending) {
        return false;
      } else {
        return !(fetchData.success || !!hasValue);
      }
    } else {
      return !hasValue;
    }
  }

  /**
   * Return a truthy (timestamp of when the fetch was initiated) if a fetch is pending
   */
  isFetchPending (): number {
    const meta: any = getMeta(this);
    const fetchData = meta.fetch;
    return fetchData && fetchData.pending && fetchData.initiatedAt;
  }

  /**
   * Return a fetch success result or false
   */
  fetchSuccess (): any {
    const meta: any = getMeta(this);
    const fetchData = meta.fetch;
    return (fetchData && fetchData.success) || false;
  }

  /**
   * Return a fetch error result or false
   */
  fetchError (): any {
    const meta: any = getMeta(this);
    const fetchData = meta.fetch;
    return (fetchData && fetchData.error) || false;
  }

  /**
   * Return a truthy (timestamp of action initiation) if the action is pending
   * @param {string} id: optinal identifier to see if a specific action is currently in progress
   * @paramm {string} actionId: action id
   */
  isActionPending (actionId: any): number {
    verifyActionId(actionId);
    const meta: any = getMeta(this);
    const actionData = meta.actions && meta.actions[actionId];
    return actionData && actionData.pending && actionData.initiatedAt;
  }

  /**
   * If an action was performed and successful, return { success, error, pending }.  `success` and `error` will be mutually exclusive and will
   * represent the XHR response payload
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   */
  wasActionPerformed (actionId: any): ActionPerformResponse {
    verifyActionId(actionId);
    const meta: any = getMeta(this);
    const actionData = meta.actions;
    return actionData && actionData[actionId];
  }

  /**
   * If an action was performed and is an in error state, return the error response
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   * @returns the error response payload
   */
  actionError (actionId: any): any {
    verifyActionId(actionId);
    const meta: any = getMeta(this);
    const actionData = meta.actions;
    return (actionData && actionData[actionId] && actionData[actionId].error) || null;
  }

  /**
   * If an action was performed and is in success state, return the success response
   * @paramm {string} actionId: action id to only return true if a specific action was performed
   * @returns the success response payload or true if the response was a success
   */
  actionSuccess (actionId: any): any {
    verifyActionId(actionId);
    const meta: any = getMeta(this);
    const actionData = meta.actions;
    return (actionData && actionData[actionId] && actionData[actionId].success) || null;
  }

  /**
   * Return the number of milis since the last fetch completion (success or error)
   */
  timeSinceFetch (currentTime?: number): number {
    const meta: any = getMeta(this);
    const fetchTime = (meta.fetch && meta.fetch.completedAt);
    return fetchTime ? (currentTime || new Date().getTime()) - fetchTime : -1;
  }

  /**
   * Return a model from the cache object and create one if one does not exist
   */
  static fromCache (options: ModelCacheOptions, cache?: any) {
    if (!cache) {
      return null;
    }

    const id = determineId(options.id);
    const entityType = options.entityType;
    const ModelClass = options.modelClass || Model;
    let entities = options.entities || {};
    // allow for root state to be provided
    entities = entities.entities || entities;
    const cachedEntities = cache[entityType] = cache[entityType] || {};
    const cachedMeta = cache._meta = cache._meta || {};
    const cachedModels = cachedEntities.__models = cachedEntities.__models || {};

    let cachedModel = cachedModels[id];
    const cachedData = getMetaAndValue(id, cache, entityType);
    const checkData = getMetaAndValue(id, entities, entityType);
    if (!cachedModel || cachedData.meta !== checkData.meta || cachedData.value !== checkData.value) {
      // we need to cache and return a new model
      cachedEntities[id] = checkData.value;
      const cachedMetaEntity = cachedMeta[entityType] = cachedMeta[entityType] || {};
      cachedMetaEntity[id] = checkData.meta;
      cachedModel = new ModelClass(options);
      cachedModels[id] = cachedModel;
    }
    return cachedModel;
  }

  /**
   * Clear the model referred to by the entity type and id from the cache
   */
  static clearCache (id: any, entityType: string, cache?: any) {
    if (!cache) {
      return;
    }

    id = determineId(id);
    var metaTypes = deepValue(cache, ['_meta', entityType]);
    if (metaTypes) {
      delete metaTypes[id];
    }
    const entityTypes = cache[entityType];
    if (entityTypes) {
      delete entityTypes[id];
    }
    const models = deepValue(cache, [entityType, '__models']);
    if (models) {
      delete models[id];
    }
  }
}

// allow the following to have static accessors
[
  'data', 'wasFetched', 'canBeFetched', 'isFetchPending', 'fetchSuccess', 'fetchError', 'isActionPending',
  'wasActionPerformed', 'actionError', 'actionSuccess', 'timeSinceFetch'
].forEach(function (key) {
  const func = Model.prototype[key];
  Model[key] = function() {
    const meta = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);
    return func.apply({ __static: { meta }}, args);
  }
});

function determineId (id) {
  return id === false ? NO_ID : id;
}

function getMetaAndValue (id, entities, entityType) {
  return {
    meta: deepValue(entities, ['_meta', entityType, id]) || null,
    value: deepValue(entities, [entityType, id]) || null
  };
}

function deepValue (parent, parts) {
  for (let i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}

function verifyActionId (actionId) {
  if (!actionId) {
    throw new Error('action id must be provided');
  }
}

function getMeta (context) {
  return context._meta ? context._meta : context.__static ? context.__static.meta : undefined;
}
