/**
 * CLIError. Elegantly throw CLI errors which
 * allow you to exit the program with the appropriate code.
 */
export class CLIError extends Error {
    constructor(reason, code, showHelp = true) {
        super();
        this.message = reason.replace(/\.?$/, ".");
        this.code = code;

        if(showHelp)
            this.message += ` Please see ${chalk.blue("--help")} for more information.`;
    }
}