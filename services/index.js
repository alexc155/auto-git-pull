"use strict";

const { readdirSync, lstatSync } = require("fs");
const { readConfig } = require("../config");
const { log } = require("../utils");
const git = require("../modules/git");

let projectDirectoryList = [];

function buildProjectDirectoryList() {
  projectDirectoryList = [];

  const projectsDirectory = readConfig("projects_directory");

  const dirContents = readdirSync(projectsDirectory);

  dirContents.forEach(directoryEntry => {
    const path = projectsDirectory + "/" + directoryEntry;

    if (git.checkIsRepo(path)) {
      projectDirectoryList.push(directoryEntry);
    }
  });

  return projectDirectoryList;
}

function fetchFromGit(path) {
    git.gitExec(path, "fetch");    
}

module.exports = {
  buildProjectDirectoryList,
  fetchFromGit
};
