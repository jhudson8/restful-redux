// redux actions creator used to fetch the github profile data
import { reduxEffectsActionCreator } from 'react-redux-model';
import { push } from 'react-router-redux';
import { resultsPerPage } from './collection';

const profileActionCreator = reduxEffectsActionCreator({
  // prefix for all redux actions of this type
  actionPrefix: 'SEARCH',
  // root domain for model data; store data structure is { entities: { search: { _id_: {_model_data} } } }
  entityType: 'search'
});

// fetch a github profile designed by the provided id
export function fetch (id) {
  const parts = id.split(':');
  const keyword = parts[0];
  const pageNum = parseInt(parts[1] || '1', 10);
  return profileActionCreator.createFetchAction({
    id: id,
    url: `https://api.github.com/search/repositories?q=${keyword}&page=${pageNum}&per_page=${resultsPerPage}`,
    formatter: function (data) {
      // we can return the results in the following format
      // { id: _id_, data: _metadata_, result: _list of results_ }
      return {
        id: id,
        result: data.items,
        data: {
          totalCount: data.total_count,
          pageNum: pageNum
        }
      };
    }
  });
}

export function showSearchPage (keyword, pageNum) {
  pageNum = pageNum || 1;
  keyword = encodeURIComponent(keyword || '');
  return push(`/search/${keyword}/${pageNum}`);
}
