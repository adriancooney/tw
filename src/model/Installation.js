import Model from "../library/Model";
import Company from "./Company";

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

    static parse(domain) {
        return new Installation({ domain });
    }
}