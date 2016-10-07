/* eslint-disable */
import fs from "fs";
import path from "path";
import rc from "rc";
import Promise from "bluebird";
import Config from "../library/Config";
import { Debug } from "../library/Debug";
import * as input from "./input";
import * as output from "./output";

const debug = Debug("tw:cli:config");

Promise.promisifyAll(fs);

/**
 * The prefix before the "rc" files. e.g. .teamworkrc
 * @type {String}
 */
const TEAMWORK_RC_PREFIX = "teamwork";

/**
 * Set a preference in the config.
 * @param {String} name  The name of the property.
 * @param {*} value The value of the preference. (JSON)
 * @return {Promise}
 */
// TODO: Remove.
// export function save(key, value) {
//     if(key) TeamworkCLI.config.set(key, value);
//     return TeamworkCLI.writeConfig(TeamworkCLI.config);
// }

/**
 * Create or rewrite config file for the User in ~/.teamworkrc
 * @param {Object} config The config object.
 * @return {Promise} 
 */
export function writeConfig(config) {
    // TODO: Write config file to custom location
    var configPath = getConfigPath();

    return fs.writeFileAsync(configPath, JSON.stringify(config, null, 2)).then(() => {
        debug("Config saved to %s.", configPath);
    });
}

/**
 * Read in the config.
 * @return {Object} Config.
 */
export function readConfig() {
    const config = rc(TEAMWORK_RC_PREFIX, {}, () => {});
    return new Config(config);
}

/**
 * Delete the config.
 * @return {Promise}
 */
export function deleteConfig() {
    var configPath = getConfigPath();
    return fs.unlinkSync(configPath);
}

/**
 * Get the path to the user config file.
 * @return {String} /path/to/.teamworkrc
 */
export function getConfigPath() {
    return path.resolve(process.env.HOME, `.${TEAMWORK_RC_PREFIX}rc`);
}