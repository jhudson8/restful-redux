import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import middleware from './middleware';
import reducers from './reducers';
import ProfilePage from './profile-page';

let store = createStore(
  combineReducers(reducers),
  applyMiddleware.apply(applyMiddleware, middleware)
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/profile/:id" component={ProfilePage}/>
    </Router>
  </Provider>,
  document.getElementById('root')
);

export default store;
