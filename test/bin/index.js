import moment from "moment";
import Promise from "bluebird";
import Teamwork from "../../src/Teamwork";
import * as cli from "../../src/cli";
import Config from "../../src/library/Config";
import { Log, Person, Task } from "../../src/model";
import { Debug } from "../../src/library/Debug";

const debug = Debug("tw:test");

// Dummy data creators
export const data = {
    task: (id) => new Task({
        id,
        title: "Clean the super glue from the radiators",
        description: "Gabe made a mess again."
    }),

    log: (id) => new Log({
        id,
        hours: 2,
        minutes: 0,
        author: data.person(1),
        date: moment(),
        description: "Scrubbing the 'glue' from the radiators. It wasn't glue at all, it was gum."
    }),

    person: (id) => new Person({
        id,
        firstName: "Gabe",
        lastName: "Newell",
        username: "gaben"
    })
};

// Our dummy API
export const api = new Teamwork("the-cake-is-a-lie", "valve.teamwork.com");
export const currentUser = data.person(1);

// Notify our test creators that they cannot use this.
cli.input.promptWithEditor = () => {
    throw new Error("TestError: Cannot prompt with editor in tests. Please write your tests to avoid encountering this. It is tested seperately and can be assumed to work.");
};

/**
 * Execute a Command with options.
 * @param  {Function} command The command class.
 * @param  {Object}   options The CLI options in key:value format. Use the special `args`
 *                            key to pass unnamed arguments.
 * @return {Promise}          
 */
export function execute(command, options = {}, config) {
    if(typeof command !== "function")
        throw new Error("The command passed to execute is not a constructor.");

    if(!options.args)
        options.args = [];
    
    if(!Array.isArray(options.args))
        throw new Error("options.args must be an array of strings.");

    debug("execute new %s(%o)", command.name, options);
    debug("$ tw-%s %s", command.name.replace("Command", "").toLowerCase(), Object.keys(options).reduce((cli, key) => {
        if(key === "args") return cli + " " + options.args.join(" ");
        else return cli + `--${key} ${options[key]} `;
    }, ""));

    if(!config) {
        // Set the current user
        config = {
            user: currentUser.toJSON()
        };
    }

    const commandInst = new command(options, new Config(config));

    //Return our dummy API instance
    commandInst.getAPI = () => Promise.resolve(api);

    return Promise.try(() => commandInst.execute(options));
}

// Some sinon helpers
export const match = {
    currentUser: () => currentUser.toJSON()
};