#!/usr/bin/env babel-node --

import Path from "path";
import Promise from "bluebird";
import fs from "fs";
import TeamworkCLI from "../src/TeamworkCLI";

Promise.try(() => {
    var configPath = TeamworkCLI.getConfigPath();
    fs.unlinkSync(configPath);
    TeamworkCLI.log(`Removed ${configPath}.`);
}).catch(() => {
    TeamworkCLI.log("No config files to remove.");
});