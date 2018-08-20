"use strict";

const { readConfig, writeConfig } = require("../../config");
const { log } = require("../../utils");

function addIncludedProjectDirectory(path) {
  const excludedProjectDirectories = readConfig(
    "excluded_project_directories",
    []
  );

  if (excludedProjectDirectories.length > 0) {
    log.info("You can't have included *and* excluded project directories.");
    log.info("You need to remove all excluded project directories first.");
    log.info("Use ` gitpull -cx ` to clear them all.");
    return [];
  }

  let includedProjectDirectories = readConfig(
    "included_project_directories",
    []
  );

  includedProjectDirectories = includedProjectDirectories.filter(
    item => item !== path
  );

  includedProjectDirectories.push(path);
  writeConfig("included_project_directories", includedProjectDirectories);
  return includedProjectDirectories;
}

function removeIncludedProjectDirectory(path) {
  let includedProjectDirectories = readConfig(
    "included_project_directories",
    []
  );

  includedProjectDirectories = includedProjectDirectories.filter(
    item => item !== path
  );

  writeConfig("included_project_directories", includedProjectDirectories);

  return includedProjectDirectories;
}

function showIncludedProjectDirectories() {
  return readConfig("included_project_directories", []);
}

function removeAllIncludedProjectDirectories() {
  return writeConfig("included_project_directories", []);
}

module.exports = {
  addIncludedProjectDirectory,
  removeIncludedProjectDirectory,
  showIncludedProjectDirectories,
  removeAllIncludedProjectDirectories
};
