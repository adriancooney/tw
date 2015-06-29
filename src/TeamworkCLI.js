import fs from "fs";
import Path from "path";
import Promise from "bluebird";
import inquirer from "inquirer";
import chalk from "chalk";
import rc from "rc";
import Teamwork from "./Teamwork";
import TeamworkAPI from "./TeamworkAPI";
import { Debug } from "./library/Debug";

import Project from "./model/Project";
import Installation from "./model/Installation";
import Person from "./model/Person";
import Tasklist from "./model/Tasklist";
import Task from "./model/Task";

// TODO: Remove TeamworkCLI dependency from any model

/**
 * The prefix before the "rc" files. e.g. .teamworkrc
 * @type {String}
 */
const TEAMWORK_RC_PREFIX = "teamwork";

const debug = Debug("tw:cli");

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
        // logs.unshift(chalk.blue("tw"));
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
            var configPath = TeamworkCLI.getConfigPath();
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
        return Promise.try(() => {
            var config = TeamworkCLI.config;

            if(!config.api) throw new CLIError("Not logged in. Please login.");

            return new TeamworkAPI(config.api.auth, config.api.installation);
        });
    }

    /**
     * Choose the current X.
     * @param  {Boolean} list    Show as list. (Does not allow you to choose)
     * @param  {String} message The message to show in the prompt.
     * @param  {String} type    The name of list.
     * @param  {Array} items   Array of objects that have a `toListItem` implemented.
     * @return {Promise}         
     */
    static chooseCurrentItem(list, message, type, items) {
        if(!list) {
            return TeamworkCLI.prompt([{
                type: "list",
                message: message,
                name: type,
                choices: items.map((item) => {
                    return {
                        name: item.toListItem(),
                        value: item
                    }
                })
            }]).then((answers) => {
                TeamworkCLI.set(answers);
            });
        } else {
            return Promise.try(() => {
                items.forEach((item) => {
                    TeamworkCLI.log(item.toListItem());
                });
            });
        }
    }

    /**
     * Get the path to the user config file.
     * @return {String} /path/to/.teamworkrc
     */
    static getConfigPath() {
        return Path.resolve(process.env.HOME, `.${TEAMWORK_RC_PREFIX}rc`);
    }

    /**
     * Get the current project.
     * @param {String} model The name of the model.
     * @return {Model}
     */
    static getCurrent(model) {
        var data = TeamworkCLI.config[model];

        debug("Getting current %s: %j", model, data);

        if(data) {
            switch(model) {
                case "project": return new Project(data); break;
                case "installation": return new Installation(data); break;
                case "user": return new Person(data); break;
                case "tasklist": return new Tasklist(data); break;
                case "task": return new Task(data); break;
            }
        }
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