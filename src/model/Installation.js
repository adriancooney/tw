import Model from "../library/Model";
import Company from "./Company";

export default class Installation extends Model {
    constructor(data) {
        super({
            domain: true,
            name: false,
            url: false,
            projectsEnabled: false,
            chatEnabled: false,
            deskEnabled: false,
            company: Company
        }, data);
    }

    toString() {
        return this.name ? `${this.name} (${this.domain})` : this.domain;
    }
}