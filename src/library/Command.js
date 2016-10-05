import chalk from "chalk";
import Promise from "bluebird";
import * as cli from "../cli";
import { CLIError } from "../cli/error";
import Teamwork, { ParserError } from "../Teamwork";
import { 
    Installation,
    Tasklist,
    Project, 
    Person,
    Task
} from "../model";

export default class Command {
    constructor(command, config) {
        this.command = command;
        this.config = config;
        this.color = cli.format.color;
    }

    /**
     * Return an authenticated instance of the Teamwork API
     * from the config.
     * @return {Promise}
     */
    getAPI(fresh = false) {
        return Promise.try(() => {
            // If we have a cached version, return it
            if(!fresh && this.api) return this.api;

            const api = this.config.get("api");

            // If the `api` property on config isn't set, it mean's the user hasn't logged in.
            if(!api) 
                throw new CLIError("Not logged in. Please login.");

            return (this.api = new Teamwork(api.auth, api.installation));
        });
    }

    /**
     * Get the current project.
     * @param {String} model The name of the model.
     * @return {Model}
     */
    getCurrent(model) {
        var data = this.config.get(model);

        if(data) {
            switch(model) {
                case "project":         return new Project(data); 
                case "installation":    return new Installation(data);
                case "user":            return new Person(data);
                case "tasklist":        return new Tasklist(data);
                case "task":            return new Task(data);
            }
        }
    }

    /**
     * Set the current model.
     * @param {String} model    The name of the model.
     * @param {Mixed} instance The instance of the model.
     */
    setCurrent(model, instance) {
        return this.config.set(model, instance);
    }

    /**
     * Add the scope options to the command. Scope defines either a
     * project, tasklist or task.
     * 
     * @param {commander} command
     */
    addScopeOptions(command, copy) {
        command
            .option("-p, --project <project>", `${copy} a project.`)
            .option("-s, --tasklist <tasklist>", `${copy} a tasklist.`)
            .option("-t, --task <task>", `${copy} a task.`)
            .option("-P, --current-project", `${copy} the current project.`)
            .option("-S, --current-tasklist", `${copy} the current tasklist.`)
            .option("-T, --current-task", `${copy} the current task.`);
    }

    /**
     * Return the scope from the options passed.
     * @param  {TeamworkAPI} api     API instance.
     * @param  {Object} options The options object received from commander.
     * @return {Promise}
     */
    getScopeFromOptions(api, options) {
        // Find the item they want to log the time to
        return ["task", "tasklist", "project"].reduce((scope, type) => {
            const capType = type[0].toUpperCase() + type.substr(1);

            if(scope && (options[type] || options[`current${capType}`])) {
                // Make sure they haven't specified more than one scope
                throw new CLIError(`Clashing log targets. Please only specify a task ${this.color.option("-t")},`
                    + ` tasklist ${this.color.option("-s")} or project ${this.color.option("-p")}.`);
            } else if(scope) return scope;

            // They passed in an explicit task, tasklist or project
            if(options[type]) {
                // Thank god for API consistency.
                // Get the from the API the item type by Id. We query the API for the item to 
                // see if it exists and to display information about what we just logged to.
                return api[`get${capType}ByID`](Teamwork.parse(type, options[type]))
            } else if(options[`current${capType}`]) {
                let scope = this.getCurrent(type);

                if(!scope)
                    throw new CLIError(`Current ${type} is not set. Please use ${this.color.command("tw select")} to pick a ${type}.`);

                return Promise.resolve(scope);
            }
        }, null) || Promise.resolve();
    }

    /**
     * Get the scope from the passed options. If it does
     * not exist, throw an error.
     * @param  {TeamworkAPI} api     API instance.
     * @param  {Object}      options The options object received by commander.
     * @return {Promise}
     */
    requireScopeFromOptions(api, options) {
        return this.getScopeFromOptions(api, options).then(scope => {
            if(!scope)
                throw new Error(`Please provide a target to log to with ${this.color.option("-t")},` 
                    + ` tasklist ${this.color.option("-s")} or project ${this.color.option("-p")} switches.`);

            return scope;
        });
    }
}