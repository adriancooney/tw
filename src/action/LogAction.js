import TeamworkAPI from "../TeamworkAPI";
import Action from "../library/Action";

export default class LogAction extends Action {
    constructor({ scope, user, log, timestamp }) {
        super("LogAction", timestamp);

        this.scope = scope;
        this.user = user;
        this.log = log;
    }

    commit(api) {
        return TeamworkAPI.prototype.log.call(api, this.scope, this.user, this.log);
    }

    undo(api) {
        console.log("Undoing logs.");
    }

    toString() {
        return `Logged ${this.log.duration.humanize()} to ${this.scope.toString()}`;
    }
}