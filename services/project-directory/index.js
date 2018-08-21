"use strict";

const { readdirSync, lstatSync } = require("fs");
const {
  readConfig,
  validateProjectsDirectory,
  writeConfig
} = require("../../config");
const { log } = require("../../utils");
const git = require("../../modules/git");

let gitRepos = [];

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
    if (directoryEntry !== "node_modules") {
      const path = projectsDirectory + "/" + directoryEntry;

      if (git.checkIsRepo(path)) {
        gitRepos.push(path);
      } else if (lstatSync(path).isDirectory()) {
        recurseThroughDirectory(path);
      }
    }
  });
}

function buildProjectDirectoryList() {
  try {
    const includedProjectDirectories = readConfig(
      "included_project_directories",
      []
    );

    if (!includedProjectDirectories) {
      log.error("");
      log.error(
        "Have you set the project directory or set a list of directories to include?"
      );
      log.error(
        "( Use the '--set-projects-directory' or '--add-include option' )"
      );
      return [];
    }

    if (includedProjectDirectories.length > 0) {
      return includedProjectDirectories;
    }

    const projectsDirectory = readConfig("projects_directory");

    gitRepos = [];

    recurseThroughDirectory(projectsDirectory);

    const excludedProjectDirectories = readConfig(
      "excluded_project_directories",
      []
    );

    if (excludedProjectDirectories.length === 0) {
      return gitRepos;
    }

    return gitRepos.filter(x => !excludedProjectDirectories.includes(x));
  } catch (error) {
    log.error("buildProjectDirectoryList error: ", error);
    return [];
  }
}

module.exports = {
  setProjectsDirectory,
  buildProjectDirectoryList
};
