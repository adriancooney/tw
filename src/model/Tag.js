import Model from "../library/Model";

export default class Tag extends Model {
    constructor(data) {
        super({
            id: true,
            name: true,
            color: false
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