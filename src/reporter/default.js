import inquirer from "inquirer";
import commander from "commander";
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
Log.prototype.toCLIString = function() { 
    return `${chalk.green(this.author.getNameInitialed())} ` + 
        `logged ${chalk.magenta(this.duration.humanize())} on ${this.date.calendar()}.` +
        (this.description ? `\n${indent(this.description, "    ")}` : '');
};

Project.prototype.toCLIString = function() { 
    return `${chalk.underline(this.name)}` + (this.starred ? chalk.yellow(" ★") : ""); 
};

Tasklist.prototype.toCLIString = function() { 
    return `${chalk.bold(this.name)}`; 
};

Installation.prototype.toCLIString = function() { 
    return `${chalk.cyan(this.name)} (${this.domain})`; 
};

Task.prototype.toCLIString = function(detailed = true){
    var details = [];
    details.push(this.getProgress())

    if(detailed) {
        if(this.assigned) details.push(chalk.green(this.assigned.getNameInitialed()));
        if(this.priority) {
            var color = PRIORITY_COLORS[this.priority];
            details.push(color ? chalk[color](this.priority) : this.priority);
        }
    }

    details = details.join(", ");

    return `[#${this.id}] ${this.title} (${details})`
};

/*
 * Handy functions. 
 */
function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}