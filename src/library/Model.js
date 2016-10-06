export default class Model {
    static property = 0;
    static required = 1;
    static callable = 2; // Flag will tells us type is function and not constructor (i.e. no new)

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

        Object.keys(descriptor).forEach(fieldName => {
            const field = descriptor[fieldName];
            let input = data[fieldName];
            let type = field, flags = Model.property;

            if(Array.isArray(field)) {
                // Allow for array contains [type, flags]
                type = field[0];
                flags = field[1];
            }

            // Expand the flags to an object
            flags = Model.expandFieldFlags(flags);

            // Validate the field based on the args (throws args if it fails)
            Model.validateField(flags, fieldName, input); 

            // Coercion of Model types, otherwise just call the function with the input
            if(typeof input !== "undefined") {
                // Coerce each item in an array
                if(Array.isArray(input) && input.length) {
                    input = input.map(Model.coerceField.bind(null, type, flags));
                } else input = Model.coerceField(type, flags, input);
            }

            // Finally, save it to the model
            this[fieldName] = input;
        });
    }

    toJSON() {
        return Object.keys(this.constructor.descriptor).reduce((object, key) => {
            object[key] = this[key];
            return object;
        }, {});
    }

    static validateField(flags, fieldName, value) {
        if(flags.required && typeof value === "undefined")
            throw new Error(`Required field "${fieldName}" not found.`);
    }

    static coerceField(type, flags, value) {
        if(type === "string" || type === String) return value.toString();
        else if(type === "number" || type === Number) return parseInt(value);
        else if(type === "boolean" || type === Boolean) return !!value;
        else if(flags.callable) return type(value);
        else return new type(value);
    }

    static expandFieldFlags(flags) {
        return {
            required: (flags & Model.required) === Model.required,
            callable: (flags & Model.callable) === Model.callable
        };
    }
}