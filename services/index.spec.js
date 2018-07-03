"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const utils = { log: { info: sinon.spy(), error: sinon.spy() } };

const config = {
  readConfig: function() {
    return "~/Documents/GitHub";
  }
};

const sut = proxyquire("./index", {
  "../utils": utils,
  "../config": config
});

const GIT_PROJECTS = {
  project1: {
    ".git": {},
    "gitFile1.txt": "contents"
  },
  project2: {
    ".git": {}
  },
  project3: {
    ".git": {}
  }
};

const DIRECTORY_STRUCTURE = Object.assign({}, GIT_PROJECTS, {
  other1: {
    subfolder1: {}
  },
  other2: {
    subfolder2: {}
  },
  "file1.txt": "file content here",
  "file2.txt": "file content here"
});

before(function() {
  // runs before all tests in this block
  mockFs({
    "~/Documents/GitHub": DIRECTORY_STRUCTURE,
    "./": {}
  });
});

after(function() {
  mockFs.restore();
});

describe("#services", function() {
  it("returns a list of projects", function() {
    const result = sut.buildProjectDirectoryList();
    expect(result).to.deep.equal(
      Object.getOwnPropertyNames(GIT_PROJECTS).sort()
    );
  });
});
