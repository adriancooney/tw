#!/usr/bin/env babel-node --

import program from "commander";
import TeamworkCLI from "../src/TeamworkCLI";
import Teamwork from "../src/Teamwork";

program
    .arguments("[task]")
    .option("--task", "Open up the current task in the browser")
    .option("--tasklist", "Open up the current tasklist in the browser")
    .option("--project", "Open up the current project in the browser")
    .parse(process.argv);

if(process.args.length) {

} else {
    var item = ["task", "tasklist", "project"].find((item) => { return program[item]; });

    if(item) {
        var current = TeamworkCLI.getCurrent(item);

        // TODO: Open task in browser with node-open
    }
}
