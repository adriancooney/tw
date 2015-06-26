import moment from "moment";
import Installation from "./model/Installation";

export default class Teamwork {
    /**
     * Parses a Teamwork timestamp.
     * @param  {String} timestamp See spec.
     * @return {moment.duration}
     */
    static parseTimestamp(timestamp) {
        var hours = timestamp.match(/(\d+)h/),
            minutes = timestamp.match(/(\d+)m/);

        if(hours || minutes) {
            return moment.duration({
                minutes: minutes ? parseInt(minutes[1]) : undefined,
                hours: hours ? parseInt(hours[1]) : undefined
            });
        } else throw new ParserError(`Invalid timestamp "${timestamp}".`);
    }

    /**
     * Parse a commit and return intentions.
     * @param  {String} msg Commit msg.
     * @return {Object}     { tasks, }
     */
    static parseCommit(msg) {
        // TODO: Multiple actions of the same type in the one message
        // Attempt to find logs
        return [
            // I'm not sure if this is a good way to go about it but I don't care anymore
            { type: "log", groups: ["duration", "task"], regex: /log\s+(\d+[hm](?:\d+[hm])?)\s+to\s+#(\d+)/i },
            { type: "close", groups: ["task"], regex: /close\s+#(\d+)/i }
        ].reduce((intentions, matcher) => {
            var matches = msg.match(matcher.regex);

            if(matches) {
                intentions.push({
                    action: matcher.type,
                    data: matcher.groups.reduce((store, group, i) => {
                        store[group] = matches[i + 1];
                        return store;
                    }, {})
                });
            } 

            return intentions;
        }, []);
    }

    static parsePercent(percent) {

    }

    /**
     * Parse a teamwork task.
     * @param  {Task} task 
     * @return {Number}
     */
    static parseTask(task) {
        var id = task.match(/#(\d+)/);

        if(!id) throw new ParserError(`Invalid task "${task}".`);

        return id[1];
    }

    /**
     * Parse a teamwork installation URL.
     * @param  {String} installation The installation URL.
     * @return {Object}              { installation {String} }
     */
    static parseInstallation(installation) {
        var match = installation.match(/^(?:https?:\/\/)?(\w+)\.teamwork.com/);

        if(!match) throw new ParserError(`Invalid installation URL: ${installation}`);

        return new Installation({
            domain: match[1] + ".teamwork.com"
        });
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