import chalk from "chalk";

export const color = chalk;
export const tab = "    ";

/** Color Scheme **/
color.option = color.blue;
color.option = color.blue;
color.command = color.blue;
color.duration = color.magenta;
color.scope = color.cyan;
color.person = color.green;

/**
 * Indent a block of text by characters.
 * @param  {String} block The block of text to indent.
 * @param  {String} chars Stirng to indent with.
 * @return {String}       Indented block.
 */
export function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}

/**
 * Like moment.duration().humanize() except more exact.
 * @param  {moment.duration} duration 
 * @return {String}
 */
export function prettyDuration(duration) {
    const minutes = duration.minutes();
    const hours = duration.hours();
    duration = [];

    // Display "X hours (and X minutes)"
    if(hours > 0) duration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if(minutes > 0) duration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return duration.join(" and ");
}

/**
 * Return the scope type (i.e. "Project", "Tasklist" or "Task")
 * @param  {Project|Tasklist|Task} scope 
 * @return {String}
 */
export function getScopeType(scope) {
    return scope.constructor.name;
}

/**
 * Convert a list of strings in a nice comma seperated list.
 * @param  {Array} list      List of items to join.
 * @param  {String} seperator "and" or "or"
 * @return {String}
 */
export function comma(list, seperator = "or") {
    if(list.length == 1) return list;
    else if(list.length === 2) return `${list[0]} ${seperator} ${list[1]}`;
    else if(list.length === 3) return `${list[2]}, ${comma(list.slice(-2))}`;
    else if(list.length > 3) return `${list.slice(0, -2).join(", ")} ${comma(list.slice(-2))}`;
}