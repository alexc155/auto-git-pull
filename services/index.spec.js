"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire");

console.error = function() {};

const PROJECT_FOLDER = "~/Documents/GitHub";
const config = {
  readConfig: function() {
    return PROJECT_FOLDER;
  }
};

const git = {
  gitExec: function(path, cmd) {
    if (cmd === "fetch" && path === `${PROJECT_FOLDER}/project1`) {
      return "done.";
    } else if (cmd === "status" && path === `${PROJECT_FOLDER}/project1`) {
      return "On branch master\nYour branch is behind 'origin/master' by 2 commits, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n\nnothing to commit, working tree clean\n";
    }
    return "";
  }
};

const sut = proxyquire("./index", {
  "../config": config,
  "../modules/git": git
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

beforeEach(function() {
  // runs before all tests in this block
  mockFs({
    "~/Documents/GitHub": DIRECTORY_STRUCTURE,
    "./": {}
  });
});

afterEach(function() {
  mockFs.restore();
});

describe("#services", function() {
  it("returns a list of projects", function() {
    const result = sut.buildProjectDirectoryList();
    expect(result).to.deep.equal(
      Object.getOwnPropertyNames(GIT_PROJECTS)
        .map(gitProject => {
          return `${PROJECT_FOLDER}/${gitProject}`;
        })
        .sort()
    );
  });

  it("errors when file system is unavailable", function() {
    mockFs.restore();
    mockFs({});
    sut.buildProjectDirectoryList();

    expect(sut.projectDirectoryList).to.deep.equal([]);
    expect(
      console.error.calledWith("buildProjectDirectoryList error: ")
    ).to.equal(true);
  });

  it("fetches projects successfully", function() {
    const results = sut.fetchProjectsFromGit();
    expect(results).to.deep.equal(["done.", "", ""]);
  });

  it("gets projects' status successfully", function() {
    const results = sut.runStatusOnProjects();
    expect(results).to.deep.equal([
      "On branch master\nYour branch is behind 'origin/master' by 2 commits, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n\nnothing to commit, working tree clean\n",
      "",
      ""
    ]);
  });
});
