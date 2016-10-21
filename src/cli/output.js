import inquirer from "inquirer";
import { Debug } from "../library/debug";
import { color } from "./format";

// Export the theme
export * from "./theme/default";

const debug = Debug("tw:cli");

/**
 * The frames of the loaders.
 * @type {Array}
 */
const LOADER = ["|", "/", "-", "\\", "|", "/", "-", "\\"];

/**
 * The state object for the loader.
 * @type {Object}
 */
const loadingState = {};

/** @type {String} Tick mark. */
export const TICK = "✓";

/**
 * Display or hide a loading indicator.
 * @param  {Boolean} isLoading Whether or not to display or hide the indicator.
 */
export function loading(isLoading) {
    if(!loadingState.isLoading && isLoading) {
        loadingState.isLoading = true;

        // Show the loading bar
        loadingState.ui = new inquirer.ui.BottomBar();
        loadingState.loaderFrame = 0;

        (function tick() {
            loadingState.ui.updateBottomBar(LOADER[loadingState.loaderFrame]);
            loadingState.loaderFrame = loadingState.loaderFrame < (LOADER.length - 1) ? loadingState.loaderFrame + 1 : 0;
            loadingState.loaderAnimation = setTimeout(tick, 200);
        })();
    } else if(loadingState.isLoading && !isLoading) {
        loadingState.isLoading = false;

        clearTimeout(loadingState.loaderAnimation);
        loadingState.ui.updateBottomBar("");
        loadingState.ui.close();
        loadingState.ui = null;
    }
}

/**
 * Log output to the console.
 * @param  {...*} logs Anything to pass to console.log.
 */
export function log(...logs) {
    // logs.unshift(chalk.blue("tw"));
    console.log.apply(console, logs);
}

/**
 * Log a standard action completed message.
 * @param  {String}    message Success message.
 * @param  {...*}      logs    Anything to pass to console.log.
 */
export function done(message, ...logs) {
    log.apply(null, [color.green(`✔ ${message}`)].concat(logs));
}

/**
 * Fail to execute and exit with a reason and code.
 * @param  {String} reason The reason for the exit.
 * @param  {Number} code   The exit code (default: 1)
 */
export function fail(reason, code = 1) {
    if(reason instanceof Error) {
        debug(reason.stack);
        reason = reason.message;
    }

    log(color.red("error"), reason);
    process.exit(code);
}

/**
 * Cancel an operation.
 * @param  {String} cancellationMessage The reason for cancelling.
 */
export function cancel(cancellationMessage) {
    log(color.yellow("cancel"), cancellationMessage);
    process.exit(0);
}