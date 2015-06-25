#!/usr/bin/env babel-node --

import program from "commander";
import TeamworkCLI, { CLIError } from "../src/TeamworkCLI";
import TeamworkAPI, { LoginError } from "../src/TeamworkAPI";

program
    .option("-l, --list", "Display tasklists as a static list.")
    .parse(process.argv);

TeamworkCLI.getAPI().then((api) => {
    var project = TeamworkCLI.getCurrent("project");

    if(!project) TeamworkCLI.fail(`No project currently selected. Please select a project with ${TeamworkCLI.color.green("tw projects")}.`);

    return api.getTasklists(project);
}).then((tasklists) => {
    return TeamworkCLI.chooseCurrentItem(program.list, "Tasklists", "tasklist", tasklists);
}).then(() => {
    TeamworkCLI.log("Current tasklist updated.");
}).catch(TeamworkCLI.fail);