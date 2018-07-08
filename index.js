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
    set-projects-directory | spd <PATH>
    help

  Example usage:
    $ git-autofetch spd /Users/you/Documents/GitHub

  Notes:
    * [point]
`);
}

/**
 * Sets the parent directory for git projects.
 * @param {string} path - Qualified path to directory
 * @return {boolean}
 */
function setProjectsDirectory(path) {
  if (services.setProjectsDirectory(path)) {
    log.info("OK");
    return true;
  }
  return false;
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
  switch (action) {
    case "set-projects-directory":
    case "spd":
      setProjectsDirectory(args[0]);
      break;
    case "help":
    case "":
    case undefined:
    default:
      showHelp();
      break;
  }
}

main();

module.exports = {
  setProjectsDirectory
};
