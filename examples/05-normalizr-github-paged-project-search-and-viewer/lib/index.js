import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

// our custom application stuff
import middleware from './middleware';
import reducers from './reducers';
import SearchPage from './search-page';
import ProjectDetailsPage from './project-details-page';

// redux store
let store = createStore(
  combineReducers(reducers),
  applyMiddleware.apply(applyMiddleware, middleware)
);

// start up the app
ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/search(/:searchTerm)(/:page)" component={SearchPage}/>
      <Route path="/project/:org/:id" component={ProjectDetailsPage}/>
    </Router>
  </Provider>,
  document.getElementById('root')
);
