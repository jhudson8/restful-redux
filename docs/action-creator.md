Action Creators
---------------
There is 1 action creator impl (using [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch)).

You can create your own so we will discuss the interface (expected by the reducer) as well.

## Redux Effects Action Creator
### Import and Create New Action Creator
```javascript
import { reduxEffectsActionCreator } from 'react-redux-model';

const actionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'CUSTOMER',
  // root domain for model data; store data structure is { entities: { profiles: { _id_: {_model_data} } } }
  entityType: 'customer',
  // optional normalizr normalize method (see https://github.com/paularmstrong/normalizr... `import { normalize } from 'normalizr';`)
  normalize: normalize
});
```
### Example
[../examples/01-github-profile-viewer/lib/profile-page/actions.js](../examples/01-github-profile-viewer/lib/profile-page/actions.js)

### Action Creator API
#### createFetchAction (options)
##### options
* id: required model id
* url: required fetch url
* payload: optional effects-fetch payload (https://github.com/redux-effects/redux-effects-fetch#actions)
* schema: optional normalizr schema if response should be normalized
* formatter: optional function(payload, id) used to format the response before being evaluated by normalizr

##### response shape
Either the API response, `formatter` or `normalizr schema` should return one of the following responses.

Simple
```json
{
  id: _model id_
  result: _model data_ (accessed using model.value() - see Model docs)
  data: _meta data_ (accessed using model.data() - see Model docs; good for collections where the "model" is an array)
}
```
Advanced
```json
{
  result: _model id_
  entities: { // useful for multiple entities provided with a single response
    _entityType_: { // must match the `entityType` attribute for the action creator options
      _model id_: {
        // the model data
      }
    },
    data: _meta data_ (accessed using model.data() - see Model docs; good for collections where the "model" is an array)
}
```
