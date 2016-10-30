(function () {
    window.Edmundium = window.Edmundium || {};
    
    /**
     * Model class stores selection state, notifies listeners on change of any property
     */
    class MaintenanceModel extends Edmundium.EventEmitter(Object) {
        constructor (api) {
            if (!api) {
                throw new Error('No API interface specified');
            }
            super();
            this._api = api;

            // initialize years array
            this._years = [];
            const currentYear = new Date().getFullYear();
            for (let year = currentYear + 1; year >= 1990; year--) {
                this._years.push(year);
            }
            this.emit('yearsChanged', this.Years);

            this.Reset();
        }
        Reset() {
            this.Year = null;
            this._makes = new Map();
            this.Make = null;
            this._models = new Map();
            this.Model = null;
            this._styles = new Map();
            this.Style = null;
            this._transmissions = new Map();
            this.Transmission = null;
            this._engines = new Map();
            this.Engine = null;
        }

        get Years() {
            return this._years;
        }
        get Year() {
            return this._year;
        }
        set Year(value) {
            if (value !== null && this.Years.indexOf(value) === -1) {
                throw new Error(
                    `Invalid year, must be within range ${this.Years[0]} to ${this.Years[this.Years.length-1]}`
                );
            }
            // store the year
            this._year = value;
            // clear other dependant variables
            this.Make = null;
            this.Model = null;
            this.Style = null;
            this.Transmission = null;
            this.Engine = null;
            // notify on change
            this.emit('yearChanged', this._year);
            // if we have a value get the makes for this year
            this._getMakesByYear(this._year);
            this._validateModel();
        }
        get Makes() {
            return this._makes;
        }
        get Make() {
            return this._make;
        }
        set Make(value) {
            if (value !== null && !this.Makes.has(value)) {
                throw new Error(`No such make '${value}' in current year`);
            }
            this._make = value;
            this.Model = null;
            this.Style = null;
            this.Transmission = null;
            this.Engine = null;

            this.emit('makeChanged', this.Make);

            this._getModelsByMakeYear(this.Make, this.Year);
            this._validateModel();
        }
        get Models() {
            return this._models;
        }
        get Model() {
            return this._model;
        }
        set Model(value) {
            if (value != null && !this._models.has(value)) {
                throw new Error(`No such model '${value} in current make`);
            }
            this._model = value;
            this.Style = null;
            this.Transmission = null;
            this.Engine = null;

            this.emit('modelChanged', this.Model);

            this._getStylesByModel(this.Make, this.Model, this.Year);
            this._validateModel();
        }
        get Styles() {
            return this._styles;
        }
        get Style() {
            return this._style;
        }
        set Style(value) {
            if (value != null && !this._styles.has(value)) {
                throw new Error(`No such style '${value}' in current model`);
            }
            this._style = value;
            this.Transmission = null;
            this.Engine = null;

            this._getEnginesByStyle(this.Style);
            this._getTransmissionsByStyle(this.Style);

            this.emit('styleChanged', this.Style);
            this._validateModel();
        }
        get Transmission() {
            return this._transmission;
        }
        set Transmission(value) {
            this._transmission = value;
            this.emit('transmissionChanged', this.Transmission);
            this._validateModel();
        }
        get Transmissions() {
            return this._transmissions;
        }
        get Engine() {
            return this._engine;
        }
        set Engine(value) {
            this._engine = value;
            this.emit('engineChanged', this.Engine);
            this._validateModel();
        }
        get Engines() {
            return this._engines;
        }
        GetSchedule() {
            if (!this._isValid) {
                throw new Error('attempt to get schedule for invalid maintenance model');
            }
            // use existing selection to retrieve maintenance schedule
            const model = this.Model;
            const modelYearId = this.Models.get(model).years[0].id;
            const query = this._api.GetMaintenanceSchedule(modelYearId);
            query.then((result) => {
                this.emit('maintenanceChanged', result.actionHolder);
            });
            const photoQuery = this._api.GetPhotosByStyleId(this.Style);
            photoQuery.then((result) => {
                this.emit('photosChanged', result.photos);
            });
        }

        /// Private methods...

        _getMakesByYear(year) {
            // clear the existing list
            this._makes = new Map();
            this.emit('makesChanged', this._makes);
            if (year !== null) {
                // query for the new one
                const query = this._api.GetMakesByYear(year);
                query.then((result) => {
                    // update the map
                    this._makes.clear();
                    result.makes.forEach((make) => {
                        this._makes.set(make.niceName, make);
                    });
                    this.emit('makesChanged', this._makes);
                }, (err) => {
                    this.emit('error', err);
                });
            }
        }
        _getModelsByMakeYear(make, year) {
            this._models = new Map();
            this.emit('modelsChanged', this._models);
            if (make !== null && year !== null) {
                const query = this._api.GetModelsByMakeYear(make, year);
                query.then((result) => {
                    this._models = new Map();
                    result.models.forEach((model) => {
                        this._models.set(model.niceName, model);
                    });
                    this.emit('modelsChanged', this._models);
                });
            }
        }
        _getStylesByModel(make, model, year) {
            this._styles = new Map();
            this.emit('stylesChanged', this._styles);
            if (make !== null && model !== null && year !== null) {
                // lookup styles to get transmission and engine data in the form we want
                const query = this._api.GetStylesByMakeModelYear(make, model, year);
                query.then((result) => {
                    this._styles = new Map();
                    result.styles.forEach((model) => {
                        this._styles.set(model.id, model);
                    });
                    this.emit('stylesChanged', this._styles);
                });
            }
        }
        _getTransmissionsByStyle(styleId) {
            this._transmissions = new Map();            
            this.emit('transmissionsChanged', this._transmissions);
            if (styleId !== null) {
                const transmissionQuery = this._api.GetTransmissionsByStyleId(styleId);
                transmissionQuery.then((result) => {
                    this._transmissions = new Map();
                    result.transmissions.forEach((model) => {
                        this._transmissions.set(model.id, model);
                    });
                    this.emit('transmissionsChanged', this._transmissions);
                });
            }
        }
        _getEnginesByStyle(styleId) {
            this._engines = new Map();
            this.emit('enginesChanged', this._engines);
            if (styleId !== null) {
                const engineQuery = this._api.GetEnginesByStyleId(styleId);
                engineQuery.then((result) => {
                    this._engines.clear();
                    result.engines.forEach((model) => {
                        this._engines.set(model.id, model);
                    });
                    this.emit('enginesChanged', this._engines);
                }, (err) => {
                    this.emit('error', err);
                });
            }
        }
        _validateModel() {
            const oldValid = this._isValid;
            if (this.Year && this.Make && this.Model && this.Style && this.Transmission && this.Engine) {
                this._isValid = true;
            } else {
                this._isValid = false;
            }
            // emit on change
            if (oldValid !== this._isValid) {
                this.emit('valid', this._isValid);
            }
        }
    }
    Edmundium.MaintenanceModel = MaintenanceModel;
})();