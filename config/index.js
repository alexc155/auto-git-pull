"use strict";

const { existsSync, writeFileSync } = require("fs");
const { log } = require("../utils");

function validateProjectsDirectory(path) {
  if (!existsSync(path)) {
    log.error(`Path '${path}' does not exist.`);
    return false;
  }
  return true;
}

function writeConfig(path) {
  try {
    writeFileSync(
      "./git-autofetch.config",
      JSON.stringify({ projects_directory: path })
    );
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}

module.exports = {
  validateProjectsDirectory,
  writeConfig
};
