export default class Action {
    constructor({ commit, undo }) {
        this.commit = commit;
        this.undo = undo;
    }
}