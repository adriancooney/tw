import fs from "fs";
import Path from "path";
import Promise from "bluebird";
import inquirer from "inquirer";
import chalk from "chalk";
import rc from "rc";
import Teamwork from "./Teamwork";
import { Debug } from "./library/Debug";

/**
 * The prefix before the "rc" files. e.g. .teamworkrc
 * @type {String}
 */
const TEAMWORK_RC_PREFIX = "teamwork";

const debug = Debug("teamwork:cli");

export default class TeamworkCLI {
    /**
     * Fail to execute and exit with a reason and code.
     * @param  {String} reason The reason for the exit.
     * @param  {Number} code   The exit code (default: 1)
     */
    static fail(reason, code = 1) {
        if(reason instanceof Error) {
            debug(reason.stack);
            reason = reason.message;
        }

        TeamworkCLI.log(chalk.red("error"), reason);
        process.exit(code);
    }

    /**
     * Log output to the console.
     * @param  {...*} logs Anything to pass to console.log.
     */
    static log(...logs) {
        logs.unshift(chalk.blue("tw"));
        console.log.apply(console, logs);
    }

    /**
     * Validate some input and exit the program if it fails.
     * @param  {Function}    validator The validator which throws ValidationError.
     * @param  {...*} input     Input to pass to the
     * @return {*}              Output from the validator.
     */
    static validateInput(validator, ...input) {
        try {
            return validator.apply(null, input);
        } catch(err) {
            TeamworkCLI.fail(err.message);
        }
    }

    /**
     * Inquirer validation requires either `true` returned
     * for valid input or a {String} for invalid input which
     * also serves as the error message. This function converts
     * Teamwork validation scheme to Inquirer's scheme.
     * @param  {Function} validator The validation function.
     * @param  {...*} ..input   Input passed to the validator.
     * @return {true|String}          True if valid, String as error message if invalid.
     */
    static inquirerValidateInput(validator, ...input) {
        try {
            validator.apply(null, input);
            return true;
        } catch(err) {
            return err.message;
        }
    }

    /**
     * Promisfy Inquirer's prompt.
     * @param  {Array} questions See Inquirer#prompt.
     * @return {Promise} -> {Answers}
     */
    static prompt(questions) {
        return new Promise((resolve, reject) => {
            inquirer.prompt(questions, resolve);
        });
    }

    /**
     * Set a preference in the config.
     * @param {String} name  The name of the property.
     * @param {*} value The value of the preference. (JSON)
     * @return {Promise}
     */
    static set(name, value) {

        return new Promise((resolve, reject) => {
            if(typeof name === "object") {
                for(var key in name) {
                    debug("config set %s = %j", key, name[key]);
                    TeamworkCLI.config[key] = name[key];
                }
            } else {
                debug("config set %s = %j", name, value);
                TeamworkCLI.config[name] = value;
            }

            // And write the config
            return TeamworkCLI.writeConfig(TeamworkCLI.config);
        });
    }

    /**
     * Create or rewrite config file for the User in ~/.teamworkrc
     * @param {Object} config The config object.
     * @return {Promise} 
     */
    static writeConfig(config) {
        // TODO: Write config file to custom location
        return new Promise((resolve, reject) => {
            var configPath = Path.resolve(process.env.HOME, `.${TEAMWORK_RC_PREFIX}rc`);
            fs.writeFile(configPath, JSON.stringify(config), function(err) {
                if(err) reject(err);
                else {
                    debug("Writing config to %s.", configPath);
                    resolve();
                }
            });
        });
    }

    /**
     * Return an authenticated instance of the Teamwork API
     * from the config.
     * @return {Promise}
     */
    static getAPI() {
        Promise.try(() => {
            var config = TeamworkCLI.config;

            if(!config.api) throw new CLIError("Not logged in. Please login again.");

            return new TeamworkAPI(config.api.auth, config.api.installation);
        });
    }
}

// Export handy acces to Chalk
TeamworkCLI.color = chalk;

// Use rc to find the config
TeamworkCLI.config = rc(TEAMWORK_RC_PREFIX);

export class CLIError extends Error {
    constructor(reason, code) {
        super(reason);
        this.message = reason;
        this.code = code;
    }
}