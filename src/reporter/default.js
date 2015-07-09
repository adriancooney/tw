import commander from "commander";
import chalk from "chalk";
import {
    Log, Project, Tasklist, Installation, Task
} from "../model";

/*
 * Models
 */
Log.prototype.toCLIString = function() { 
    return `${chalk.green(this.author.getNameInitialed())} ` + 
        `logged ${chalk.magenta(this.duration.humanize())} ${this.date.calendar()}.\n${indent(this.description, "    ")}`; 
};

Project.prototype.toCLIString = function() { 
    return `[#${this.id}] ${chalk.underline(this.name)}`; 
};

Tasklist.prototype.toCLIString = function() { 
    return `[#${this.id}] ${chalk.bold(this.name)}`; 
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

    return `[#${this.id}] ${chalk.yellow(this.title)} (${details})`
};

/*
 * Handy functions. 
 */
function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}