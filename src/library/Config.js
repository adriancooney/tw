import { Debug } from "./Debug";

const debug = Debug("tw:config");

export default class Config {
    constructor() {
        this.config = {};
    }

    /**
     * Set a value on the config.
     * @param {String|Object} key   The key to set or object of key/values.
     * @param {Mixed} value The value to set in the config.
     */
    set(key, value) {
        if(key instanceof Object) Object.keys(key).forEach((prop) => { this.set(prop, key[prop]); });
        else {
            debug("set %s = %s", key, value);
            this.config[key] = value;
        }
    }

    /**
     * Get a value from the config.
     * @param  {String} key Name of the key.
     * @return {Mixed}     The value of the key in the config.
     */
    get(key) {
        debug("get \"%s\"", key);
        return this.config[key];
    }

    /**
     * Convert the config to e JSON object. Converted back
     * to a config with config#unpack.
     * @return {Object} 
     */
    toJSON() {
        return this.config;
    }
}