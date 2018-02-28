export interface ActionPerformResponse {
  completedAt?: number; // timestamp when the action was completed
  initiatedAt?: number // timestamp when the action was initiated
  success?: any; // success payload or true if the action was a success
  error?: any; // error payload if the action failed
}

export interface ModelConstructorOptions {
  id?: any; // model id
  entities?: any; // entities object (https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
  entityType: string; // normalized entity type key
  value?: any; // model value
  meta?: any; // any model meta content
}
export interface FormatterOptions {
  id?: any; // the model id
  actionId?: any; // the action id (if applicable)
  entityType: string; // the normalized entity type
}

export type Formatter = (data: any, options: FormatterOptions) => FormatterResponse;

export interface FetchActionOptions {
  id: any; // model id
  url: string; // action url
  params?: any; // fetch params
  formatter?(payload: any, options: FormatterOptions); // format the action payload before dispatch
  schema?: any; // normalizr schema
  replaceModel?: boolean; // `true` if model value should be replaced with response payload
  bubbleUp?: boolean; // `true` if a collection containing this model should be reassigned
  successAction?: any; // action to be dispatch in a success condition
  errorAction?: any; // action to be dispatch in an error condition
  clearAfter?: boolean; // number of miliseconds until the action details should be cleared
}

export interface ActionOptions {
  id: any; // model id
  actionId: any; // action id
  url: string; // action URL
  params?: object; // fetch parameters
  formatter?(payload: any, options: FormatterOptions); // format the action payload before dispatch
  schema?: any; // normalizr schema
  replaceModel?: boolean; // `true` if model value should be replaced with response payload
  bubbleUp?: boolean; // `true` if a collection containing this model should be reassigned
  successAction?: any; // action to be dispatched in a success condition
  errorAction?: any; // action to be dispatched in an error condition
  clearAfter?: boolean; // clear the action results after N milliseconds (optional)
}

export interface ActionCreatorOptions {
  actionPrefix: string, // prefix for all redux action types
  entityType: string, // entity type key for normalized state data shape
  normalize?: boolean, // normalizr function
  bubbleUp?: boolean, // `true` if a collection containing this model should be reassigned
  debug?: boolean; // `true` if additional details should be logged to console
}

export interface ActionCreator {
  createModelDataAction(id: any, data?: any); // return an action payload used to set model data (retrieved using model.data())
  createLocalPutAction(id: any, data: any); // return an action payload used to set the model value (retrieved using model.value())
  createLocalDeleteAction(id: any); // return an action used to delete the model value contents
  createFetchAction(options: FetchActionOptions); // return an action used to fetch model value contents
  createGetAction(options: ActionOptions); // return an action to perform a get XHR request associated with a model
  createPatchction(options: ActionOptions); // return an action to perform a patch XHR request associated with a model
  createPostAction(options: ActionOptions); // return an action to perform a post XHR request associated with a model
  createPutAction(options: ActionOptions); // return an action to perform a put XHR request associated with a model
  createDeleteAction(options: ActionOptions); // return an action to perform a delete XHR request associated with a model
}

export interface BeforeAfterReduceParam {
  id: any; // model id
  action?: string; // the dispatched action
  entities: any; // the entites payload from state
  result?: any; // the request response payload
  data?: any; // any additioal data to be associated with the model
  state: any; // the current state
}

export interface ReducerOptions {
  entityType: string; // the normalizr entity type key
  actionPrefix: string; // a prefix for all redux action type names
  beforeReduce?(options: BeforeAfterReduceParam, meta?: any): any // function used to alter state before the reduce
  afterReduce?(options: BeforeAfterReduceParam, meta?: any): any // function used to alter state after the reduce
  bubbleUp?: boolean; // `true` if a collection containing this model should be reassigned
  debug?: any; // `true` if additional details should be logged to console
}

export interface ModelProviderModelOptions {
  id: any; // the model id.  `false` if N/A, function(props, state), or a string value used to find nested props values (foo.bar)
  entityType: string; // the normalized entity type name (https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
  propName?: any; // the prop name that should be used when setting the model on props (defaults to `model`)
  idPropName?: any; // the prop name that should be used when setting the model id on props (defaults to `id`)
  fetchProp?: any; // the prop name which exposes the fetch function
  modelClass?: any; // optional model class to be instantiated (extends Model)
  fetchOptions?: any; // any additional options that should be passed as the 2nd paramter to the fetch function
  forceFetch?: any; // true to always fetch or function(...) to determine if model should be fetched
  arrayEntrySchema?: any; // normalizr schema for individual objects in the collection
  denormalize?: any; // normalizr `denormalize` function
}

export interface ModelProviderOptions {
  debug?: boolean; // `true` to provide additional console logging
  model?: ModelProviderModelOptions, // model details if there is only a single model
  models?: Array<ModelProviderModelOptions>; // array of model details if multiple models should be provided
  entitiesProp?: string; // the React component `props` name use dto access the `entities` data
  onIdChange?(newId: any, prevId: any, props: any);
}

export type ModelProviderResponse = (component: any) => JSX.Element;

export interface FormatterResponse {
  result?: any; // payload returned from a fetch (https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
  response?: any; // payload returned from an action execution
  entities?: object; // alternate payload returned from a fetch if multiple entities are returned (https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
  bubbleUp?: boolean; // true if a collection containing this model should be reassigned
  actionId?: any; // an action id if it can only be defined at response time
  id?: any; // model id
  data?: object; // any additional data that should be set (retrieved using model.data())
}

export interface ModelCacheOptions {
  id: any; // the model id
  entityType: any; // normalized entity type key
  modelClass?: any; // model class (extends Model) if a new instance should be of type which is something other than Model
  entities?: any; // entities object (https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
}
