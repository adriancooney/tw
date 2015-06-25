import Company from "./Company";

export default class Installation {
    constructor(data) {
        this.domain = data.domain;
        this.url = data.url;
        this.projectsEnabled = data.projectsEnabled;
        this.chatEnabled = data.chatEnabled;
        this.deskEnabled = data.deskEnabled;
        this.name = data.name;
        this.company = new Company(data);
    }

    toListItem() {
        return `${this.name} (${this.domain})`;
    }
}