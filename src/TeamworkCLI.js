import fs from "fs";
import Path from "path";
import Promise from "bluebird";
import inquirer from "inquirer";
import chalk from "chalk";
import rc from "rc";
import tmpdir from "os-tmpdir";
import editor from "editor";
import Teamwork from "./Teamwork";
import TeamworkAPI from "./TeamworkAPI";
import { Debug } from "./library/Debug";

import {
    Log,
    Task,
    User,
    Person,
    Project,
    Tasklist,
    Installation,
} from "./model";

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
 * Simple store of colors for priority.
 * @type {Object}
 */
const PRIORITY_COLORS = {
    "high": "red",
    "medium": "magenta" // I know the website uses yellow but tasks are yellow.
};

// Promisify fs
Promise.promisifyAll(fs);

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
        var configPath = TeamworkCLI.getConfigPath();

        return fs.writeFileAsync(configPath, JSON.stringify(config)).then(() => {
            debug("Config saved to %s.", configPath);
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

            var api = new TeamworkAPI(config.api.auth, config.api.installation);

            // Overwrite the request method so that
            // we can set the loading state of the CLI
            var self = this, request = api.request;
            api.request = function() {
                self.loading(true);
                return request.apply(this, arguments).finally(() => {
                    self.loading(false);
                });
            };

            return api;
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
                        name: item.toCLIString(),
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
            tasks = tasks.map((task) => {
                return task.toString() + "\n" + task.getURL();
            }).join("\n\n") + "\n\n";

            // Add it to the commit
            return message.replace(/# Please enter the commit/, tasks + "# Please enter the commit");
        });
    }}

// Export handy acces to Chalk
TeamworkCLI.color = chalk;

// Use rc to find the config
TeamworkCLI.config = rc(TEAMWORK_RC_PREFIX, {}, () => {});

export class CLIError extends Error {
    constructor(reason, code) {
        super();
        this.message = `${reason.replace(/\.?$/, ".")} Please see ${TeamworkCLI.color.blue("--help")} for more information.`;
        this.code = code;
    }
}

/*
 * Override any toString to add some color and frills
 */
Log.prototype.toCLIString = function() {
    return `${TeamworkCLI.color.green(this.author.getNameInitialed())} logged ${TeamworkCLI.color.magenta(this.duration.humanize())} ${this.date.calendar()}.\n > ${this.description.split("\n").join("\n > ")}` 
};

Project.prototype.toCLIString = function() {
    return `[#${this.id}] ${TeamworkCLI.color.underline(this.name)}`;
};

Tasklist.prototype.toCLIString = function() {
    return `[#${this.id}] ${TeamworkCLI.color.bold(this.name)}`;
};

Task.prototype.toCLIString = function(detailed = true){
    var details = [];
    details.push(this.getProgress())

    if(detailed) {
        if(this.assigned) details.push(TeamworkCLI.color.green(this.assigned.getNameInitialed()));
        if(this.priority) {
            var color = PRIORITY_COLORS[this.priority];
            details.push(color ? TeamworkCLI.color[color](this.priority) : this.priority);
        }
    }

    details = details.join(", ");

    return `[#${this.id}] ${TeamworkCLI.color.yellow(this.title)} (${details})`
};

Installation.prototype.toCLIString = function() {
    return `${TeamworkCLI.color.cyan(this.name)} (${this.domain})`;
};