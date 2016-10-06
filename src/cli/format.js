import chalk from "chalk";

export const color = chalk;
export const tab = "    ";

/** Color Scheme **/
color.option = color.blue;
color.option = color.blue;
color.command = color.blue;
color.duration = color.magenta;
color.scope = color.cyan;

/**
 * Indent a block of text by characters.
 * @param  {String} block The block of text to indent.
 * @param  {String} chars Stirng to indent with.
 * @return {String}       Indented block.
 */
export function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}

export function prettyDuration(duration) {
    const minutes = duration.minutes();
    const hours = duration.hours();
    duration = [];

    // Display "X hours (and X minutes)"
    if(hours > 0) duration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if(minutes > 0) duration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return duration.join(" and ");
}

export function getScopeType(scope) {
    return scope.constructor.name;
}