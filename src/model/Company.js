import Model from "../library/Model";

export default class Company extends Model {
    constructor(data) {
        super({
            name: String,
            id: [Number, Model.required]
        }, data);
    }

    toString() {

    }

    /**
     * Create a Task object from the Teamwork API.
     * @param {Object} data Data returned from Teamwork API.
     * @return {Task} 
     */
    static fromAPI(/* data */) {

    }
}