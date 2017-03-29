Collections
-----------
Collections don't have to be any different than models (in other words an array can be returned from `model.getValue()`).  See the main [README](../README.md) page to do this without advanced functionality.

If you [normalize](https://github.com/paularmstrong/normalizr) your collection you can track action/fetch XHR state for each item in the collection individually.

This is an example using an API to fetch and display users that belong to a group.  See sibling docs for more details on the code listed below.

## Tracking XHR status for individual collection items
This simple example shows a list of products and shows a loading indicator when a product is being added to cart.

Assume our product search response returns a shape of `{ totalCount: _number_, products: [...] }`
### Normalizr Schema
This is how the magic happens.  We normalize the results and extract the array of product values to an array of ids
with the product data stored separately
```
import { schema } from 'normalizr';

// the schema.Entity parameter will match our `entityType` value
export productSchema = new schema.Entity('product');
export productCollectionSchema = new schema.Array(productSchema);
```

### Action Creators
This is similar to the basic example except we

* apply the `productCollectionSchema` to the response
* use a formatter to move the `totalCount` value to `data` (model.data()) because now the `model.value()` must return an array
```javascript
import { createActionCreator } from 'restful-redux';
import { productCollectionSchema } from './schemas';

// this will handle our product search action
const productCollectionActionCreator = createActionCreator({
  entityType: 'products',
  actionPrefix: 'PRODUCTS',
  schema: productCollectionSchema,
  formatter: function (response) {
    // to normalize a collection we need the model `value` to be an array so we'll save
    // the additional attributes as `data`
    return {
      value: response.products,
      data: {
        totalCount: response.totalCount
      }
    };
  }
});

// this will handle our add to cart action
const productActionCreator = createActionCreator({
  entityType: 'products',
  actionPrefix: 'PRODUCTS'
});

// action creator to initiate a product search fetch
export function searchProducts (searchTerm) {
  return productCollectionActionCreator.fetch({
    id: searchTerm,
    url: `/api/products/search/${searchTerm}`
  });
}

// action creator to initiate a product related add to cart
export function addToCart (productId) {
  return productCollectionActionCreator.createPostAction({
    id: productId,
    // actionId allows us to track the XHR state of this specific action for this specific product
    actionId: 'addToCart',
    url: `/api/product/${productId}`,
    // by including `fetchConfigMiddleware` (see ./action-creator.md) the body will be serialized
    // and  appropriate JSON headers will be set for you
    params: {
      body: {
        quantity: 1
      }
    },
    // we'll assume the response will return the new product details (with a count of the quantity in cart)
    replaceModel: true
  });
}
```

### Reducer
```javascript
import { createReducer, chainReducers } from 'restful-redux';

// nothing functionally different here from the basic example
export default chainReducers(
  createReducer({
    entityType: 'products',
    actionPrefix: 'PRODUCTS'
  }),
  createReducer({
    entityType: 'product',
    actionPrefix: 'PRODUCT'
  })
);
```

### React Component Model Provider
```javascript
import { productCollectionSchema, productSchema } from './schemas';
import { denormalize } from 'normalizr';
import { modelProvider } from 'restful-redux';
import { searchProducts, addToCart } from './actions';

function ProductListComponent ({ model, addToCart }) {
  const products = model.value();
  if (model.fetchError()) {
    // model.fetchError() returns the error payload: { headers, status, statusText, url, value }
    return <div>Sorry, we could not load your products</div>
  } else if (model.isFetchPending()) {
    return <div>Loading your products</div>;
  } else {
    // normally you would decompose product details to a separate component but we're keeping it simple here
    return (
      <ul>
        {products.map(product) => (
          <li>
            {product.name} {product.quantityInCart} in cart
            {/* notice how we can refer to restful-redux model functions in our collection items */}
            {product.isActionPending('addToCart')
              ? <span>adding to cart...</span>
              : <button onClick={(ev) => addToCart(product.id)}>Add to cart</button>
            }
          </li>
        )}
      </ul>
    );
  }
}

function mapPropsToState (state) {
  // simple example assumes we aren't using `combineReducers` so we're just using global state to hold our entities
  return {
    entities: state
  };
}

function mapDispatchToProps (dispatch) {
  return {
    fetchProducts: (searchTerm) => dispatch(fetch(searchTerm)),
    addToCart: (productId) => dispatch(addToCart(productId))
  };
}

// assuming we're using react-router with a route of /products/{searchTerm} (`props.params.searchTerm` will be our search term)
export connect(mapStateToProps, mapDispatchToProps)(
  modelProvider({
    id: 'params.searchTerm',
    entityType: 'products',
    fetchProp: 'fetchProducts',
    // below is what will replace the normalized collection id values to the product values
    denormalize: denormalize,
    schema: productCollectionSchema
    // below is what will replace the product values with Model objects that give you access to product level XHR status
    arrayEntrySchema: productSchema
  })(UserProfileComponent);
)
```
