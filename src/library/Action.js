import moment from "moment";

export default class Action {
    constructor({ name, timestamp }) {
        this.name = name;
        this.timestamp = moment();
    }
}