"use strict";

const { execSync } = require("child_process");
const { existsSync, lstatSync } = require("fs");

function checkIsRepo(path) {
  return lstatSync(path).isDirectory() && existsSync(`${path}/.git`);
}

function gitExec(path, cmd) {
  const result = execSync(`git ${cmd}`, {
    cwd: path,
    stdio: "pipe",
    encoding: "utf8"
  });
  return result;
}

module.exports = {
  checkIsRepo,
  gitExec
};
