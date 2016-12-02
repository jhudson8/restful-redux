Github Project Search And View Example
--------------------------------------------------------
This example builds upon [04-normalizr-github-paged-project-search](./04-normalizr-github-paged-project-search) with and additional page used to view the project details.  Since the entities are normalized on search, no XHR fetch will be executed when viewing profile details.  An XHR fetch will be executed automatically (because the entity won't exist) if you view a project page without going through search.

Everything in this folder is boilerplate to get the app running.  See [./lib](./lib) for meaningful example.


## Installation
```
git clone https://github.com/jhudson8/react-redux-model.git
cd react-redux-model/examples/05-normalizr-github-paged-project-search-and-viewer
npm i
npm start
```
browse to [http://localhost:8080/search](http://localhost:8080/search)
