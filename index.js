#! /usr/bin/env node
"use strict";

const updateNotifier = require("update-notifier");
const pkg = require("./package.json");

const { validateProjectsDirectory, writeConfig } = require("./config");

function main() {
  updateNotifier({
    pkg,
    updateCheckInterval: 0
  }).notify({
    isGlobal: true
  });
}

main();

/**
 * Sets the parent directory for git projects.
 * @param {string} path - Qualified path to directory
 * @return {bool}
 */
function setProjectsDirectory(path) {
  if (
    validateProjectsDirectory(path) &&
    writeConfig("projects_directory", path)
  ) {
    return true;
  }
  return false;
}

module.exports = {
  setProjectsDirectory
};
