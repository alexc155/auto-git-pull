"use strict";

const { readConfig, writeConfig } = require("../../config");

function addIncludedProjectDirectory(path) {
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
