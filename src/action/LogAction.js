import TeamworkAPI from "../TeamworkAPI";
import Action from "../library/Action";

export default class LogAction extends Action {
    constructor({ scope, log }) {
        super();
        this.scope = scope;
        this.log = log;
    }

    commit(api) {
        return TeamworkAPI.prototype.log.call(api, this.scope, this.user, this.log);
    }

    description() {
        return `Logged ${this.log.duration.humanize()} to ${this.scope.toString()}. ` +
            `\n\n\t` + this.log.description.split("\n").join("\n\t");
    }
}