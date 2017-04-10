Model
---------------
Anytime the [./model-provider.md](model provider) wrapper React class is used, a Model will be included as a property to be used when rendering.  The Model API can be used to determine the status of fetch requests, retrieve meta data and action response values and more.  It can also be extended to add your own custom functions.

### example
```
  // my react class
  render: function () {
    var model = this.props.model;
    if (model.fetchError()) {
      return <div>fetch error</div>;
    } else if (model.isFetchPending()) {
      return <div>loading...</div>;
    } else {
      var value = model.value();  // this is your model contents
      return (
        <div>
          first name: {value.firstName}
        </div>
      );
    }
  }
```

### API
#### Static Functions
All of the Model instance methods (except `value`) are also available as static functions on the `Model class`.  This is useful if
you have a reference to the `meta` object but not the Model object itself (see (Model Reducer beforeRender/afterRender)[./model-reducer]) for example scenarios.

All of the static methods take the same params as the instance method except the `meta` object is added as the first param.
```
// get the time since fetch for the provided meta object
const timeSinceFetch = Model.timeSinceFetch(meta);
```

#### Model.fromCache
This is a static function on the Model class (options, cache) which will return a model from the `cache` if it exists.  The model
would be placed into cache by using `Model.fromCache` at a previous time.  The model will be returned new if any model data changes.
The `options` are the same as the model constructor with 1 additional `modelClass` optional value that represents the model class object (if something other than this Model).
```javascript
// cache must always be the same object
var cache = {};
var myModel = Model.fromCache({
  id: '1',
  entityType: 'user',
  entities: state
}, cache);
```

#### data
Return any meta data which can be set using the [action creator](./action-creator.md).  This is handy when your model is actually an array and you want to keep track of the total count or other related information.

Note: this will always give you an object so you don't have to do a null check *unless you use the static Model.data(meta) function* - if you do not have any model data you will get `undefined`
```javascript
  render: function () {
    const model = this.props.model;
    const data = model.data();
    const totalRowCount = data.totalRowCount;  // or some other data that would have been set with your action creator
  }
```

#### value
Return the model content or undefined if it does not exist.  ***note*** as long as the mode id exists in the properties, the [model provider](./model-provider.md) will always provide a Model object even if the model content does not exist.  Because of this, the `value` method may return `undefined`;
```javascript
  render: function () {
    const model = this.props.model;
    const value = model.value();
    if (value) {
      // the model has been fetched and loaded
      const firstName = model.firstName;  // or some other data that your model would contain
    }
  }
```

#### wasFetched
Return a `truthy` if the model has been sucessfully fetched.
```javascript
  render: function () {
    const model = this.props.model;
    if (model.wasFetched()) {
      // actual return value { type: 'full', completedAt: _timestamp_, entityType: _entity_type_, id: _model_id_ }
    }
  }
```

#### isFetchPending
Return a `truthy` if the model has an outstanding XHR fetch request.
```javascript
  render: function () {
    const model = this.props.model;
    if (model.isFetchPending()) {
      // actual return value { initiatedAt: _timestamp_ }
      return <div>Loading...</div>;
    }
  }
```

#### fetchError
If a model XHR fetch failed, return the error response.  Otherwise return `undefined`.
```javascript
  render: function () {
    const model = this.props.model;
    const fetchError = model.fetchError();
    if (model.fetchError) {
      return <div>The data could not be fetched</div>;
    }
  }
```

#### isActionPending
Return a `truthy` value if an action XHR is pending (see `createXHRAction` in [./action-creator.md](./action-creator.md).  Optionally the `action id` can be passed as a parameter to only return true if the action being performed matches the provided `action id`.
```javascript
  render: function () {
    const model = this.props.model;
    if (model.isActionPending('update')) {
      // actual return value { id: _action_id_, initiatedAt: _timestamp_ }
      return <div>Updating the model</div>;
    }
  }
```

#### wasActionPerformed
The last action performed, unless cleared, will always be returned.  The return object shape is
```
{
  id: _action id_,
  success: _action response if successful_,
  error: _action response if non 200 status code_
  initiatedAt: _timestamp_
  completedAt: _timestamp_
}
```

#### timeSinceFetch
The number of milis since the model has been fetched (even if error response) or `-1` if the model has not been fetched.  Optionally
a timestamp (`new Date().getTime()`) as a parameter can be provided if you iterating over many models (as a new `Date` instance will be created for each function call otherwise).
```
const milis = model.timeSinceFetch();
// or
const now = new Date().getTime();
const milis = model.timeSinceFetch(now);
```

#### meta
Return some lower level attributes that are used to keep state.  Not normally needed unless you want to know very specific
details about fetch or action details.
```javascript
  render: function () {
    const model = this.props.model;
    const meta = model.meta();
  }
```
