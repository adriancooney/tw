import Model from "../library/Model";

export default class Person extends Model {
    constructor(data) {
        super({
            id: [Number, Model.required],
            firstName: [String, Model.required],
            lastName: [String, Model.required],
            avatar: String,
            username: String
        }, data);

        this.name = `${this.firstName} ${this.lastName}`;
    }

    getNameInitialed() {
        return `${this.firstName} ${this.lastName.trim()[0].toUpperCase()}.`;
    }
}