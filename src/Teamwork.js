export default class Teamwork {
    static parseTimestamp(timestamp) {

    }

    static parsePercent(percent) {

    }

    static parseTask(task) {

    }

    /**
     * Parse a teamwork installation URL.
     * @param  {String} installation The installation URL.
     * @return {Object}              { installation {String} }
     */
    static parseInstallation(installation) {
        var match = installation.match(/^(?:https?:\/\/)?(\w+)\.teamwork.com/);

        if(!match) throw new ParserError(`Invalid installation URL: ${installation}`);

        return {
            installation: match[1]
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