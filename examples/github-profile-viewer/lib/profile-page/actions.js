// redux actions creator used to fetch the github profile data
import { reduxEffectsActionCreator } from 'redux-model-util';
const profileActionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'PROFILE',
  // root domain for model data; store data structure is { entities: { profiles: { _id_: {_model_data} } } }
  entityType: 'profiles'
});

// fetch a github profile designed by the provided id
export function fetch (id) {
  return profileActionCreator.createFetchAction({
    id: id,
    url: `https://api.github.com/users/${id}`
  });
}
