"use strict";

const { expect } = require("chai");
const proxyquire = require("proxyquire");

const childProcess = {
  execSync: cmd => {
    return "OK";
  }
};

const sut = proxyquire("./index", {
  child_process: childProcess
});

describe("#git", function() {
  it("tests git", function() {
    const result = sut.gitExec("./", "fetch");
    expect(result).to.equal("OK");
  });
});
