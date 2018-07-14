"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();

console.error = function() {};

const PROJECT_FOLDER = "~/Documents/GitHub";

const git = {
  gitExec: function(path, cmd) {
    if (cmd === "fetch" && path === `${PROJECT_FOLDER}/project1`) {
      return "done.";
    } else if (cmd === "status" && path === `${PROJECT_FOLDER}/project1`) {
      return "On branch master\nYour branch is behind 'origin/master' by 2 commits, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n\nnothing to commit, working tree clean\n";
    } else if (cmd === "pull" && path === `${PROJECT_FOLDER}/project1`) {
      return "Updating";
    } else if (cmd === "pull" && path === `test/error`) {
      throw "Mock Error";
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

const projectDirectoryStub = {
  buildProjectDirectoryList: function() {
    return [
      "~/Documents/GitHub/directory1/project3",
      "~/Documents/GitHub/project1",
      "~/Documents/GitHub/project2"
    ];
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

describe("#services/git", function() {
  it("fetches projects", function() {
    const consoleLog = console.log;
    console.log = function() {};

    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../modules/git": git,
      "../project-directory": projectDirectoryStub
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
      "../../modules/git": git,
      "../project-directory": projectDirectoryStub
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
      "../../modules/git": git,
      "../project-directory": projectDirectoryStub
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
      "../../modules/git": git,
      "../project-directory": projectDirectoryStub
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const results = [...sut.pullProjectsFromGit()];

    mockFs.restore();
    console.log = consoleLog;
    expect(results).to.deep.equal(["Updating"]);
  });

  it("gives feedback when git can't pull", function() {
    const consoleLog = console.log;
    console.log = function() {};
    mockFs.restore();

    const sut = proxyquire("./index", {
      "../../modules/git": git,
      "../project-directory": projectDirectoryStub
    });
    mockFs.restore();

    mockFs({ "~/Documents/GitHub": DIRECTORY_STRUCTURE, "./": {} });

    const results = sut.runGitPull("test/error");

    mockFs.restore();
    console.log = consoleLog;
    expect(results).to.equal("test/error can't be pulled right now.");
  });
});
