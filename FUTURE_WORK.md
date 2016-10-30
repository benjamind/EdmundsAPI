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

Known Bugs
==========
* Does not handle edge case where style has no transmission/engine entries
* Shows all action items even those which do not apply to specified mileage, or transmission/engine type