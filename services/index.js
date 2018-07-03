"use strict";

const { readdirSync, lstatSync } = require("fs");
const { readConfig } = require("../config");
const { log } = require("../utils");

let projectDirectoryList = [];

function testFolderForGit(path) {
  const folderContents = readdirSync(path);
  return folderContents.includes(".git");
}

function buildProjectDirectoryList() {
  projectDirectoryList = [];

  const projectsDirectory = readConfig("projects_directory");

  readdirSync(projectsDirectory).forEach(directoryEntry => {
    if (lstatSync(projectsDirectory + "/" + directoryEntry).isDirectory()) {
      if (testFolderForGit(projectsDirectory + "/" + directoryEntry)) {
        projectDirectoryList.push(directoryEntry);
      }
    }
  });

  return projectDirectoryList;
}

module.exports = {
  buildProjectDirectoryList
};
