// "dumb / state unaware" React component
import React from 'react';
import { Link } from 'react-router';

export default function ({ collection, search, params }) {
  // collection was provided automatically by the collectionFetcher in the smart component (./index.js)
  // the only time you will not get a collection is if the id value does not exist

  const searchTerm = params && params.searchTerm;

  function onSubmit (ev) {
    ev.preventDefault();
    const input = ev.currentTarget.querySelectorAll('input')[0];
    search(input.value);
  }

  const searchInput = (
    <form onSubmit={onSubmit}>
      Search term: <input type="text" style={{width: '180px'}} defaultValue={searchTerm}/>
      <button type="submit">Search</button>
    </form>
  );

  if (collection) {
    // we have entered at least some kind of search criteria
    const fetchError = collection.fetchError();
    const searchResults = collection.value();

    if (fetchError) {
      // there was an error when we called the github API
      return (
        <div>
          <div>Sorry, <em>{searchTerm}</em> data could not be loaded: {fetchError.message}</div>
          <br/><br/>
          {searchInput}
        </div>
      );

    } else if (searchResults) {
      // reusable function to return a prev/next page callback function
      function goToPage (pageNum) {
        return function () {
          search(searchTerm, pageNum);
        }
      }

      // we have a valid search (although it could have 0 results)
      return (
        <div>
          {searchInput}
          <br/><br/>
          <ul>
            {searchResults.map(item => (
              <li key={item.full_name}>
                <Link to={`/repository/${item.full_name}`}>{item.full_name}</Link>
              </li>
            ))}
          </ul>
          <br/>
          {collection.hasPrevPage() && <button type="button" onClick={goToPage(collection.prevPage())}>&lt; previous page</button>}
          &nbsp;&nbsp;&nbsp;
          page {collection.pageNum()} of {collection.totalPages()}
          &nbsp;&nbsp;&nbsp;
          {collection.hasNextPage() && <button type="button" onClick={goToPage(collection.nextPage())}>next page &gt;</button>}
        </div>
      );

    } else {
      // since there is a collection, we know the collectionProvider is loading it but it's still in flight
      // because the value does not exist
      return (
        <div>Loading {searchTerm} details...</div>
      );
    }

  } else {
    // no search has been requested
    return searchInput;
  }
}
