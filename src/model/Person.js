import { Debug } from "../library/Debug";

const debug = Debug("teamwork:model:Person");

export default class Person {
    constructor(data) {
        this.firstName = data.firstName || data['first-name'];
        this.lastName = data.lastName || data['last-name'];
        this.name = `${this.firstName} ${this.lastName}`
        this.avatar = data['avatar-url'];
        this.id = parseInt(data.id);
        debug("Creating new Person[name = \"%s\"]", this.name);
    }

    toJSON() {
        return {
            name: this.name,
            firstName: this.firstName,
            lastName: this.lastName,
            avatar: this.avatar,
            id: this.id
        }
    }

    getNameInitialed() {
        return `${this.firstName} ${this.lastName.trim()[0].toUpperCase()}.`;
    }
}