// "smart / redux store connected" React component
import { componentUtil } from 'redux-model-util';
import { connect } from 'react-redux';

import ProfilePage from './profile-page';
import { fetch } from './actions';

// redux mapStateToProps smart component function
function mapStateToProps (state) {
  return {
    // the `profiles` attribute of state would match the combineReducers attribute in ../reducer
    profiles: state.profiles
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
  componentUtil.modelFetcher(ProfilePage, {
    // react-router will give us the id as props.params.id because our route is `/profile/:id`
    id: 'params.id',
    // should match the property name passed with `mapStateToProps` representing the models domain object
    models: 'profiles'
  })
);
