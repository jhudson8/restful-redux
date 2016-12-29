// redux actions creator used to fetch the github profile data
import { reduxEffectsActionCreator } from 'restful-redux';
const profileActionCreator = reduxEffectsActionCreator({
  debug: true,
  // prefix for all redux actions of this type
  actionPrefix: 'REPOSITORY',
  // root domain for model data; store data structure is { entities: { repository: { _id_: {_model_data} } } }
  entityType: 'repository'
});

// fetch a github profile designed by the provided id
export function fetch (id) {
  return profileActionCreator.createFetchAction({
    id: id,
    url: `https://api.github.com/repos/${id}`
  });
}
