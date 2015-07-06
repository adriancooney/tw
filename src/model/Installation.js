import Model from "../library/Model";
import Company from "./Company";
import Teamwork from "../Teamwork";

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

    static parse(url) {
        return new Installation({ domain: Teamwork.parse("installation", url) });
    }
}