// redux actions creator used to fetch the github profile data
import { reduxEffectsActionCreator } from 'react-redux-model';
import { push } from 'react-router-redux';
const profileActionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'SEARCH',
  // root domain for model data; store data structure is { entities: { search: { _id_: {_model_data} } } }
  entityType: 'search'
});

// fetch a github profile designed by the provided id
export function fetch (keyword) {
  keyword = encodeURIComponent(keyword || '');
  return profileActionCreator.createFetchAction({
    id: keyword,
    url: `https://api.github.com/search/repositories?q=${keyword}`,
    formatter: function (data) {
      // we can return the results in the following format
      // { id: _id_, data: _metadata_, result: _list of results_ }
      return {
        id: keyword,
        result: data.items,
        data: {
          totalCount: data.total_count
        }
      };
    }
  });
}

export function showSearchPage (keyword) {
  keyword = encodeURIComponent(keyword || '');
  return push(`/search/${keyword}`);
}
