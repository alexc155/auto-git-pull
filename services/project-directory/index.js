"use strict";

const { readdirSync, lstatSync } = require("fs");
const {
  readConfig,
  validateProjectsDirectory,
  writeConfig
} = require("../../config");
const { log } = require("../../utils");
const git = require("../../modules/git");

let projectDirectoryList = [];

function setProjectsDirectory(path) {
  if (
    validateProjectsDirectory(path) &&
    writeConfig("projects_directory", path)
  ) {
    return true;
  }
  return false;
}

function recurseThroughDirectory(projectsDirectory) {
  const dirContents = readdirSync(projectsDirectory);

  dirContents.forEach(directoryEntry => {
    const path = projectsDirectory + "/" + directoryEntry;

    if (git.checkIsRepo(path)) {
      projectDirectoryList.push(path);
    } else if (lstatSync(path).isDirectory()) {
      recurseThroughDirectory(path);
    }
  });
}

function buildProjectDirectoryList() {
  projectDirectoryList = [];

  try {
    const includedProjectDirectories = readConfig(
      "included_project_directories",
      []
    );

    if (includedProjectDirectories.length > 0) {
      projectDirectoryList = includedProjectDirectories;
      return projectDirectoryList;
    }

    const projectsDirectory = readConfig("projects_directory");

    recurseThroughDirectory(projectsDirectory);
  } catch (error) {
    log.error("buildProjectDirectoryList error: ", error);
    projectDirectoryList = [];
  }

  return projectDirectoryList;
}

module.exports = {
  projectDirectoryList,
  setProjectsDirectory,
  buildProjectDirectoryList
};
