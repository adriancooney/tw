import chalk from "chalk";
import wrap from "word-wrap";
export ellipsize from "ellipsize";

export const color = chalk;
export const tab = "    ";

/** Color Scheme **/
color.option = color.blue;
color.option = color.blue;
color.command = color.blue;
color.duration = color.magenta;
color.scope = color.cyan;
color.task = color.yellow;
color.person = color.green;
color.highlight = color.magenta;

/**
 * Indent a block of text by characters.
 * @param  {String} block The block of text to indent.
 * @param  {String} chars Stirng to indent with.
 * @return {String}       Indented block.
 */
export function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}

export function alignIndent(string, block, indentation) {
    if(!indentation) indentation = whitespace(string.length);
    if(indentation.length < string.length) indentation += whitespace(string.length - indentation.length); // Supplement the indent with whitespace
    return string + indent(block, indentation).substr(string.length);
}

/**
 * Repeat a character X amount of times.
 * @param  {Number} length The amount of times to repeat.
 * @param  {String} char   The character to repeat.
 * @return {String}        The repeated characters.
 */
export function repeat(length, char) {
    let ws = "";
    for(let i = 0; i < length; i++) ws += char;
    return ws;
}

/**
 * Generate a string of whitespace of length.
 * @param  {Number} length The length of the whitespace.
 * @return {String}        The whitespace.
 */
export function whitespace(length) {
    return repeat(length, " ");
}

/**
 * Break a chunk of text over multiple lines of specified with.
 * @param  {String} block  The block of text.
 * @param  {Number} width  The width of the block of text.
 * @param  {String} joiner The character to join the lines with.
 * @return {String}        The resized block.
 */
export function resize(block, width = 90, joiner = "\n") {
    return wrap(block, { width, indent: "", trim: true });
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