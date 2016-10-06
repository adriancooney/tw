import Model from "../library/Model";

export default class Tag extends Model {
    constructor(data) {
        super({
            id: [Number, Model.required],
            name: [String, Model.required],
            color: String
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