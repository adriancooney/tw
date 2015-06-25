export default class Teamwork {
    static parseTimestamp(timestamp) {

    }

    static parsePercent(percent) {

    }

    static parseTask(task) {

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

    static parseInstallation(installation) {
        return installation;
    }
}

export class ValidationError extends Error {
    constructor(reason) {
        super();
        this.message = "Validation Error: " + reason;
    }
}