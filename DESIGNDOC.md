Design Documentation
====================

There are many things wrong with the current design. There is too much code in the app.js file, this should be broken out into smaller blocks of responsibility.

Application setup is currently somewhat unstructured, a better approach would be for the app to instantiate the api and model layer, then only after the initial data model is ready would it instantiate the UI layer and create all the appropriate elements. This is much easier to accomplish with a web components approach as the 'app' would be a single component at the top level of the page, then the various page states and other UI components would be instantiated based on the state of the app.

### Use a better abstraction for the data model

The data model implementation is somewhat rudimentary and has some redundant events in its update cycle. A better model would improve performance and allow for more control over querying behavior (caching etc).

### Use webcomponents for the UI

There are a couple of key components in this UI, the 'form', and the 'results'. The results can further be broken down into 'labor actions' and 'parts'. These can all be componentized using web components with each only having a single responsibility. This has a number of advantages. The CSS becomes completely encapsulated at each component, allowing for a much cleaner app level css file. The responsibility of each component also becomes very clear, making reuse and refactoring very easy.

### Use BDD style test harness

A proper test harness would allow each layer to be tested in isolation, unit test coverage will also aid in refactoring.
A mock api layer would also allow for more streamlined development without danger of hitting API limits on edmunds endpoints.

Future Work
===========

* Add test harness using sinon, mocha, and chai.
* Add filtering and sorting to maintenance action list
    * Break down maintenance actions into those for all mileage up to specified value
    * Filter out parts from labor actions
    * Filter out actions for specified transmission and engine
    * Find api for estimated labor hourly rate to do labor cost calculation
* Better form validation for zip and mileage
* Add error handling
* Actually use zip and mileage for something
* Add babel or some other transpiler for es6 support across more browsers
* Webpack all scripts into a single src file
* Better model implementation with less redundant validation checking
* Add rate limiting to API layer
* Make back-end service to reduce api calls to Edmunds endpoints (caching across users)
* Better photo formatting
* Tooltips
* Webcomponentize the project using Polymer or webcomponents.js
* Break up app.js into smaller chunks dealing with form and results page separately
* If not using web components implement SASS/LESS to simplify CSS

Known Bugs
==========
* Does not handle edge case where style has no transmission/engine entries
* Shows all action items even those which do not apply to specified mileage, or transmission/engine type