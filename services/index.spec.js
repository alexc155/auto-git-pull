"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

console.error = function() {};

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

const git = {
  gitExec: function(path, cmd) {
    if (cmd === "fetch" && path === `${PROJECT_FOLDER}/project1`) {
      return "done.";
    } else if (cmd === "status" && path === `${PROJECT_FOLDER}/project1`) {
      return "On branch master\nYour branch is behind 'origin/master' by 2 commits, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n\nnothing to commit, working tree clean\n";
    } else if (cmd === "pull" && path === `${PROJECT_FOLDER}/project1`) {
      return "Updating";
    }
    return "";
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

describe("#services", function() {
  it("sets Project Directory", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../config": configWithIncludedProjects,
      "../modules/git": git
    });
    const result = sut.setProjectsDirectory(PROJECT_FOLDER);
    expect(result).to.be.equal(true);
  });

  it("errors when setting invalid Projects Directory", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../config": configWithIncludedProjects,
      "../modules/git": git
    });
    const result = sut.setProjectsDirectory("/invalid/path/");
    expect(result).to.be.equal(false);
  });

  it("returns a list of projects", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
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
      "../config": configWithIncludedProjects,
      "../modules/git": git
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
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
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

  it("fetches projects", function() {
    const consoleLog = console.log;
    console.log = function() {};

    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
    });

    mockFs.restore();
    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const results = [...sut.fetchProjectsFromGit()];

    mockFs.restore();
    console.log = consoleLog;
    expect(results).to.deep.equal(["", "done.", ""]);
  });

  it("gets projects' status", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const results = [...sut.runStatusOnProjects()];

    mockFs.restore();

    expect(results).to.deep.equal([
      { "~/Documents/GitHub/directory1/project3": "" },
      {
        "~/Documents/GitHub/project1":
          "On branch master\nYour branch is behind 'origin/master' by 2 commits, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n\nnothing to commit, working tree clean\n"
      },
      { "~/Documents/GitHub/project2": "" }
    ]);
  });

  it("checks status of projects for pull", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const results = [...sut.getPullableProjects()];

    mockFs.restore();
    expect(results).to.deep.equal(["~/Documents/GitHub/project1"]);
  });

  it("pulls projects", function() {
    const consoleLog = console.log;
    console.log = function() {};
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithoutIncludedProjects,
      "../modules/git": git
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const results = [...sut.pullProjectsFromGit()];

    mockFs.restore();
    console.log = consoleLog;
    expect(results).to.deep.equal(["Updating"]);
  });

  it("adds a new included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithIncludedProjects,
      "../modules/git": git
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

  it("removes an included project directory", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../config": configWithIncludedProjects,
      "../modules/git": git
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
      "../config": configWithIncludedProjects,
      "../modules/git": git
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
      "../config": configWithIncludedProjects,
      "../modules/git": git
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });
    const result = sut.removeAllIncludedProjectDirectories();

    mockFs.restore();
    expect(result).to.equal(true);
  });
});
