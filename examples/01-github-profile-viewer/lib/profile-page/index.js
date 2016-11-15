// "smart / redux store connected" React component
import { modelProvider } from 'react-redux-model';
import { connect } from 'react-redux';

import ProfilePage from './profile-page';
import { fetch } from './actions';

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
    fetch: id => dispatch(fetch(id))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  modelProvider(ProfilePage, {
    // react-router will give us the id as props.params.id because our route is `/profile/:id`
    id: 'params.id',
    // should match the action creator `entityType` option
    entityType: 'profiles',
    // if this is not included, the model will not be auto-fetched
    fetchProp: 'fetch'
  })
);
