import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { reducer } from 'restful-redux';

import searchReducer from './search-page/reducer';
import projectDetailsReducer from './project-details-page/reducer';

// here we are joining our search and profile reducer to make a single reducer
// this is different from redux combineReducers in that each reducer here shares
// the same sub-state (which will allow normalized entities to be used by search
// and profile views to remove the need for an XHR fetch to get profile data after
// viewing a profile from a search)
const appReducers = reducer.join([searchReducer, projectDetailsReducer]);

export default {
  // `routing` this isn't necessary if we didn't care about react-router state being in the redux store
  routing: routerReducer,
  // `app` will be the state attribute that our view component will look for profile data
  app: appReducers
};
