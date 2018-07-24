"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

const mockUtils = {
  log: {
    info: function() {}
  }
};

const configWithIncludedProjects = {
  readConfig: function(setting, defaultValue) {
    if (setting === "included_project_directories") {
      return ["/path/to/project", "/path/to/another"];
    } else {
      return [];
    }
  },
  writeConfig: function() {
    return true;
  }
};

const configWithIncludedAndExcludedProjects = {
  readConfig: function(setting, defaultValue) {
    return ["~/Documents/GitHub/project2/"];
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

describe("#services/included-project-directories", function() {
  it("adds a new included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const includedProjectDirectories = sut.addIncludedProjectDirectory(
      "/path/to/project"
    );

    mockFs.restore();

    expect(includedProjectDirectories.sort()).to.be.deep.equal(
      ["/path/to/project", "/path/to/another"].sort()
    );
  });

  it("doesn't add a new included project directory if there are excluded project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedAndExcludedProjects,
      "../../utils": mockUtils
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const includedProjectDirectories = sut.addIncludedProjectDirectory(
      "~/Documents/GitHub/directory1/project3/"
    );

    mockFs.restore();

    expect(includedProjectDirectories.sort()).to.be.deep.equal([].sort());
  });

  it("removes an included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const includedProjectDirectories = sut.removeIncludedProjectDirectory(
      "/path/to/project"
    );

    mockFs.restore();

    expect(includedProjectDirectories).to.be.deep.equal(["/path/to/another"]);
  });

  it("shows included project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const includedProjectDirectories = sut.showIncludedProjectDirectories();

    mockFs.restore();

    expect(includedProjectDirectories).to.be.deep.equal([
      "/path/to/project",
      "/path/to/another"
    ]);
  });

  it("removes all included project directories", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../config": configWithIncludedProjects
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const result = sut.removeAllIncludedProjectDirectories();

    mockFs.restore();
    expect(result).to.equal(true);
  });
});
