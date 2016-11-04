// redux actions creator used to fetch the github profile data
import { reduxEffectsActionCreator } from 'redux-model-util';
const profileActionCreator = reduxEffectsActionCreator('profile');

// fetch a github profile designed by the provided id
export function fetch (id) {
  return profileActionCreator.createFetchAction({
    id: id,
    url: `https://api.github.com/users/${id}`
  });
}
