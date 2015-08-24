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
            status: false,
            starred: false
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
     * Return the URL for the projects.
     * @return {String} 
     */
    getURL() {
        return `http://${this.domain}/projects/${this.id}`;
    }
}