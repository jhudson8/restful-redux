export interface ActionPerformResponse {
  completedAt?: number;
  success?: any;
  error?: any;
}

export interface ModelConstructorOptions {
  id?: any;
  entities?: any;
  entityType: string;
  value?: any;
  meta?: any;
}

export type Formatter = (data: any) => any;

export interface FetchOptions {
  id?: any;
  actionId?: any;
  url: string;
  params?: object;
  formatter(payload: any, options?: any);
  schema: any;
  replaceModel?: boolean;
  bubbleUp?: boolean;
  successAction?: any;
  errorAction?: any;
  clearAfter?: boolean;
}

export interface ActionCreatorOptions {
  actionPrefix: string,
  entityType: string,
  normalize?: boolean,
  bubbleUp?: boolean,
  debug?: boolean;
}

export interface ActionCreator {
  createModelDataAction(id: any, data?: any);
  createLocalPutAction(id: any, data: any);
  createLocalDeleteAction(id: any);
  createFetchAction(options: FetchOptions);
  createGetAction(options: FetchOptions);
  createPatchction(options: FetchOptions);
  createPostAction(options: FetchOptions);
  createPutAction(options: FetchOptions);
  createDeleteAction(options: FetchOptions);
}

export interface BeforeAfterReduceParam {
  id: any;
  action?: string;
  entities: any;
  result?: any;
  data?: any;
  state: any;
}

export interface ReducerOptions {
  entityType: string;
  actionPrefix: string;
  beforeReduce(options: BeforeAfterReduceParam, meta?: any): any
  afterReduce(options: BeforeAfterReduceParam, meta?: any): any
  bubbleUp?: boolean;
  debug?: any;
}

export interface ModelProviderModelOptions {
  id: any;
  entityType: string;
  propName?: any; // the prop name that should be used when setting the model on props (defaults to `model`)
  idPropName?: any; // the prop name that should be used when setting the model id on props (defaults to `id`)
  fetchProp?: any; // the prop name which exposes the fetch function
  modelClass?: any;
  fetchOptions?: any;
  forceFetch?: any; // true to always fetch or function(...) to determine if model should be fetched
}

export interface ModelProviderOptions {
  debug: boolean;
  model?: ModelProviderModelOptions,
  models?: Array<ModelProviderModelOptions>;
  entitiesProp?: string; // the React component `props` name use dto access the `entities` data
  onIdChange(newId: any, prevId: any, props: any);
}

export type ModelProviderResponse = (element: JSX.Element) => any;
