#! /usr/bin/env node
"use strict";

const updateNotifier = require("update-notifier");
const pkg = require("./package.json");
const services = require("./services");
const { log } = require("./utils");

function showHelp() {
  log.info(`
  Fetches all repos from Git in a working folder, and optionally pulls changes if there are no conflicts.

  Available commands:
    --set-projects-directory | -spd <PATH>
    --fetch                  | -f
    --pull                   | -p
    --status                 | -s
    --help                   | -h

  Example usage:
    $ git-autofetch -spd /Users/you/Documents/GitHub
    $ git-autofetch -f
    $ git-autofetch -p

  Notes:
    * You must set a projects directory before fetching or pulling.
      This should be the root folder of you Git projects.
    * The 'Pull' command performs a fetch & pull.
    * 'Pull' will only attempt to pull changes if there are conflicts or changes to the local tree.
    * The more out of date a repo is, the longer it will take to fetch and pull.
`);
}

function main() {
  updateNotifier({
    pkg,
    updateCheckInterval: 0
  }).notify({
    isGlobal: true
  });

  const action = process.argv[2];
  const args = process.argv.slice(3);
  let fetchResults = [];
  switch (action) {
    case "-spd":
    case "--set-projects-directory":
      if (services.setProjectsDirectory(args[0])) {
        log.info("");
        log.info("OK");
      }
      break;
    case "-f":
    case "--fetch":
      fetchResults = [...services.fetchProjectsFromGit()];
      if (fetchResults.length > 0) {
        log.info("");
        log.info("OK");
      }
      break;
    case "-p":
    case "--pull":
      fetchResults = [...services.fetchProjectsFromGit()];
      if (fetchResults.length > 0) {
        const pullResults = [...services.pullProjectsFromGit()];
        if (pullResults.length > 0) {
          log.info(pullResults);
        }
      }
      break;
    case "-s":
    case "--status":
      const statusResults = [...services.runStatusOnProjects()];
      log.info(statusResults);
      break;
    case "-h":
    case "--help":
    case "":
    case undefined:
    default:
      showHelp();
      break;
  }
}

main();
