"use strict";

const { readFileSync } = require("fs");

const { expect } = require("chai");
const mockFs = require("mock-fs");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const utils = { log: { info: sinon.spy(), error: sinon.spy() } };

var sut = proxyquire("../config", {
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

describe("#gitAutofetch", function() {
  it("returns true if directory is valid", function() {
    const result = sut.validateProjectsDirectory("~/Documents/GitHub");
    expect(result).to.equal(true);
  });
  it("returns false if directory is invalid", function() {
    const result = sut.validateProjectsDirectory("/invalid/path");
    expect(result).to.equal(false);
    expect(utils.log.error.calledOnce).to.equal(true);
  });

  it("writes a path to the config file", function() {
    sut.writeConfig("~/Documents/GitHub");
    const result = readFileSync("./git-autofetch.config", { encoding: "utf8" });
    expect(result).to.equal(
      JSON.stringify({
        projects_directory: "~/Documents/GitHub"
      })
    );
  });
});
