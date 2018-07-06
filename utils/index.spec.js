"use strict";

const { expect } = require("chai");
const sinon = require("sinon");

const sut = require("./");

describe("#utils", function() {
  it("logs info messages", function() {
    var consoleLog = console.log;
    console.log = function(msg) {};
    sinon.spy(console, "log");
    sut.log.info("INFO");
    expect(console.log.calledWith("INFO")).to.equal(true);
    console.log = consoleLog;
  });

  it("logs error messages", function() {
    var consoleError = console.error;
    console.error = function(msg) {};
    sinon.spy(console, "error");
    sut.log.error("ERROR");
    expect(console.error.calledWith("ERROR")).to.equal(true);
    console.error = consoleError;
  });
});
