import chalk from "chalk";

export const color = chalk;

/** Color Scheme **/
color.option = color.blue;

/**
 * Indent a block of text by characters.
 * @param  {String} block The block of text to indent.
 * @param  {String} chars Stirng to indent with.
 * @return {String}       Indented block.
 */
export function indent(block, chars = "# ") {
    return chars + block.split("\n").join("\n" + chars);
}