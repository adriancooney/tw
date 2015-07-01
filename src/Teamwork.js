import moment from "moment";
import TeamworkParser from "./parser/TeamworkParser";
import Installation from "./model/Installation";

export default class Teamwork {
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

    static processActions(actions) {
        return Promise.map(actions, TeamworkCLI.processAction, { concurrency: 1 });
    }

    static processAction(action) {
        return 
    }
}

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