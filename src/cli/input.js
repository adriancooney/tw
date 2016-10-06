import fs from "fs";
import path from "path";
import editor from "editor";
import tmpdir from "os-tmpdir";
import Promise from "bluebird";
import inquirer from "inquirer";
import { CLIError } from "./error";
import * as output from "./output";
import * as format from "./format";

Promise.promisifyAll(fs);

/**
 * Validate some input and exit the program if it fails.
 * @param  {Function}    validator The validator which throws ValidationError.
 * @param  {...*} input     Input to pass to the
 * @return {*}              Output from the validator.
 */
export function validateInput(validator, ...input) {
    try {
        return validator.apply(null, input);
    } catch(err) {
        output.fail(err.message);
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
export function inquirerValidateInput(validator, ...input) {
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
export function prompt(questions) {
    return Promise.resolve(inquirer.prompt(questions));
}

/**
 * Prompt the user to enter content with their $EDITOR.
 * @param  {String} content The content to be placed in the editor.
 * @return {Promise} -> {String} The new content (minus the `content` parameter).
 */
export function promptWithEditor(content) {
    // Create a temporary file in the os.tmpdir()
    var tmpfile = path.join(tmpdir(), String(Math.random() * 100000));

    if(content) {
        content = "\n\n" + format.indent(content);
    } else content = "";

    // Write the initial content to it
    return fs.writeFileAsync(tmpfile, content).then(() => {
        return new Promise((resolve) => {
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
 * Prompt the user to confirm (y/N) a question.
 * @param  {String} confirmation The confirmation question.
 * @return {Promise}             
 */
export function confirm(confirmation) {
    return prompt({
        type: "confirm",
        name: "confirmation",
        message: confirmation
    }).then(answers => answers.confirmation);
}

/**
 * Ask if the user would like to continue with the operation. If they
 * do not, the program exits with code 0 and prints a cancellation
 * message.
 * @param  {String} confirmation        The confirmation question.
 * @param  {String} cancellationMessage The cancellation message to display.
 * @return {Promise}
 */
export function proceed(confirmation, cancellationMessage) {
    return confirm(confirmation).then((proceed) => {
        if(!proceed) output.cancel(cancellationMessage);
    });
}