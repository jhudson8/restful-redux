import { reducer } from 'redux-model-util';

// the `profile` constant needs to match the action creator domain
export default reducer({
  // should match the action creator `actionPrefix` option
  actionPrefix: 'PROFILE',
  // should match the action creator `entityType` option
  entityType: 'profiles'
});
