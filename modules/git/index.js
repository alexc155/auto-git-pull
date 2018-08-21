"use strict";

const { execSync } = require("child_process");
const { existsSync, lstatSync } = require("fs");

function checkIsRepo(path) {
  return lstatSync(path).isDirectory() && existsSync(`${path}/.git`);
}

function gitExec(path, cmd) {
  try {
    return execSync(`git ${cmd}`, {
      cwd: path,
      stdio: "pipe",
      encoding: "utf8"
    });
  } catch (error) {
    return "";
  }
}

module.exports = {
  checkIsRepo,
  gitExec
};
