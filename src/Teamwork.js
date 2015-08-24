import Promise from "bluebird";
import Actions, { LogAction } from "./action";
import TeamworkAPI, { LoginError } from "./TeamworkAPI";
import TeamworkParser from "./parser/TeamworkParser";
import { Debug } from "./library/Debug";

const debug = Debug("tw");

export default class Teamwork extends TeamworkAPI {
    constructor(auth, installation, actions = {}) {
        super(auth, installation);

        ["done", "undone"].forEach((actionType) => {
            if(actions[actionType]) {
                actions[actionType] = actions[actionType].map((action) => { 
                    return new Actions[action.name](action); 
                });
            } else actions[actionType] = [];
        });

        this.actions = actions;

        debug("Initilizing new Teamwork: %j", this.toJSON());
    }

    /**
     * Login to an installation with an email and password.
     * @param  {String} email        Teamwork login email.
     * @param  {String} password     Teamwork login password.
     * @param  {String} installation Teamwork installation URL.
     * @return {Promise} -> {TeamworkAPI} Authenticated Teamwork API.
     */
    static login(email, password, installation) {
        return TeamworkAPI.login(email, password, installation, Teamwork);
    }

    /**
     * Login with an auth key.
     * @param  {String} auth         Teamwork Auth key.
     * @param  {String} installation Teamwork installation URL.
     * @return {Promise} -> {TeamworkAPI} Authenticate Teamwork API.
     */
    static loginWithAuth(auth, installation) {
        return TeamworkAPI.loginWithAuth(auth, installation, Teamwork);
    }

    /**
     * Get accounts for an email and password.
     * @param  {String} email    Teamwork login email.
     * @param  {String} password Teamwork login password.
     * @return {Promise} -> {Array[Installations]}
     */
    static getAccounts(email, password) {
        return TeamworkAPI.getAccounts(email, password);
    }

    /**
     * Log time to a scope (project or task).
     * @param  {Project|Task} scope    The project or task to log time to.
     * @param {User} user The user to log the time to.
     * @return {Promise}
     */
    log(scope, user, log) {
        return this.pushAction(new LogAction({ scope, user, log }));
    }

    /**
     * Push an action into the action stack.
     * @param  {Action} action The action to push and commit.
     * @return {Promise}       The action#commit's promise.
     */
    pushAction(action) {
        // Commit the action
        return action.commit(this).then((result) => {
            return [action, result];
        }).finally(() => {
            this.actions.done.push(action);
        });
    }

    /**
     * Undo the last action.
     * @return {Promise} action#undo.
     */
    undo() {
        return Promise.try(() => {
            // Pop the latest action from the state
            var action = this.actions.done.pop();

            if(action) {
                // Actually undo the action
                return action.undo().finally(() => {
                    // Push into the undone stack and
                    // don't disturb the undo returned value
                    this.actions.undone.push(action);
                });
            }
        });
    }

    /**
     * Redo the last undone action.
     * @return {Promise} action#commit
     */
    redo() {
        return Promise.try(() => {
            var action = this.actions.undone.pop();

            if(action) return this.pushAction(action);
        });
    }

    /**
     * Convert the API to JSON.
     * @return {Object}
     */
    toJSON() {
        var api = super.toJSON();
        api.actions = this.actions;
        api.className = "Teamwork";
        return api;
    }

    /**
     * Parse an allowed rule from the TeamworkParser.
     * @param  {String} rule    duration,task,progress,commit,installation
     * @param  {String} content The content to parse from.
     * @return {Mixed}          See TeamworkParser for that rule.
     */
    static parse(rule, content) {
        try {
            return TeamworkParser.parse(content, { startRule: rule });
        } catch(err) {
            throw new ParserError(`Invalid ${rule}: "${content}"`);
        }
    }

    /**
     * Validate an email.
     * @throws {ValidationError} If email is invalid.
     * @param  {String} email Email to parse.
     * @return {String}       Email.
     */
    static validateEmail(email) {
        // TODO: Better email validation!
        if(email.indexOf("@") === -1) {
            throw new ValidationError(`Invalid email "${email}".`);
        }

        return email;
    }

    /**
     * Normalize an installation url to http://<installation>.teamwork.com
     * @param  {String} installation The installation URL.
     * @return {String}              http://<installation>.teamwork.com
     */
    static normalizeInstallationURL(installation) {
        var parsed = Teamwork.parseInstallation(installation);

        return `https://${parsed.installation}.teamwork.com`;
    }
}

export { LoginError };

export class ValidationError extends Error {
    constructor(reason) {
        super(reason);
        this.message = "Validation Error: " + reason;
    }
}

export class ParserError extends Error {
    constructor(reason) {
        super(reason);
        this.message = "Parser Error: " + reason;
    }
}