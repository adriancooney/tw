import TeamworkAPI from "../TeamworkAPI";
import Action from "../library/Action";

export default class LogAction extends Action {
    constructor({ scope, user, log }) {
        super();
        this.scope = scope;
        this.user = user;
        this.log = log;
    }

    commit(api) {
        return TeamworkAPI.prototype.log.call(api, this.scope, this.user, this.log);
    }

    description() {
        return `Logged ${this.log.duration.humanize()} to ${this.scope.toString()}`;
    }
}