Github Project Search Example
--------------------------------------------------------
This example builds upon what we learned with [01-github-profile-viewer](./01-github-profile-viewer).  Now we show how we can use collections just like we use models.

Some notable differences are

* Added redux router middleware to capture dynamic URI push events (when search term changes)
* It retrieves a collection of data rather a single model
* Use the `formatter` action creator option to organize the results
* Use the `data` action payload attribute to save model/collection-based meta data (like total number of results, etc...)
* It shows how multiple models/collections can be defined with a `modelProvider`
* Graceful handling if a model/collection has no id (default search page with no term entered)

There are only meta files here.  See [./lib/search-page](./lib/search-page) for meaningful example.


## Installation
```
git clone https://github.com/jhudson8/restful-redux.git
cd restful-redux/examples/02-github-project-search
npm i
npm start
```
browse to [http://localhost:8080/search](http://localhost:8080/search)
