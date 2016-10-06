import Model from "../library/Model";
import Company from "./Company";
import Teamwork from "../Teamwork";

export default class Installation extends Model {
    constructor(data) {
        super({
            domain: [String, Model.required],
            name: String,
            url: String,
            projectsEnabled: Boolean,
            chatEnabled: Boolean,
            deskEnabled: Boolean,
            company: Company
        }, data);
    }

    toString() {
        return this.name ? `${this.name} (${this.domain})` : this.domain;
    }

    static parse(url) {
        return new Installation({ domain: Teamwork.parse("installation", url) });
    }
}