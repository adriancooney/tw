import moment from "moment";
import Model from "../library/Model";
import Company from "./Company";
import Tag from "./Tag";

export default class Project extends Model {
    /**
     * Create a new Project object.
     * @param  {Object} data 
     *           {Number} :id
     *           {String} :name
     *           {String} :description
     *           {Object} :company - See Company#constructor.
     */
    constructor(data) {
        super({
            id: true,
            name: true,
            description: false,
            domain: false,
            createdAt: moment,
            company: Company,
            tags: Tag,
            logo: false,
            status: false
        }, data);
    }

    /**
     * Convert the project to a String.
     * @return {String}
     */
    toString() {
        return `[#${this.id}] ${this.name}`;
    }

    /**
     * Create a Project object from the Teamwork API.
     * @param {Object} data Data returned from Teamwork API.
     * @return {Task} 
     */
    static fromAPI(data) {

    }
}