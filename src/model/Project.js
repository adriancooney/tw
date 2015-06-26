import Company from "./Company";

export default class Project {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.id = parseInt(data.id);
        if(data.company) this.company = new Company(data.company);
    }

    toString() {
        return `Company[name = "${this.name}, description = "${this.description}", id = ${this.id}]`;
    }

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            id: this.id,
            company: this.company
        }
    }

    toListItem() {
        return `[#${this.id}] ${this.name}`;
    }
}