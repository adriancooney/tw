import moment from "moment";
import Action from "../model/Action";
import Log from "../model";

export default class LogAction extends Action {
    constructor({ duration, task, user, message, date }) {
        this.duration = moment.duration(duration);
        this.task = task;
        this.user = user;
        this.message = message;
        this.date = date;
    }

    commit(api) {
        return api.log(this.task, this.user, new Log(this.duration, moment(), this.message)).then((log) => {
            this.log = log;
        });
    }

    toCommitString() {
        return `Logged ${this.duration.humanize()} to ${this.task.toString()}`;
    }

    undo(api) {
        // TODO: Delete the log entry
    }
}