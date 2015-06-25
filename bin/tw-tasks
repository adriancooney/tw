#!/usr/bin/env babel-node --

import program from "commander";
import TeamworkCLI, { CLIError } from "../src/TeamworkCLI";
import TeamworkAPI, { LoginError } from "../src/TeamworkAPI";

program
    .option("-l, --list", "Display tasks as a static list.")
    .parse(process.argv);

TeamworkCLI.getAPI().then((api) => {
    var tasklist = TeamworkCLI.getCurrent("tasklist");
    if(!tasklist) TeamworkCLI.fail(`No tasklist currently selected. Please select a tasklist with ${TeamworkCLI.color.green("tw tasklists")}.`);

    return api.getTasks(tasklist);
}).then((tasks) => {
    return TeamworkCLI.chooseCurrentItem(program.list, "Tasks", "task", tasks);
}).then(() => {
    TeamworkCLI.log("Current task updated.");
}).catch(TeamworkCLI.fail);