import { reducer } from 'redux-model-util';

// the `profile` constant needs to match the action creator domain
export default reducer({
  actionPrefix: 'PROFILE',
  entityType: 'profiles'
});
