Model Provider
---------------
A React class used to auto-fetch and inject Model objects (which wrap your model data) into the React properties.  This of this like a smart (as in smart vs. dumb) component for higher order model association.

### Example
[../examples/01-github-profile-viewer/lib/profile-page/index.js](../examples/01-github-profile-viewer/lib/profile-page/index.js)

```javascript
import { modelProvider } from 'react-redux-model';
import { connect } from 'react-redux';

import CustomerPage from './customer-page';
import { fetch } from './customer-actions';

// redux mapStateToProps smart component function
function mapStateToProps (state) {
  return {
    // the `app` attribute of state would match the combineReducers sub-state
    entities: state.app
  }
}

// redux mapDispatchToProps smart component function
function mapDispatchToProps (dispatch) {
  return {
    // a `fetch` property is required and will be used to initiate the fetch
    // the property name can be overridden using the `fetchProp` option
    fetch: id => dispatch(fetch(id))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(

  modelProvider(CustomerPage, {
    // react-router will give us route token values in `props.params`
    id: 'params.id',
    // should match the action creator `entityType` option
    entityType: 'customer',
    // if this is not included, the model will not be auto-fetched
    fetchProp: 'fetch',
    // optional value to help log info to console if you are having trouble getting things working
    debug: true
  });

);
```
or if you have multiple models to work with
```javascript
...

modelProvider(CustomerPage, {
  debug: true,
  models: [{
    id: 'params.id',
    entityType: 'customer',
    fetchProp: 'fetch'
  }, {
    ...
  }]
});
```

### options
* ***models***: (if more than 1 model should be referenced, array of objects with following options)
* ***id***: function(props) or string (nesting using `.`) to identify the model id from React component properties
* ***entityType***: arbitrary string value (but should be meaningful to the model type) which should match the `entityType` value in your reducer and action creator
* ***propName***: property name used for the model object (defaults to `model`)
* ***idPropName***: the property name used for the model id (defaults to `id`)
* ***fetchProp***: the property used to fetch the model if necessary (the model will not be auto-fetched if this is not set)
* ***modelClass***: the model class to use (defaults to { Model } from 'react-redux-model`;  see [Model docs]('./model.md))
* ***fetchOptions***: optional function(props) used to provide a 2nd parameter to the fetch method if the `id` is not sufficient
