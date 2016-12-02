// "dumb / state unaware" React component
import React from 'react';

export default function ({ searchTerm, model, search }) {
  // model was provided automatically by the modelFetcher in the smart component (./index.js)
  // the only time you will not get a model is if the id value does not exist

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

  if (model) {
    // we have entered at least some kind of search criteria
    const fetchError = model.fetchError();
    const searchResults = model.value();

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
      // we have a valid search (although it could have 0 results)
      return (
        <div>
          {searchInput}
          <br/><br/>
          <ul>
            {searchResults.map(item => (
              <li key={item.full_name}>{item.full_name}</li>
            ))}
          </ul>
          <br/>
          {searchResults.length} of {model.data().totalCount} results
        </div>
      );

    } else {
      // since there is a model, we know the modelProvider is loading it but it's still in flight
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
