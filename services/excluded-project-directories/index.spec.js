"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();
const sinon = require("sinon");

const configWithExcludedProjects = {
  readConfig: function(setting, defaultValue) {
    if (setting === "excluded_project_directories") {
      return ["~/Documents/GitHub/project2/"];
    } else {
      return [];
    }
  },
  writeConfig: function() {
    return true;
  }
};

const configWithExcludedAndIncludedProjects = {
  readConfig: function(setting, defaultValue) {
    return ["/path/to/folder"];
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

describe("#services/excluded-project-directories", function() {
  it("adds a new excluded project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithExcludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const excludedProjectDirectories = sut.addExcludedProjectDirectory(
      "~/Documents/GitHub/directory1/project3/"
    );

    mockFs.restore();

    expect(excludedProjectDirectories.sort()).to.be.deep.equal(
      [
        "~/Documents/GitHub/directory1/project3/",
        "~/Documents/GitHub/project2/"
      ].sort()
    );
  });

  it("doesn't add a new excluded project directory if there are included project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithExcludedAndIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const consoleLog = console.log;
    console.log = function(msg) {};
    sinon.spy(console, "log");

    const excludedProjectDirectories = sut.addExcludedProjectDirectory(
      "~/Documents/GitHub/directory1/project3/"
    );

    mockFs.restore();

    expect(excludedProjectDirectories.sort()).to.be.deep.equal([].sort());
    expect(
      console.log.calledWith(
        "You can't have included *and* excluded project directories."
      )
    ).to.equal(true);

    console.log.restore();
    console.log = consoleLog;
  });

  it("removes an excluded project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithExcludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const excludedProjectDirectories = sut.removeExcludedProjectDirectory(
      "~/Documents/GitHub/directory1/project3/"
    );

    mockFs.restore();

    expect(excludedProjectDirectories).to.be.deep.equal([
      "~/Documents/GitHub/project2/"
    ]);
  });

  it("shows excluded project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithExcludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const excludedProjectDirectories = sut.showExcludedProjectDirectories();

    mockFs.restore();

    expect(excludedProjectDirectories).to.be.deep.equal([
      "~/Documents/GitHub/project2/"
    ]);
  });

  it("removes all excluded project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithExcludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const result = sut.removeAllExcludedProjectDirectories();

    mockFs.restore();
    expect(result).to.equal(true);
  });
});
