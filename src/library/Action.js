export default class Action {
    constructor() {
        this.data = {};
    }

    commit() {
        throw new Error("Action#commit has not yet been implemented.")
    }

    undo() {
        throw new Error("Action#undo has not yet been implemented");
    }

    toJSON() {

    }
}