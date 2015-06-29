import program from "commander";
import config from "../../package.json";

// TODO: Make every command use commander so --help works.

program
    .version(config.version)
    .command("status", "Show the current Teamwork status.")
    .command("projects", "View and select a project.")
    .command("tasklists", "View and select a tasklist from the current project.")
    .command("tasks", "View and select a task from the current tasklist.")
    .command("log <task> <timestamp>", "Log time to teamwork.")
    .command("logs <task>", "Get the time logs for a task.")
    .command("login", "Login to Teamwork.")
    .command("reset", "Delete any configuration files.")
    .command("clear", "Clear the current status.")
    .command("install-hooks", "Install git hooks.")
    .parse(process.argv);
