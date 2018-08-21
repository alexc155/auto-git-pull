"use strict";

const { readFileSync, writeFileSync, unlinkSync } = require("fs");

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

const mockUtils = {
  log: {
    error: function() {}
  }
};

const CONFIG_FILE = "./auto-git-pull.config";
const PROJECTS_DIRECTORY = "~/Documents/GitHub";

const sut = proxyquire("./index", {
  "../utils": mockUtils
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
    mockFs({ "./auto-git-pull.config": "corrupt" });
    const result = sut.writeConfig(undefined, PROJECTS_DIRECTORY);

    expect(result).to.equal(false);
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

  it("returns the default value when reading a path if the path doesn't exist and there is a default", function() {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );

    const projectsDirectory = sut.readConfig("missing_path", "/path/to/files");

    expect(projectsDirectory).to.equal("/path/to/files");
  });

  it("errors when reading a path from the config file if the path doesn't exist and there is no default", function() {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({
        projects_directory: PROJECTS_DIRECTORY
      })
    );

    const projectsDirectory = sut.readConfig("invalid_path");

    expect(projectsDirectory).to.equal(undefined);
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
  });
});
