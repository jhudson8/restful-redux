import { reducer } from 'restful-redux';

// the `profile` constant needs to match the action creator domain
export default reducer({
  // should match the action creator `actionPrefix` option
  actionPrefix: 'SEARCH',
  // should match the action creator `entityType` option
  entityType: 'search'
});
