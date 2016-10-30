(function () {
    window.Edmundium = window.Edmundium || {};
    /**
     * EventEmitter mixin class for creating synthetic events on ES6 classes
     * 
     * Implementation largely inspired by http://www.datchley.name/es6-eventemitter/
     */
    const eventEmitterMixin = (BaseClass) => class EventEmitter extends BaseClass {
        constructor (...args) {
            super(...args);
            this._initEventMap();
        }
        _initEventMap() {
            if (!this._eventMap) {
                this._eventMap = new Map();
            }
        }
        addListener(eventName, callback) {
            this._eventMap.has(eventName) || this._eventMap.set(eventName, []);
            this._eventMap.get(eventName).push(callback);
        }
        removeListener(eventName, callback) {
            const listeners = this._eventMap.get(eventName);
            if (listeners && listeners.length) {
                const index = listeners.findIndex((listener) => {
                    return typeof listener === 'function' && listener === callback;
                });
                if (index > -1) {
                    listeners.splice(index, 1);
                    this._eventMap.set(eventName, listeners);
                    return true;
                }
            }
            return false;
        }
        emit(eventName, ...args) {
            this._initEventMap();
            const listeners = this._eventMap.get(eventName);
            if (listeners && listeners.length) {
                listeners.forEach((listener) => {
                    listener(...args);
                });
                return true;
            }
            return false;
        }
    };
    Edmundium.EventEmitter = eventEmitterMixin;
})();
