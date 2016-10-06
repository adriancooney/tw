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
            id: [Number, Model.required],
            name: [String, Model.required],
            description: String,
            domain: String,
            createdAt: [moment, Model.callable],
            company: Company,
            tags: Tag,
            logo: String,
            status: String,
            starred: Boolean
        }, data);

        this.title = this.name;
    }

    /**
     * Convert the project to a String.
     * @return {String}
     */
    toString() {
        return `Project: ${this.name}`;
    }

    /**
     * Return the URL for the projects.
     * @return {String} 
     */
    getURL() {
        return `http://${this.domain}/projects/${this.id}`;
    }
}