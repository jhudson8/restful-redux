// "smart / redux store connected" React component
import { modelProvider } from 'restful-redux';
import { connect } from 'react-redux';

import ProjectDetailsPage from './project-details-page';
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
  modelProvider(ProjectDetailsPage, {
    // project-details-router will give us route token values in `props.params`
    id: function (props) {
      const params = props.params;
      return `${params.org}/${params.id}`;
    },
    // should match the action creator `entityType` option
    entityType: 'repository',
    // if this is not included, the model will not be auto-fetched
    fetchProp: 'fetch'
  })
);
