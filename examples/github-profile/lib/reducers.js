import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
// in a real app you would probably organize your reducer files differently but it keeps things simple here
import profileReducer from './profile-page/reducer';

let reducers = {
  routing: routerReducer,
  profiles: profileReducer
};

export default reducers;
