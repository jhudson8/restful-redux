Github Profile Search Example
--------------------------------------------------------
This example builds upon [./01-github-profile-viewer](./01-github-profile-viewer) with the following differences

* Added redux router middleware to capture dynamic URI push events (when search term changes)
* It retrieves a collection of data rather a single model
* Use the `formatter` action creator option to organize the results
* Use the `data` action payload attribute to save model/collection-based meta data (like total number of results, etc...)
* It shows how multiple models/collections can be defined with a `modelProvider`
* Graceful handling if a model/collection has no id (default search page with no term entered)

## Installation
```
git clone https://github.com/jhudson8/react-redux-model.git
cd react-redux-model/examples/02-github-profile-search
npm i
npm start
```
browse to [http://localhost:8080/search](http://localhost:8080/search)
