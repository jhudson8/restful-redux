Unit Testing
---------------
It's easy to create Model instances with different states for unit tests.  Here is everything you need to know

## Model Constructors
There are 2 different constructor signatures that you can use
```
import { Model } from 'restful-redux';

// we are explicitely providing the id value
new Model(_id_, _model_value_, _metadata_)

// it is assumed the model value will have an `id` parameter
new Model(_model_value_, _metadata_)
```

## Model States
The last parameter `_metadata_` is how we keep track of what state your data is in.

You can include fetch, action and data values at once as well.

### Fetch Pending
```
new Model(_model_value_, { fetch: { pending: true } });
```

### Fetched Without Error
```
new Model(_model_value_, { fetch: { success: true } });
```
or just
```
new Model(_model_value_, true);
```

### Fetched With Error
```
// technically the error response shape would be { headers, status, statusText, url, value } but the Model class doesn't care
new Model(_model_value_, { fetch: { error: {...error response payload} } });
```

### Action Pending
```
new Model(_model_value_, { action: { id: _action_id_, pending: true } });
```

### Action Without Error
```
// `success` value actually represents the XHR response but the Model class doesn't care
new Model(_model_value_, { action: { id: _action_id_, success: true } });
```

### Action With Error
```
// technically the error response shape would be { headers, status, statusText, url, value } but the Model class doesn't care
new Model(_model_value_, { action: { id: _action_id_, error: {...error response payload} } });
```

### Model Data
(what is returned when using Model.data() - as opposed to Model.value());  this data is kept around even if the model is re-fetched
```
// if you just want to provide a model value use `new Model(_model_value_, false)`
new Model(_model_value_, { data: {...} });
```
