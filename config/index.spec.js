"use strict";

const { readFileSync, writeFileSync } = require("fs");

const { expect } = require("chai");
const mockFs = require("mock-fs");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const utils = { log: { info: sinon.spy(), error: sinon.spy() } };

const CONFIG_FILE = "./git-autofetch.config";
const PROJECTS_DIRECTORY = "~/Documents/GitHub";

const sut = proxyquire("./index", {
  "../utils": utils
});

before(function() {
  // runs before all tests in this block
  mockFs({
    "path/to/fake/dir": {
      "some-file.txt": "file content here",
      "empty-dir": {
        /** empty directory */
      }
    },
    "path/to/some.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
    "some/other/path": {
      /** another empty directory */
    },
    "~/Documents/GitHub": {},
    "./": {}
  });
});

after(function() {
  mockFs.restore();
});

describe("#config", function() {
  it("returns true if directory is valid", function() {
    const result = sut.validateProjectsDirectory(PROJECTS_DIRECTORY);
    expect(result).to.equal(true);
  });

  it("returns false if directory is invalid", function() {
    const result = sut.validateProjectsDirectory("/invalid/path");
    expect(result).to.equal(false);
    expect(utils.log.error.calledOnce).to.equal(true);
  });

  it("writes a path to the config file", function() {
    sut.writeConfig("projects_directory", PROJECTS_DIRECTORY);

    const result = readFileSync(CONFIG_FILE, { encoding: "utf8" });
    expect(result).to.equal(
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );
  });

  it("reads a path from the config file", function() {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );

    const projectsDirectory = sut.readConfig("projects_directory");
    expect(projectsDirectory).to.equal(PROJECTS_DIRECTORY);
  });
});
