"use strict";

const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire").noPreserveCache();

const mockLogger = {
  logSync: function() {},
  errorSync: function() {}
};

const sut = proxyquire("./", {
  "logger-rotate": mockLogger
});

describe("#utils", function() {
  it("logs info messages", function() {
    sinon.spy(mockLogger, "logSync");

    sut.log.info("INFO");
    expect(mockLogger.logSync.calledWith("INFO")).to.equal(true);

    mockLogger.logSync.restore();
  });

  it("silently logs info messages", function() {
    sinon.spy(mockLogger, "logSync");

    sut.log.infoSilent("INFO");
    expect(mockLogger.logSync.calledWith("INFO")).to.equal(true);

    mockLogger.logSync.restore();
  });

  it("logs error messages", function() {
    sinon.spy(mockLogger, "errorSync");

    sut.log.error("ERROR");
    expect(mockLogger.errorSync.calledWith("ERROR")).to.equal(true);

    mockLogger.errorSync.restore();
  });

  it("logs info messages to console", function() {
    sinon.stub(console, "log");

    sut.log.infoConsole("INFO");

    expect(console.log.calledWith("INFO")).to.equal(true);

    console.log.restore();
  });
});
