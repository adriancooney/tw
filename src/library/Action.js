import { notYetImplemented } from "./Debug";

/**
 * An action needs enough information to undo and redo 
 * itself. This means a couple of things. It needs to be
 * able to revert changes to another state by taking into
 * account the current state and diffing it with the old 
 * state. It also needs to understand if can actually
 * make changes without overwriting other, previously
 * unaccounted for changes. For example, you create a task
 * and someone updates it, you can't just "undo" and delete
 * the task. 
 */
export default class Action {
    constructor(data) {
        this.data = data;
    }

    commit() {
        notYetImplemented(this.contructor.name, "commit");
    }

    undo() {
        notYetImplemented(this.contructor.name, "undo");
    }

    toJSON() {
        return {
            name: this.constructor.name,
            data: this.data
        }
    }
}