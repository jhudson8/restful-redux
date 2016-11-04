// "dumb / state unaware" React component
import React from 'react';

export default function ({ id, model }) {
  // model was provided automatically by the modelFetcher in the smart component (./index.js)
  // you will *always* get a model even if you actually have no model state data

  const data = model.data();

  if (data) {
    // we have the data fetched
    return (
      <dl>
        <dt>login</dt>
        <dd>{data.login}</dd>
        <dt>url</dt>
        <dd>{data.url}</dd>
        <dt>name</dt>
        <dd>{data.name}</dd>
        <dt>location</dt>
        <dd>{data.location}</dd>
        <dt>public repositories</dt>
        <dd>{data.public_repos}</dd>
      </dl>
    );
  }

  const fetchError = model.fetchError();
  if (fetchError) {
    return (
      <div>Sorry, <em>{id}</em> data could not be loaded: {fetchError.message}</div>
    );
  }

  // if we don't have a model yet and there is no error, there will be a fetch pending
  return (
    <div>Loading {id} details...</div>
  );
}
