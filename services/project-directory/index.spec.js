"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

const PROJECT_FOLDER = "~/Documents/GitHub";

const configWithIncludedProjects = {
  readConfig: function(setting, defaultValue) {
    return ["/path/to/project", "/path/to/another"];
  },
  validateProjectsDirectory: function(path) {
    return path === PROJECT_FOLDER;
  },
  writeConfig: function() {
    return true;
  }
};

const configWithoutIncludedProjects = {
  readConfig: function(setting, defaultValue) {
    if (setting === "included_project_directories") {
      return defaultValue;
    }
    return PROJECT_FOLDER;
  }
};

const GIT_PROJECTS = {
  project1: {
    ".git": {},
    "gitFile1.txt": "contents"
  },
  project2: {
    ".git": {}
  },
  directory1: {
    project3: {
      ".git": {}
    }
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

describe("#services/project-directory", function() {
  it("sets Project Directory", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    const result = sut.setProjectsDirectory(PROJECT_FOLDER);
    expect(result).to.be.equal(true);
  });

  it("errors when setting invalid Projects Directory", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    const result = sut.setProjectsDirectory("/invalid/path/");
    expect(result).to.be.equal(false);
  });

  it("returns a list of projects", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../../config": configWithoutIncludedProjects
    });
    mockFs({
      "~/Documents/GitHub": DIRECTORY_STRUCTURE,
      "./": {}
    });
    const result = sut.buildProjectDirectoryList();
    mockFs.restore();
    const expectedResult = [
      "~/Documents/GitHub/project1",
      "~/Documents/GitHub/project2",
      "~/Documents/GitHub/directory1/project3"
    ];

    expect(result).to.deep.equal(expectedResult.sort());
  });

  it("returns a list of included projects", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const result = sut.buildProjectDirectoryList();
    mockFs.restore();
    const expectedResult = ["/path/to/another", "/path/to/project"];

    expect(result.sort()).to.deep.equal(expectedResult.sort());
  });

  it("errors when file system is unavailable", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithoutIncludedProjects
    });

    mockFs.restore();
    mockFs({});

    sut.buildProjectDirectoryList();

    mockFs.restore();

    expect(sut.projectDirectoryList).to.deep.equal([]);
    expect(
      console.error.calledWith("buildProjectDirectoryList error: ")
    ).to.equal(true);
  });
});
