// "smart / redux store connected" React component
import { modelProvider } from 'restful-redux';
import { connect } from 'react-redux';

import Collection from './collection';
import SearchPage from './search-page';
import { fetch, showSearchPage } from './actions';
import { denormalize } from 'normalizr';

// imports to denormalize the normalized data
import schema from './schema';

// redux mapStateToProps smart component function
function mapStateToProps (state) {
  return {
    // the `app` attribute of state would match the combineReducers attribute in ../reducer
    entities: state.app
  };
}

// redux mapDispatchToProps smart component function
function mapDispatchToProps (dispatch) {
  return {
    // a `fetch` property is required and will be used to initiate the fetch
    // the property name can be overridden using the `fetchProp` modelFetcher option
    fetch: id => dispatch(fetch(id)),
    search: (keyword, pageNum) => dispatch(showSearchPage(keyword, pageNum))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  modelProvider(SearchPage, {
    debug: true,
    models: [{
      // react-router will give us route token values in `props.params`
      id: function (props) {
        return props.params.searchTerm
          ? (encodeURIComponent(props.params.searchTerm) + ':' + (props.params.page || '1'))
          : undefined;
      },
      // the property name passed to our component which represents our search collection
      modelProp: 'collection',
      // a custom class used to wrap our collection data
      modelClass: Collection,
      // should match the action creator `entityType` option
      entityType: 'search',
      // if this is not included, the model will not be auto-fetched
      fetchProp: 'fetch',
      denormalize: denormalize,
      schema: schema
    }]
  })
);
