import inquirer from "inquirer";
import chalk from "chalk";
import {
    Log, Project, Tasklist, Installation, Task
} from "../model";

/**
 * Simple store of colors for priority.
 * @type {Object}
 */
const PRIORITY_COLORS = {
    "high": "red",
    "medium": "magenta" // I know the website uses yellow but tasks are yellow.
};

/*
 * Override Inquirer's prompt.
 */
var getQuestion = function() {
    var message = chalk.bold(this.opt.message) + ": ";

    // Append the default if available, and if question isn't answered
    if ( this.opt.default != null && this.status !== "answered" ) {
        message += chalk.dim("("+ this.opt.default + ") ");
    }

    return message;
};

inquirer.prompt.prompts.list.prototype.getQuestion = getQuestion;
inquirer.prompt.prompts.input.prototype.getQuestion = getQuestion;
inquirer.prompt.prompts.password.prototype.getQuestion = getQuestion;

/*
 * Models
 */
Log.prototype.print = function() { 
    return `${chalk.green(this.author.getNameInitialed())} ` + 
        `logged ${chalk.magenta(this.duration.humanize())} on ${this.date.calendar()}.` +
        (this.description ? `\n${indent(this.description, "    ")}` : "");
};

Project.prototype.print = function() { 
    return `Project ${chalk.underline(this.name)}` + (this.starred ? chalk.yellow(" ★") : ""); 
};

Tasklist.prototype.print = function() { 
    return `${chalk.bold(this.name)}`; 
};

Installation.prototype.print = function() { 
    return `${chalk.cyan(this.name)} (${this.domain})`; 
};

/**
 * Print a task. Inspiration from git.
 *
 * Example:
 *
 *       Teamwork Chat (App) / Moving To Electron /
 *       +-----------------------------------------------------------------------+
 *      [X] main.coffee: Shouldn't `handleUpdates` be called when the app is 
 *       |  ready / window is there?
 *       +--------------+------------+---------------+-------- |==========---| 80%
 *       | task #123840 | Unassigned | high priority | due 12/10/16 | 123 comments
 *       |
 *       \-[ ] ElectronWindowHandler: might be able to simplify resize 
 *          |  method now?
 *          +-----------+------------+---------------+-------- |==========---| 80%
 *          |  #123840  | Unassigned | high priority | due 12/10/16 | 123 comments
 *     
 */
Task.prototype.print = function(detailed = true){
    var details = [];
    details.push(this.getProgress());

    if(detailed) {
        if(this.assigned) details.push(chalk.green(this.assigned.getNameInitialed()));
        if(this.priority) {
            var color = PRIORITY_COLORS[this.priority];
            details.push(color ? chalk[color](this.priority) : this.priority);
        }
    }

    details = details.join(", ");

    var content = `${this.title} (#${this.id}, ${details})`;

    if(this.completed) {
        content = chalk.green(tick() + " " + chalk.strikethrough(content));
    }

    return content;
};

Task.prototype.printFull = function() {
    var str = this.print(true);

    return str + `\n${this.description || "No description."}`;
};

/*
 * Handy functions. 
 */
function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}

function tick() {
    return "\u2714";
}