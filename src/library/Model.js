export default class Model {
    static property = 0;
    static required = 1;
    static fn = 2; // Flag will tells us type is function and not constructor (i.e. no new)

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
            const field = descriptor[key];
            let fieldOptions = {};

            if(typeof field === "function") fieldOptions.type = field;
            else if(Array.isArray(field) && field.length === 2 && typeof field[0] === "function" && typeof field[1] === "number") {
                // Allow for array contains [type, flags]
                fieldOptions.type = field[0];

                // Expand the flags to the field options object
                Model.getFieldOptions(field[1], fieldOptions);
            } else throw new Error(`Invalid field descriptor passed to ${this.constructor.name}. Must be flags or [flags, Class].`);

            let input = data[key];

            // Check if required
            if(fieldOptions.required && typeof input === "undefined") 
                throw new Error(`Required field "${key}" not found.`);

            // Coercion of Model types, otherwise just call the function with the input
            if(typeof input !== "undefined") {
                // Coerce each item in an array
                if(Array.isArray(input) && input.length) {
                    input = input.map((item) => {
                        if(fieldOptions.fn) return fieldOptions.type.call(null, item);
                        else return new fieldOptions.type(item);
                    });
                } else {
                    if(fieldOptions.fn) return fieldOptions.type.call(null, input);
                    else return new fieldOptions.type(input);
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

    static getFieldOptions(flags, options = {}) {
        options.required = (flags & Model.required) === Model.required;
        options.fn = (flags & Model.fn) === Model.fn;
        return options;
    }
}