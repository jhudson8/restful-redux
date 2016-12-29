import { reducer } from 'restful-redux';

// the `profile` constant needs to match the action creator domain
export default reducer({
  debug: true,
  // should match the action creator `actionPrefix` option
  actionPrefix: 'REPOSITORY',
  // should match the action creator `entityType` option
  entityType: 'repository'
});
