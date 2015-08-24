import Model from "../library/Model";

export default class Company extends Model {
    constructor(data) {
        super({
            name: false,
            id: true
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