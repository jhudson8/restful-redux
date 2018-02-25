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

export interface Model {
  new(options: ModelConstructorOptions);

  id?: any;
  meta(): any;
  value(): any;
  data(): any;
  wasFetched(): boolean;
  canBeFetched(): boolean;
  isFetchPending(): boolean;
  fetchSuccess(): any;
  fetchError(): any;
  isActionPending(actionId: any): boolean;
  wasActionPerformed(actionId: any): ActionPerformResponse;
  actionError(actionId: any): any;
  actionSuccess(actionId: any): any;
  timeSinceFetch(currentTime?: number): number;
}

export type Formatter = (data: any) => any;

export interface FetchOptions {
  id?: any;
  actionId?: any;
  url: string;
  formatter(payload: any, options?: any);
  replaceModel?: boolean;
  bubbleUp?: boolean;
}

export interface ActionCreatorOptions {
  actionPrefix: string,
  entityType: string,
  normalize?: boolean,
  bubbleUp?: boolean,
  debug?: boolean;
}

export interface ActionCreator {
  createFetchAction(idOrUrl: any, urlOrFormatter?: any, formatter?: Formatter);
  createModelDataAction(idOrData: any, data?: any);
  createLocalPutAction(id: any, data: any);
  createLocalDeleteAction(id: any);
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
  propName?: any;
  idPropName?: any;
  fetchProp?: any;
  modelClass?: any;
  fetchOptions?: any;
}

export interface ModelProviderOptions {
  id: any;
  entityType: string;
  debug: boolean;
  entitiesProp?: string;
  modelProp?: string;
  models: Array<ModelProviderModelOptions>;
  onIdChange(newId: any, prevId: any, props: any);
}

export type ModelProviderResponse = (element: JSX.Element) => any;
