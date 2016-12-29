Github Project Search And View Example
--------------------------------------------------------
This example builds upon [04-normalizr-github-paged-project-search](./04-normalizr-github-paged-project-search) with and additional page used to view the project details.  Since the entities are normalized on search, no XHR fetch will be executed when viewing profile details.  An XHR fetch will be executed automatically (because the entity won't exist) if you view a project page without going through search.

There are only meta files here.  See [./lib](./lib) for meaningful example.


## Installation
```
git clone https://github.com/jhudson8/restful-redux.git
cd restful-redux/examples/05-normalizr-github-paged-project-search-and-viewer
npm i
npm start
```
browse to [http://localhost:8080/search](http://localhost:8080/search)
