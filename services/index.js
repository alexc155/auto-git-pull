"use strict";

const { readdirSync } = require("fs");
const { readConfig } = require("../config");
const { log } = require("../utils");
const git = require("../modules/git");

let projectDirectoryList = [];

function buildProjectDirectoryList() {
  projectDirectoryList = [];

  try {
    const projectsDirectory = readConfig("projects_directory");

    const dirContents = readdirSync(projectsDirectory);

    dirContents.forEach(directoryEntry => {
      const path = projectsDirectory + "/" + directoryEntry;

      if (git.checkIsRepo(path)) {
        projectDirectoryList.push(path);
      }
    });
  } catch (error) {
    log.error("buildProjectDirectoryList error: ");
    log.error(error);
    projectDirectoryList = [];
  }

  return projectDirectoryList;
}

function fetchFromGit(path) {
  return git.gitExec(path, "fetch");
}

function fetchProjectsFromGit() {
  buildProjectDirectoryList();

  const results = [];

  projectDirectoryList.forEach(projectDirectory => {
    results.push(fetchFromGit(projectDirectory));
  });

  return results;
}

function runGitStatus(path) {
  return git.gitExec(path, "status");
}

function runStatusOnProjects() {
  buildProjectDirectoryList();

  const results = [];

  projectDirectoryList.forEach(projectDirectory => {
    results.push(runGitStatus(projectDirectory));
  });

  return(results);
}

runStatusOnProjects();

module.exports = {
  buildProjectDirectoryList,
  fetchFromGit,
  fetchProjectsFromGit,
  projectDirectoryList,
  runStatusOnProjects
};
