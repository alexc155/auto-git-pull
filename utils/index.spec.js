"use strict";

const { expect } = require("chai");
const sinon = require("sinon");

const sut = require("./");

describe("#utils", function() {
  it("logs info messages", function() {
    var consoleLog = console.log;
    console.log = function() {};
    sinon.spy(console, "log");
    sut.log.info("INFO");
    expect(console.log.calledWith("INFO")).to.equal(true);
    console.log.restore();
    console.log = consoleLog;
  });

  it("logs error messages", function() {
    var consoleError = console.error;
    console.error = function() {};
    sinon.spy(console, "error");
    sut.log.error("ERROR");
    expect(console.error.calledWith("ERROR")).to.equal(true);
    console.error.restore();
    console.error = consoleError;
  });
});
