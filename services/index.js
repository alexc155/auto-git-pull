"use strict";

const { readdirSync, lstatSync } = require("fs");
const {
  readConfig,
  validateProjectsDirectory,
  writeConfig
} = require("../config");
const { log } = require("../utils");
const git = require("../modules/git");

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

function fetchFromGit(path) {
  log.info(`Fetching ${path}`);
  return git.gitExec(path, "fetch");
}

function* fetchProjectsFromGit() {
  buildProjectDirectoryList();

  for (const projectDirectory of projectDirectoryList) {
    yield fetchFromGit(projectDirectory);
  }
}

function runGitStatus(path) {
  return git.gitExec(path, "status");
}

function* runStatusOnProjects() {
  buildProjectDirectoryList();

  for (const projectDirectory of projectDirectoryList) {
    yield { [projectDirectory]: runGitStatus(projectDirectory) };
  }
}

function* getPullableProjects() {
  const statuses = runStatusOnProjects();

  const pattern = /Your branch is behind .*? by \d+ commits?, and can be fast-forwarded/gm;

  for (const status of statuses) {
    const project = Object.getOwnPropertyNames(status)[0];
    if (status[project].search(pattern) >= 0) {
      yield project;
    }
  }
}

function runGitPull(path) {
  log.info(`Pulling ${path}`);
  return git.gitExec(path, "pull");
}

function* pullProjectsFromGit() {
  for (const project of getPullableProjects()) {
    yield runGitPull(project);
  }
}

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
  setProjectsDirectory,
  buildProjectDirectoryList,
  fetchProjectsFromGit,
  projectDirectoryList,
  runStatusOnProjects,
  getPullableProjects,
  pullProjectsFromGit,
  addIncludedProjectDirectory,
  removeIncludedProjectDirectory,
  showIncludedProjectDirectories,
  removeAllIncludedProjectDirectories
};
