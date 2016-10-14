// redux actions creator used to fetch the github profile data
import { actionCreator } from 'redux-model-util';
const profileActionCreator = actionCreator('PROFILE');

// fetch a github profile designed by the provided id
export function fetch (id) {
  return profileActionCreator.createFetchAction({
    id: id,
    url: `https://api.github.com/users/${id}`
  });
}
