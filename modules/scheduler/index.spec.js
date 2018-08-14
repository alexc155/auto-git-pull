"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();
const { appendFileSync, readFileSync, existsSync } = require("fs");
const os = require("os");

function spawnSyncOK() {
  return { error: false, stdout: "OK" };
}

function spawnSyncMissingFile() {
  return { error: { code: "ENOENT" } };
}

function spawnSyncError() {
  return { error: { code: "TEST" } };
}

function execSync(cmd) {
  if (cmd === "crontab tmp_cron") {
    appendFileSync("./mockSuccess", "OK", { encoding: "utf8" });
    return;
  }
  appendFileSync("./tmp_cron", os.EOL + "OK", { encoding: "utf8" });
}

const childProcessOK = {
  spawnSync: cmd => spawnSyncOK(),
  execSync: cmd => execSync(cmd)
};

const childProcessMissingFile = {
  spawnSync: cmd => spawnSyncMissingFile(),
  execSync: cmd => execSync()
};

const childProcessError = {
  spawnSync: cmd => spawnSyncError()
};

const osUnix = {
  type: () => {
    return "Darwin";
  }
};

const osWindows = {
  type: () => {
    return "Win32";
  }
};

describe("#modules/scheduler", function() {
  it("exports existing cron jobs", function() {
    mockFs.restore();

    const sut = proxyquire("./index", { child_process: childProcessOK });

    mockFs({ "./": {} });

    sut.exportExistingCronJobs();

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      os.EOL + "OK"
    );

    mockFs.restore();
  });

  it("creates an empty cron file if there are no existing jobs", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessMissingFile
    });

    mockFs({ "./": {} });

    sut.exportExistingCronJobs();

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      os.EOL + "OK"
    );

    mockFs.restore();
  });

  it("throws an error if it can't generate a temporary cron file", function() {
    mockFs.restore();
    const sut = proxyquire("./index", {
      child_process: childProcessError
    });

    const throwResult = expect(sut.exportExistingCronJobs).to.throw();

    expect(throwResult.__flags.object.code).to.equal("TEST");
  });

  it("appends the cron job to the temp cron file", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK
    });

    mockFs({ "./tmp_cron": "Exisitng Cron Job Entry" });

    sut.maybeAppendJob("frequencyPattern", "job");

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      "Exisitng Cron Job Entry" + os.EOL + "OK"
    );

    mockFs.restore();
  });

  it("doesn't append the cron job to the temp cron file if it's already there", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK
    });

    mockFs({
      "./tmp_cron":
        "Exisitng Cron Job Entry" + os.EOL + "OK" + os.EOL + "Another"
    });

    sut.maybeAppendJob("frequencyPattern", "OK");

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      "Exisitng Cron Job Entry" + os.EOL + "OK" + os.EOL + "Another"
    );

    mockFs.restore();
  });

  it("adds cron job", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK
    });

    mockFs({ "./tmp_cron": "Cron Job Entry" });

    sut.addJobToCrontab("frequencyPattern", "job");

    expect(readFileSync("./mockSuccess", { encoding: "utf8" })).to.equal("OK");

    mockFs.restore();
  });

  it("adds a MacOS or Unix job", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK,
      os: osUnix
    });

    mockFs({
      "./": {}
    });

    sut.addJob(2, "job");

    expect(readFileSync("./mockSuccess", { encoding: "utf8" })).to.equal("OK");

    mockFs.restore();
  });

  it("doesn't yet add a Windows job", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK,
      os: osWindows
    });

    mockFs({
      "./": {}
    });

    sut.addJob(2, "job");

    expect(existsSync("./mockSuccess")).to.equal(false);

    mockFs.restore();
  });

  it("schedules a pull", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK,
      os: osUnix
    });

    mockFs({
      "./": {}
    });

    sut.schedulePull();

    expect(readFileSync("./mockSuccess", { encoding: "utf8" })).to.equal("OK");

    mockFs.restore();
  });
});
