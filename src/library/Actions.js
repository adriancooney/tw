import * as actions from "../action";

/**
 * The amount of actions to save before removing.
 * @type {Number}
 */
export const MAX_COMMIT_LOG_SIZE = 15;

export default class Actions {
    constructor(commitLog, redoLog) {
        this.commitLog = commitLog || [];
        this.redoLog = redoLog || [];
    }

    push(action) {
        // Clear the redo log when a new action is committed
        this.redoLog.length = 0;

        this.commitLog.push(action);

        if(this.commitLog.length > MAX_COMMIT_LOG_SIZE)
            this.commitLog.shift();
    }

    undo() {
        if(!this.commitLog.length)
            throw new Error("Nothing to undo.");

        const action = this.commitLog.pop();

        return action.undo().then(() => {
            this.redoLog.push(action);
        });
    }

    redo() {
        if(!this.redoLog.length)
            throw new Error("Nothing to redo.");

        const action = this.redoLog.pop();

        return action.commit().then(() => {
            this.commitLog.push(action);
        });
    }

    toJSON() {
        return {
            commitLog: this.commitLog,
            redoLog: this.redoLog
        }
    }

    static getAction(name, data) {
        const action = actions[name];

        if(!action)
            throw new Error(`Unknown action "${name}".`);

        if(data) return new action(data);
        else return action;
    }

    static create({ commitLog = [], redoLog = [] }) {
        const mapper = action => Action.getAction(action.name, action.data);
        return new Actions(commitLog.map(mapper), redoLog.map(mapper));
    }
}