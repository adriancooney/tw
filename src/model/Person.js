import Model from "../library/Model";

export default class Person extends Model {
    constructor(data) {
        super({
            id: true,
            firstName: true,
            lastName: true,
            avatar: false,
            username: false
        }, data);

        this.name = `${this.firstName} ${this.lastName}`
    }

    getNameInitialed() {
        return `${this.firstName} ${this.lastName.trim()[0].toUpperCase()}.`;
    }
}