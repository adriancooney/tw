import { Debug } from "./Debug";

const debug = Debug("tw:config");

export default class Config {
    constructor(register = {}, config) {
        this.types = {};

        this.register(register);

        // Default types
        this.register({
            RegExp: {
                serialize(regex) {
                    return regex.toString();
                },

                deserialize(string) {
                    var flag = string.slice(-1);
                    return new RegExp(string.slice(1, -2 + (flag === "/" ? 1 : 0)), flag !== "/" ? flag : undefined);
                }
            },

            Date: {
                serialize(date) {
                    return date.toJSON()
                },

                deserialize(string) {
                    return new Date(string);
                }
            }
        })

        if(config) {
            debug("unpacking config");
            this.config = this.unpack(config);
        }
    }

    /**
     * Register a type to a key.
     * @param  {String|Object} key  The key to register under. Also accepts key/type store.
     * @param  {Function} type The constructor or function.
     */
    register(key, type) {
        if(key instanceof Object) Object.keys(key).forEach((k) => { this.register(k, key[k]); });
        else {
            if(typeof type === "object" && (!type.serialize || !type.deserialize)) throw new Error(`Type "${key}" needs both serialize and deserialize methods.`);
            if(typeof type !== "object" && typeof type !== "function") throw new Error(`Type "${key}" must be an Object[serialize(), deserialize()] or a Class or a function.`);
            return this.types[key] = type;
        }
    }

    /**
     * Get a model for a Class Name.
     * @param  {String} name Key in the register. See #constructor.
     * @return {Function}      
     */
    getType(name) {
        return this.types[name];
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
     * Convert the config to JSON, saving the `className` property
     * to each object.
     * @return {Object}
     */
    pack(object) {
        if(Array.isArray(object)) {
            return object.map(this.pack.bind(this));
        } else if(object instanceof Object) {
            var className; 

            if(Config.isInstance(object)) {
                className = object.constructor.name
                var type = this.getType(className);

                debug("packing %s", className);

                if(type && type instanceof Object && type.serialize) {
                    debug("serializing %s", className);
                    return {
                        className,
                        serialized: type.serialize(object)
                    }
                }
            }

            var packed = Object.keys(object).reduce((host, key) => {
                var value = object[key];
                if(typeof value !== "function") host[key] = this.pack(value);
                return host;
            }, {});

            if(className) packed.className = className;

            return packed;
        } else return object;
    }

    /**
     * Revive a serilized object with classNames. This methods
     * iterates down through an object. If it encounters an
     * object that has a property `className`, it attempts to
     * find the corresponding constructor in the register
     * and creates a new instance if it's a class, otherwise
     * calls the function with *that* object as the first
     * parameter.
     * @param  {Object} object The object to revive.
     * @param  {Object} host   The place to stick the initilized properties.
     */
    unpack(object) {
        debug("unpack %j", object);
        if(Array.isArray(object)) {
            return object.map(this.unpack.bind(this));
        } else if(object instanceof Object) {
            var unpacked = Object.keys(object).reduce((host, key) => {
                if(key === "className") return host;
                host[key] = this.unpack(object[key]);
                debug("set %s = %s", key, host[key]);
                return host;
            }, {});

            if(object.className) {
                debug("new %s", object.className);
                var type = this.getType(object.className);
                if(!type) throw new Error(`Unknown type ${object.className}.`);

                if(typeof type === "object") return type.deserialize(unpacked.serialized);
                else if(Config.isClass(type)) return new type(unpacked);
                else return type(unpacked);
            } else return unpacked;
        } else return object;
    }

    /**
     * Convert the config to e JSON object. Converted back
     * to a config with config#unpack.
     * @return {Object} 
     */
    toJSON() {
        return this.pack(this.config);
    }

    /**
     * Determine whether an object is an instance of a Class (not Object).
     * @param  {Mixed}  object The object to test.
     * @return {Boolean}       
     */
    static isInstance(object) {
        return object instanceof Object && object.constructor.name !== "Object";
    }

    /**
     * Determine whether function is (ES6) class.
     * @param  {Function}  func 
     * @return {Boolean}      
     */
    static isClass(func) {
        return func.name !== "Function";
    }
}