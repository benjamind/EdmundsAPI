(function () {
    window.Edmundium = window.Edmundium || {};

    const baseUri = 'https://api.edmunds.com/'; 
    const endpoints = {
        makes: 'api/vehicle/v2/makes',
        models: 'api/vehicle/v2/{make}/models',
        styles: 'api/vehicle/v2/{make}/{model}/{year}/styles',
        engines: 'api/vehicle/v2/styles/{styleId}/engines',
        transmissions: 'api/vehicle/v2/styles/{styleId}/transmissions',
        maintenance: 'v1/api/maintenance/actionrepository/findbymodelyearid',
        photosByStyle: 'api/media/v2/styles/{styleId}/photos',
    };

    const makeUrl = (endpoint, apiKey, params = {}) => {
        params.fmt = 'json';
        params.api_key = apiKey;
        // make the complete query string
        const queryString = Object.keys(params).reduce((result, paramName) => {
            result += `${paramName}=${encodeURIComponent(params[paramName])}&`;
            return result;
        }, '');
        return `${baseUri}${endpoint}?${queryString}`;
    };

    const query = (url) => {
        const promise = new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.addEventListener('load', () => {
                const result = JSON.parse(req.responseText);
                if (result.status === 'BAD_REQUEST' || result.errorType) {
                    reject(new Error(`${result.errorType}: ${result.message.trim()}`));
                    return;
                }
                resolve(result);
            });
            const errorHandler = (evt) => {
                reject(evt)
            };
            req.addEventListener('error', errorHandler);
            req.open('GET', url, true);
            req.send();
        });
        return promise;
    };

    class API {
        constructor(apiKey) {
            if (!apiKey) {
                throw new Error('No apiKey specified');
            }
            this._apiKey = apiKey;
        }
        GetMakesByYear(year) {
            const url = makeUrl(endpoints.makes, this._apiKey, {
                year: year,
            });
            return query(url);
        }
        GetModelsByMakeYear(make, year) {
            const url = makeUrl(endpoints.models.replace('{make}', make), this._apiKey, {
                year: year,
                view: 'full',
            });
            return query(url);
        }
        GetStylesByMakeModelYear(make, model, year) {
            const endpoint = endpoints.styles
                .replace('{make}', make)
                .replace('{model}', model)
                .replace('{year}', year);

            const url = makeUrl(endpoint, this._apiKey, {
                view: 'full',
            });
            return query(url);
        }
        GetEnginesByStyleId(styleId) {
            const url = makeUrl(endpoints.engines.replace('{styleId}', styleId), this._apiKey);
            return query(url);
        }
        GetTransmissionsByStyleId(styleId) {
            const url = makeUrl(endpoints.transmissions.replace('{styleId}', styleId), this._apiKey);
            return query(url);
        }
        GetMaintenanceSchedule(modelYearId) {
            const url = makeUrl(endpoints.maintenance, this._apiKey, {
                modelyearid: modelYearId,
            });
            return query(url);
        }
        GetPhotosByStyleId(styleId) {
            const url = makeUrl(endpoints.photosByStyle.replace('{styleId}', styleId), this._apiKey);
            return query(url);
        }
    }
    Edmundium.API = API;
})();