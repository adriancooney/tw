import Promise from "bluebird";
import commander from "commander";
import TeamworkAPI from "../TeamworkAPI";
import * as state from "./state";
import * as output from "./output";
import { CLIError } from "./error";
import { Debug } from "../library/debug";

const debug = Debug("tw:cli:run");

/**
 * Run a command.
 * @param  {Function} command The command constructor.
 * @param  {Array}    argv    The argv to pass to the command.
 * @return {Promise}
 */
export function run(command, argv = process.argv) {
    // Handle uncaught exceptions
    process.on("uncaughException", output.fail);

    // Overwrite the request method so that
    // we can set the loading state of the CLI
    var request = TeamworkAPI.request;

    TeamworkAPI.request = function() {
        // Set loading CLI to loading
        output.loading(true);

        // Execute the request
        return request.apply(null, arguments).catch({
            code: "ENOTFOUND"
        }, err => {
            debug(err.stack);
            throw new CLIError("Unable to connect to the internet. Please connect and try again.", "ENOTFOUND", false);
        }).finally(() => {
            output.loading(false);
        });
    };

    return Promise.try(() => {
        // Read in the config (sync)
        const config = state.readConfig();

        // Setup the command
        const commandInst = new command(commander, config);

        // Setup the arguments and options (CLI switches)
        commandInst.setup(commander);

        if(typeof argv === "string")
            argv = argv.split(" ");

        // Parse the arguments via Commander. Commander
        // WILL exit the process here if it finds something wrong.
        commander.parse(argv);

        // Get the options and add the arguments
        const options = commander.opts();
        options.args = commander.args;

        // Execute the command
        return commandInst.execute(options).then(() => {
            debug("saving config file");
        });
    }).catch(output.fail);
}