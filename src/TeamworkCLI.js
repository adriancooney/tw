import fs from "fs";
import Path from "path";
import Promise from "bluebird";
import inquirer from "inquirer";
import chalk from "chalk";
import rc from "rc";
import moment from "moment";
import tmpdir from "os-tmpdir";
import editor from "editor";
import commander from "commander";
import Teamwork from "./Teamwork";
import { Debug } from "./library/Debug";
import Config from "./library/Config";
import TeamworkAPI from "./TeamworkAPI";

import Models, {
    Log,
    Tag,
    Task,
    Person,
    Project,
    Company,
    Tasklist,
    Installation,
} from "./model";

// import {
//     LogAction
// } from "./action";

/**
 * The prefix before the "rc" files. e.g. .teamworkrc
 * @type {String}
 */
const TEAMWORK_RC_PREFIX = "teamwork";

/**
 * The frames of the loaders.
 * @type {Array}
 */
const LOADER = ["|", "/", "-", "\\", "|", "/", "-", "\\"];

/**
 * The default pretty color outputter.
 * @type {String}
 */
const REPORTER = "default";

// Promisify fs
Promise.promisifyAll(fs);

const debug = Debug("tw:cli");

export default class TeamworkCLI {
    static init() {
        // Export handy acces to Chalk
        TeamworkCLI.color = chalk;

        // Handle uncaught exceptions
        process.on("uncaughException", TeamworkCLI.fail);

        // Overwrite the request method so that
        // we can set the loading state of the CLI
        var request = TeamworkAPI.request;

        TeamworkAPI.request = function() {
            // Set loading CLI to loading
            TeamworkCLI.loading(true);

            // Execute the request
            return request.apply(null, arguments).finally(() => {
                TeamworkCLI.loading(false);
            });
        };

        // Require the reporter
        require(`./reporter/${REPORTER}`);
    }

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
     * Prompt the user to enter content with
     * the $EDITOR. 
     * @param  {String} content The content to be placed in the editor.
     * @return {Promise} -> {String} The new content (minus the `content` parameter).
     */
    static promptWithEditor(content) {
        // Create a temporary file in the os.tmpdir()
        var tmpfile = Path.join(tmpdir(), String(Math.random() * 100000));

        if(content) {
            content = "\n\n" + TeamworkCLI.indent(content);
        } else content = "";

        // Write the initial content to it
        return fs.writeFileAsync(tmpfile, content).then(() => {
            return new Promise((resolve, reject) => {
                editor(tmpfile, (code) => {
                    resolve(code);
                });
            });
        }).then((code) => {
            if(code !== 0) throw new CLIError("Editor did not exit properly. Please try again.");

            // Read the contents of the file
            return fs.readFileAsync(tmpfile);
        }).then((contents) => {
            contents = contents.toString().replace(/\n$/, "");
            content = content.trim();

            // Make sure they haven't touched anything below the boundry
            var contentAfter = contents.substr(-content.length).trim();

            // Bad user! Fail since they touched below the boundry. We can't accurately remove
            // the footer unless we change to another scheme.
            // TODO: Experiment with removing everything after # symbols as boundry.
            if(contentAfter !== content) throw new CLIError("Editor error. Please only edit anything above the boundry.");

            return contents.replace(content, "");
        }).finally(() => {
            // Delete the file regardless of the outcome
            return fs.unlinkAsync(tmpfile);
        });
    }

    /**
     * Set a preference in the config.
     * @param {String} name  The name of the property.
     * @param {*} value The value of the preference. (JSON)
     * @return {Promise}
     */
    static save(key, value) {
        if(key) TeamworkCLI.config.set(key, value);
        return TeamworkCLI.writeConfig(TeamworkCLI.config);
    }

    /**
     * Create or rewrite config file for the User in ~/.teamworkrc
     * @param {Object} config The config object.
     * @return {Promise} 
     */
    static writeConfig(config) {
        // TODO: Write config file to custom location
        var configPath = TeamworkCLI.getConfigPath();

        return fs.writeFileAsync(configPath, JSON.stringify(config, null, 2)).then(() => {
            debug("Config saved to %s.", configPath);
        });
    }

    /**
     * Read in the config.
     * @return {Object} Config.
     */
    static readConfig() {
        return new Config(rc(TEAMWORK_RC_PREFIX, {}, () => {}));
    }

    /**
     * Delete the config.
     * @return {Promise}
     */
    static deleteConfig() {
        var configPath = TeamworkCLI.getConfigPath();
        return fs.unlinkSync(configPath);
    }

    /**
     * Return an authenticated instance of the Teamwork API
     * from the config.
     * @return {Promise}
     */
    static getAPI() {
        return Promise.try(() => {
            // If we have a cached version, return it
            if(TeamworkCLI.api) return TeamworkCLI.api;

            var api = TeamworkCLI.config.get("api");

            if(!api) throw new CLIError("Not logged in. Please login.");

            return new Teamwork(api.auth, api.installation);
        });
    }

