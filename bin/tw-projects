#!/usr/bin/env babel-node --

import program from "commander";
import TeamworkCLI, { CLIError } from "../src/TeamworkCLI";
import TeamworkAPI, { LoginError } from "../src/TeamworkAPI";

program
    .option("-l, --list", "Display projects as a static list.")
    .parse(process.argv);

TeamworkCLI.getAPI().then((api) => {
    return api.getProjects();
}).then((projects) => {
    return TeamworkCLI.chooseCurrentItem(program.list, "Projects", "project", projects);
}).then(() => {
    TeamworkCLI.log("Current project updated.");
}).catch(TeamworkCLI.fail);