import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

// our customer application stuff
import middleware from './middleware';
import reducers from './reducers';
import ProfilePage from './profile-page';

// redux store
let store = createStore(
  combineReducers(reducers),
  applyMiddleware.apply(applyMiddleware, middleware)
);

// start up the app
ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/profile/:id" component={ProfilePage}/>
    </Router>
  </Provider>,
  document.getElementById('root')
);
