## v1.1.1
- bug fix: allow state or state.entities to be passed to model (instead of just state.entities)

## v1.1.0
- Added alternative Model constructor useful for unit testing (id, value)
```
import { Model } from 'restful-redux';
// data() value can be included as {_meta: {data: {...}}}

const myModel = new Model('_modelid_', {
  _meta: {
    data: {
      someMetaValue: 'foo'
    }
  },
  someModelValue: 'bar'
});
```

