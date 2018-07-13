"use strict";

const { readConfig, writeConfig } = require("../../config");
const { log } = require("../../utils");

function addExcludedProjectDirectory(path) {
  const includedProjectDirectories = readConfig(
    "included_project_directories",
    []
  );

  if (includedProjectDirectories.length > 0) {
    log.info("You can't have included *and* excluded project directories.");
    log.info("You need to remove all included project directories first.");
    log.info("Use ` git-autofetch -ci ` to clear them all.");
    return [];
  }

  let excludedProjectDirectories = readConfig(
    "excluded_project_directories",
    []
  );

  excludedProjectDirectories = excludedProjectDirectories.filter(
    item => item !== path
  );

  excludedProjectDirectories.push(path);
  writeConfig("excluded_project_directories", excludedProjectDirectories);
  return excludedProjectDirectories;
}

function removeExcludedProjectDirectory(path) {
  let excludedProjectDirectories = readConfig(
    "excluded_project_directories",
    []
  );

  excludedProjectDirectories = excludedProjectDirectories.filter(
    item => item !== path
  );

  writeConfig("excluded_project_directories", excludedProjectDirectories);

  return excludedProjectDirectories;
}

function showExcludedProjectDirectories() {
  return readConfig("excluded_project_directories", []);
}

function removeAllExcludedProjectDirectories() {
  return writeConfig("excluded_project_directories", []);
}

module.exports = {
  addExcludedProjectDirectory,
  removeExcludedProjectDirectory,
  showExcludedProjectDirectories,
  removeAllExcludedProjectDirectories
};
