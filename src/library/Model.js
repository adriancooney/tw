export default class Model {
    /**
     * Model constructor.
     *
     * This class saves boilerplate code of setting all the values
     * of the data object to the instance and the toJSON function.
     * It takes a descriptor object which describes the data inputted.
     * The descriptor objects are simple and have two properties,
     * required and constructor (or type, but not in that sense).
     * Each property on the descriptor object corresponds to that
     * property on the inputted data object. This properties value
     * is the checked against the descriptor. The descriptor's 
     * properties can have the following values to describe the input:
     *
     *  {Boolean} required      True = required, false = not required.
     *  {Function} constructor  The constructor to call when the object 
     *                          is created with the input.
     *  {Array} multiple        Array with [required, constructor.]
     *  
     * @param  {Object} descriptor Descriptor object. See above.
     * @param  {Object} data       Data object.
     */
    constructor(descriptor, data = {}) {
        this.constructor.descriptor = descriptor;

        Object.keys(descriptor).forEach((key) => {
            var value = descriptor[key];
                
            var required = false,
                type = null;

            if(typeof value === "boolean") required = value;
            else if(Array.isArray(value)) required = value[0], type = value[1];
            else if(typeof value === "function") type = value;

            var input = data[key];

            // Check if required
            if(required && typeof input === "undefined") throw new Error(`Required field "${key}" not found.`);

            // Coercion
            if(typeof input !== "undefined" && type) {
                // Coerce each item in an array
                if(Array.isArray(input)) {
                    if(input.length) {
                        input = input.map((item) => {
                            if(type.prototype instanceof Model) return new type(item);
                            else return type.call(null, item);
                        });
                    }
                } else {
                    if(type.prototype instanceof Model) input = new type(input);
                    else input = type.call(null, input);
                }
            }

            this[key] = input;
        });
    }

    toJSON() {
        return Object.keys(this.constructor.descriptor).reduce((object, key) => {
            object[key] = this[key];
            return object;
        }, {});
    }
}