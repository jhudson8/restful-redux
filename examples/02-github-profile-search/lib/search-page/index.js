// "smart / redux store connected" React component
import { modelProvider } from 'react-redux-model';
import { connect } from 'react-redux';

import SearchPage from './search-page';
import { fetch, showSearchPage } from './actions';

// redux mapStateToProps smart component function
function mapStateToProps (state) {
  return {
    // the `app` attribute of state would match the combineReducers attribute in ../reducer
    entities: state.app
  }
}

// redux mapDispatchToProps smart component function
function mapDispatchToProps (dispatch) {
  return {
    // a `fetch` property is required and will be used to initiate the fetch
    // the property name can be overridden using the `fetchProp` modelFetcher option
    fetch: id => dispatch(fetch(id)),
    search: keyword => dispatch(showSearchPage(keyword))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  modelProvider(SearchPage, {
    models: [{
      // react-router will give us the id as props.params.id because our route is `/profile/:id`
      id: 'params.searchTerm',
      // the actual property value that will be passed with the search term (same as params.keyword)
      idProp: 'searchTerm',
      // should match the action creator `entityType` option
      entityType: 'search',
      // if this is not included, the model will not be auto-fetched
      fetchProp: 'fetch'
    }]
  })
);
