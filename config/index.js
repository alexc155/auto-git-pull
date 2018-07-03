"use strict";

const { existsSync, writeFileSync, readFileSync } = require("fs");
const { log } = require("../utils");

const CONFIG_FILE = "./git-autofetch.config";

function validateProjectsDirectory(path) {
  if (!existsSync(path)) {
    log.error(`Path '${path}' does not exist.`);
    return false;
  }
  return true;
}

function writeConfig(setting, value) {
  try {
    if (!existsSync(CONFIG_FILE)) {
      writeFileSync(CONFIG_FILE, "{}");
    }

    let config = JSON.parse(readFileSync(CONFIG_FILE, { encoding: "utf8" }));

    config[setting] = value;

    writeFileSync(CONFIG_FILE, JSON.stringify(config));
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}

function readConfig(setting) {
  if (!existsSync(CONFIG_FILE)) {
    log.error("Config file does not exist");
    return;
  }

  const config = JSON.parse(readFileSync(CONFIG_FILE, { encoding: "utf8" }));

  if (!config[setting]) {
    log.error("Config setting does not exist");
    return;
  }

  return config[setting];
}

module.exports = {
  validateProjectsDirectory,
  writeConfig,
  readConfig
};