    /**
     * Set the current API deails.
     * @param {TeamworkAPI} api The teamwork API.
     */
    static setAPI(api) {
        TeamworkCLI.config.set("api", {
            auth: api.auth,
            installation: api.installation.domain
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
            var current = TeamworkCLI.getCurrent(type);

            return TeamworkCLI.prompt([{
                type: "list",
                message: message,
                name: type,
                choices: items.map((item) => {
                    var str = item.toCLIString();

                    // Highlight the current item
                    if(current && item.id === current.id) 
                        str = `${TeamworkCLI.color.yellow(str)} ${TeamworkCLI.color.blue("(current)")}`;

                    return {
                        name: str,
                        value: item
                    }
                })
            }]).then((answers) => {
                return TeamworkCLI.save(answers);
            });
        } else {
            return Promise.try(() => {
                items.forEach((item) => {
                    TeamworkCLI.log(item.toCLIString());
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
        var data = TeamworkCLI.config.get(model);

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

    /**
     * Set the current model.
     * @param {String} model    The name of the model.
     * @param {Mixed} instance The instance of the model.
     */
    static setCurrent(model, instance) {
        return TeamworkCLI.config.set(model, instance);
    }

    /**
     * Display or hide a loading indicator.
     * @param  {Boolean} isLoading Whether or not to display or hide the indicator.
     */
    static loading(isLoading) {
        if(!this.isLoading && isLoading) {
            TeamworkCLI.isLoading = true;

            // Show the loading bar
            TeamworkCLI.ui = new inquirer.ui.BottomBar();
            TeamworkCLI.loaderFrame = 0;

            (function tick() {
                TeamworkCLI.ui.updateBottomBar(LOADER[TeamworkCLI.loaderFrame]);
                TeamworkCLI.loaderFrame = TeamworkCLI.loaderFrame < (LOADER.length - 1) ? TeamworkCLI.loaderFrame + 1 : 0;
                TeamworkCLI.loaderAnimation = setTimeout(tick, 200);
            })();
        } else if(this.isLoading && !isLoading) {
            TeamworkCLI.isLoading = false;

            clearTimeout(TeamworkCLI.loaderAnimation);
            TeamworkCLI.ui.updateBottomBar("");
            TeamworkCLI.ui.close();
            TeamworkCLI.ui = null;
        }
    }

    /**
     * Indent a block of text by characters.
     * @param  {String} block The block of text to indent.
     * @param  {String} chars Stirng to indent with.
     * @return {String}       Indented block.
     */
    static indent(block, chars = "# ") {
        return chars + block.split("\n").join("\n" + chars);
    }

    /**
     * Expand a commit message.
     * @param  {String} message Commit message.
     * @return {Promise} -> {String}
     */
    static expandCommitMessage(message) {
        var tasks = [];

        // Find all the task ID's or URL
        message = message.replace(/\#(\d+)|(?:https?:\/\/)?\w+\.teamwork\.com\/tasks\/(\d+)(?:\.json)?/g, (match, id1, id2) => {
            var id = parseInt(id1 || id2, 10);
            tasks.push(id);
            return "#" + id;
        });

        // Remove any duplicates
        tasks = tasks.reduce((flattened, id) => {
            if(flattened.indexOf(id) === -1) flattened.push(id);
            return flattened;
        }, []);

        if(tasks.length) {
            return TeamworkCLI.getAPI().then((api) => {
                // Get all the tasks
                return Promise.map(tasks, api.getTaskByID.bind(api), { concurrency: 1 });
            }).catch((err) => {
                if(err.code === 404) {
                    var installation = TeamworkCLI.getCurrent("installation");
                    throw new CLIError(`Task #${err.id} not found in ${installation.toCLIString()}.`);
                } else throw err;
            }).then((tasks) => {
                // Generate the task index
                tasks = "\n" + tasks.map((task) => {
                    return task.toString() + "\n" + task.getURL();
                }).join("\n\n");

                // Add it to the commit
                var standardCommit = /# Please enter the commit/;

                if(message.match(standardCommit)) message = message.replace(standardCommit, tasks+ "\n\n# Please enter the commit");
                else message += tasks;

                return message;
            });
        } else return Promise.resolve(message);
    }

    /**
     * Process commit messages and generate actions. See parser/TeamworkParser.pegjs
     *         
     * @param  {String} message Commit message.
     * @return {Promise} -> {Array[Action]}
     */
    static processCommitMessage(message) {
        // This is just the most awesome thing ever. PEGjs, everyone.
        return Promise.try(() => {
            // Parse the actions from the commit message
            var actions = Teamwork.parse("commit", message);

            // Execute them
            if(actions.length) {
                return TeamworkCLI.getAPI().then((api) => {
                    return Promise.map(actions, (action) => {
                        switch(action.name) {
                            case "Log": 
                                // Gather all the information required for the action
                                var user = TeamworkCLI.getCurrent("user");

                                // Get the task detail
                                return api.getTaskByID(action.task).then((task) => {
                                    var duration = moment.duration(action.duration);

                                    // And log to Teamwork
                                    return api.log(task, user, Log.create(duration, moment().subtract(duration), message));
                                });
                            break;
                        }
                    });
                });
            }
        });
    }

    /**
     * Create a command that handles errors and saving state.
     * @param  {Function} callback Callback -> Promise.
     * @return {Promise}            
     */
    static command(callback) {
        // Read in the config
        TeamworkCLI.config = TeamworkCLI.readConfig();
        debug("Reading in config:", TeamworkCLI.config);

        return Promise.try(callback).then(() => {
            // Save the config
            return TeamworkCLI.writeConfig(TeamworkCLI.config);
        }).catch(TeamworkCLI.fail);
    }
}

// And go!
TeamworkCLI.init();

/**
 * CLIError. Elegantly throw CLI errors which
 * allow you to exit the program with the appropriate
 * code.
 */
export class CLIError extends Error {
    constructor(reason, code) {
        super();
        this.message = `${reason.replace(/\.?$/, ".")} Please see ${TeamworkCLI.color.blue("--help")} for more information.`;
        this.code = code;
    }
}