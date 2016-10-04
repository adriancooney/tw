import chalk from "chalk";
import TeamworkCLI, { CLIError } from "../TeamworkCLI";
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
        this.color = chalk;

        // Add some conventions
        this.color.option = this.color.blue;
        this.color.command = this.color.blue;
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
}