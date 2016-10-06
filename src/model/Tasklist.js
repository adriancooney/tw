import Model from "../library/Model";
import Project from "./Project";

export default class Tasklist extends Model {
    /**
     * Create a new Tasklist object.
     * @param  {Object} data 
     *           {Number} :id
     *           {String} :name
     *           {String} :description
     *           {Object} :project - See Project#constructor
     */
    constructor(data) {
        super({
            id: [Number, Model.callable],
            name: [String, Model.callable],
            description: String,
            domain: String,
            complete: Boolean,
            private: Boolean,
            uncompletedCount: Number,
            project: Project
        }, data);

        this.title = this.name;
    }    

    /**
     * Convert tasklist to a String.
     * @return {String}
     */
    toString() {
        return `[#${this.id}] ${this.name}`;
    }

    /**
     * Return the url for this tasklist.
     * @return {String}
     */
    getURL() {
        return `http://${this.domain}/tasklists/${this.id}`;
    }

    /**
     * Create a Task object from the Teamwork API.
     * @param {Object} data Data returned from Teamwork API.
     * @return {Task} 
     */
    static fromAPI(tasklist) {
        return new Tasklist({
            id: parseInt(tasklist.id),
            name: tasklist.name,
            description: tasklist.description,
            domain: tasklist.domain,
            complete: tasklist.complete,
            private: tasklist.private,
            uncompletedCount: parseInt(tasklist["uncompleted-count"]) || 0,
            project: {
                id: parseInt(tasklist.projectId),
                name: tasklist.projectName
            }
        });
    }
}