export default class Config {
    constructor(register = {}, config = {}) {
        this.register = register;

        this.revive(config, this);
    }

    getModel(name) {
        return this.register[name];
    }

    revive(object, host) {
        Object.keys(object).forEach((key) => {
            var value = object[key];

            if(value instanceof Object && value.className) {
                var className = value.className;
                delete value.className;

                var model = this.getModel(className);

                if(!model) throw new Error(`Unknown model ${className}.`);

                object = (host || object);

                if(model instanceof Function && model.name !== "function") object[key] = new model(value);
                else if(model instanceof Function) object[key] = model(value);
            } else if(value instanceof Object) this.revive(value);
        });
    }

    set(key, value) {
        if(key instanceof Object) Object.keys(key).forEach((prop) => { this.set(prop, key[prop]); });
        else this[key] = value;
    }

    toJSON() {
        return Object.keys(this).reduce((host, key) => {
            if(key === "register") return host;

            var value = this[key];

            if(value instanceof Object && value.constructor.name !== "Object") {
                var className = value.constructor.name;
                if(value.toJSON) value = value.toJSON();
                value.className = className;
            }

            host[key] = value;

            return host;
        }, {});
    }
}