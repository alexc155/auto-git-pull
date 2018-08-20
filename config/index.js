"use strict";

const { existsSync, writeFileSync, readFileSync } = require("fs");
const { log } = require("../utils");

const CONFIG_FILE = `${__dirname.replace(/\\/g, "/")}/../gitpull.config`;

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
    log.error("Error in writeConfig: ");
    log.error(error);
    return false;
  }
}

function readConfig(setting, defaultValue) {
  if (!existsSync(CONFIG_FILE)) {
    log.error(`Config file ${CONFIG_FILE} does not exist`);
    return;
  }

  const config = JSON.parse(readFileSync(CONFIG_FILE, { encoding: "utf8" }));

  if (!config[setting] && !defaultValue) {
    log.error("Config setting does not exist");
    return;
  } else if (!config[setting]) {
    writeConfig(setting, defaultValue);
    return defaultValue;
  }

  return config[setting];
}

module.exports = {
  validateProjectsDirectory,
  writeConfig,
  readConfig
};
