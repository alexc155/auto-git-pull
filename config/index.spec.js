"use strict";

const { readFileSync, writeFileSync, unlinkSync } = require("fs");

const { expect } = require("chai");
const mockFs = require("mock-fs");
const sinon = require("sinon");
const proxyquire = require("proxyquire")
  .noCallThru()
  .noPreserveCache();

console.error = function() {};

const utils = {
  log: { info: sinon.spy(console, "log"), error: sinon.spy(console, "error") }
};

const CONFIG_FILE = "./git-autofetch.config";
const PROJECTS_DIRECTORY = "~/Documents/GitHub";

const sut = proxyquire("./index", {
  "../utils": utils
});

beforeEach(function() {
  mockFs({
    "~/Documents/GitHub": {},
    "./": {}
  });
});

afterEach(function() {
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

    expect(
      utils.log.error.calledWith("Path '/invalid/path' does not exist.")
    ).to.equal(true);
  });

  it("writes a path to the config file", function() {
    sut.writeConfig("projects_directory", PROJECTS_DIRECTORY);
    // Run a second time to run thru' if the config file was missing.
    sut.writeConfig("projects_directory", PROJECTS_DIRECTORY);

    const result = readFileSync(CONFIG_FILE, { encoding: "utf8" });
    expect(result).to.equal(
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );
  });

  it("errors writing an invalid setting to the config file", function() {
    mockFs.restore();
    mockFs({ "./git-autofetch.config": "corrupt" });
    const result = sut.writeConfig(undefined, PROJECTS_DIRECTORY);

    expect(result).to.equal(false);

    expect(utils.log.error.calledWith("Error in writeConfig: ")).to.equal(true);
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

  it("errors when reading a path from the config file if the path doesn't exist", function() {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );

    const projectsDirectory = sut.readConfig("invalid_path");

    expect(projectsDirectory).to.equal(undefined);

    expect(
      utils.log.error.calledWith("Config setting does not exist")
    ).to.equal(true);
  });

  it("errors when reading a path from the config file if the config file doesn't exist", function() {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );

    unlinkSync(CONFIG_FILE);

    const projectsDirectory = sut.readConfig("projects_directory");

    expect(projectsDirectory).to.equal(undefined);

    expect(utils.log.error.calledWith("Config file does not exist")).to.equal(
      true
    );
  });
});
