import { Model } from 'react-redux-model';

// the default number of results per page
export const resultsPerPage = 50;

export default class Collection extends Model {

  nextPage () {
    var data = this.data();
    if (data && data.pageNum) {
      return data.pageNum + 1;
    }
  }

  hasNextPage () {
    var data = this.data();
    if (data && data.pageNum) {
      return data.pageNum * resultsPerPage < data.totalCount;
    }
  }

  prevPage () {
    var data = this.data();
    if (data && data.pageNum) {
      return data.pageNum - 1;
    }
  }

  hasPrevPage () {
    var data = this.data();
    if (data && data.pageNum) {
      return data.pageNum > 1;
    }
  }

  pageNum () {
    var data = this.data();
    return data && data.pageNum;
  }

  totalPages () {
    var data = this.data();
    return data ? Math.ceil(data.totalCount / resultsPerPage) : 0;
  }
}
