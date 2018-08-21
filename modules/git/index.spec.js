"use strict";

const { expect } = require("chai");
const proxyquire = require("proxyquire");

const childProcess = {
  execSync: cmd => {
    if (cmd === "git status") {
      throw "test";
    }
    return "OK";
  }
};

const sut = proxyquire("./index", {
  child_process: childProcess
});

describe("#modules/git", function() {
  it("tests git", function() {
    const result = sut.gitExec("./", "fetch");
    expect(result).to.equal("OK");
  });

  it("errors when git does", function() {
    const result = sut.gitExec("./", "status");
    expect(result).to.equal("");
  });
});
