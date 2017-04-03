Troubleshooting / FAQ
---------------------

### Model is always undefined in your React component

* Add the `debug: true` option to your model provider
* Remember that if the `id` value does not exist in your component properties - your model will be undefined
  * Make sure the model provided has an `id` value
  * Remember that the `id` value will be treated as a property name (or use `.` for nesting) from the component `props`
  * Make sure you are passing a valid `entities` prop value to your component (should be the same state value that the associated reducer has access to)

### Model exist in your React component but Model.value() is always undefined

* Look at the network tab in your developer's console, do you see the XHR going through and coming back as a 200 - is the expected payload there?
* Did you include the necessary middleware (`redux-effects`, `redux-effects-fetch`, `redux-multi`, `redux-thunk`)
* Make sure your `id` model provider value matches your `id` value in your action creator
* Make sure you included the reducer with the same `entityType` value as the action creator and model provider
* Add the `debug: true` to the action creator and reducer

### Model.wasActionPerformed(_action_id_) always returns false

* Look at the network tab in your developer's console, do you see the XHR going through and coming back as a 200 - is the expected payload there?
* Did you include the necessary middleware (`redux-effects`, `redux-effects-fetch`, `redux-multi`, `redux-thunk`)
* Call the method with 0 parameters to see if you get what you are looking for (this means your action ids don't match up)
* Make sure that the ***action id*** parameter referenced in your React component matches the `actionId` value in your action creator
* Remember that if an `actionId` value is not provided, your model value will be replaced (unless this is a `delete` action)

### More complex model id needs

Here are the different ***modeProvider*** `id` values

```javascript
modelProvider({
  ...
  id: ... // see below
})(Component)

  // always use the value `foo` for the model id
  id: () => 'foo'

  // Conditional id based on React component props
  id: (props) => { return props.foo ? props.abc : props.def; }

  // use the `props.params.foo` value (assuming `props` is the props value provided to your React component)
  id: 'params.foo'

  // use this if you have a model that does not need an id.  ***You can only have a single Model with this id per entity type
  id: false
```

### Getting undefined/false values when using a formatter

If you are using `createFetchAction` make sure the formatter returns an object with one or more of the the following attributes
```javascript
export function fetch (modelId) {
  return myActionCreator.createFetchAction ({
    id: modelId,
    url: '...',
    formatter: function (payload) {
      return {
        // your model vaue (if no `entities`) attribute is defined
        result: ...,
        // any external models that should be applied { foo: '1': { abc: 'def' } } would save an additional model
        // of the `foo` entity type with the id of `1`.  In this case, you can (but don't have to) have `result`
        // equal a normalized value (like an a array of ids)
        entities: ...,
        // any additional values to be available from the model object using `Model.data()` (useful with the array example above)
        data: ...
      };
    }
  })
}
```

If you are using another `create{Post|Patch|Put|Delete}Action` (and do not include `replaceModel: true`)
```javascript
// note: if `replaceModel: true` use the example above (because it will replace model value contents)
Make sure the formatter returns an object with one or more of the the following attributes
export function fetch (modelId) {
  return myActionCreator.createPostAction ({
    id: modelId,
    url: '...',
    formatter: function (payload) {
      return {
        // The `.success` or `.error` value returned when using `Model.wasActionPerformed()`
        response: ...,
        // any additional values to be available from the model object using `Model.data()` (useful with the array example above)
        data: ...
      };
    }
  })
}
```

### No cookies or post body sent when making XHR requests
The `fetch` API will not send cookies by default.  The easy way is to include the provided middleware
```javascript
import { fetchConfigMiddleware } from 'restful-redux';
```

Alternatively, make sure you do the following
* Serialize (JSON.stringify) the `params.body` content
* Set `params.credentials` to be `same-origin` (or whatever value you need here)
* Add the values to the `params.headers` object
  * ***Accept***: `application/json`
  * ***Content-Type***: `application/json;charset=UTF-8`

### What are the `params` options for `create{Post|Patch|Put|Delete}Action`?
[see the Fetch API parameters](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)

### More control over when a model is fetched
As long as a `fetchProp` attribute is set on your model provider (and `props[fetchProp]` is a function) your model will be fetched if it has not been previously.  It will never be fetched again without manual intervention.

To override this behavior, use the `forceFetch` attrubute
```javascript
modelProvider({
  id: ...
  forceFetch: (id, model, props, prevProps) => {
    // fetch if it's been 5 min since the last time we fetched
    const fetched = model.meta().fetched;
    return fetched && fetched.completedAt < new Date().getTime() - 1000 * 60 * 5;
  }
})(MyComponent)
```

### Dynamically delete the model value after an XHR action
Note: `createDeleteAction` will do this automatically.

For non-dynamic behavior, use an action creator with `delete: true`;
```javascript
myActionCreator.createPostAction({
  id: ...,
  url: ...,
  formatter: (payload) => { return payload.foo ? { delete: true } : payload }
});
```
