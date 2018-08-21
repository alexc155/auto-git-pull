"use strict";

const { expect } = require("chai");
const mockFs = require("mock-fs");
const proxyquire = require("proxyquire").noPreserveCache();
const { appendFileSync, readFileSync } = require("fs");
const os = require("os");
const sinon = require("sinon");

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
  } else if (cmd && cmd.indexOf("schtasks /create") >= 0) {
    appendFileSync("./mockSuccess", "OK", { encoding: "utf8" });
    return;
  }
  appendFileSync("./tmp_cron", os.EOL + "gitpull", { encoding: "utf8" });
}

const childProcessOK = {
  spawnSync: () => spawnSyncOK(),
  execSync: cmd => execSync(cmd)
};

const childProcessMissingFile = {
  spawnSync: () => spawnSyncMissingFile(),
  execSync: () => execSync()
};

const childProcessError = {
  spawnSync: () => spawnSyncError()
};

const osUnix = {
  type: () => {
    return "Darwin";
  }
};

const osWindows = {
  type: () => {
    return "Windows_NT";
  }
};

const osUnknown = {
  type: () => {
    return "Unknown";
  }
};

const readLineSync = {
  question: () => {
    return "password";
  }
};

const mockUtils = {
  log: {
    error: function() {},
    infoConsole: function() {}
  }
};

describe("#modules/scheduler", function() {
  it("exports existing cron jobs", function() {
    mockFs.restore();

    const sut = proxyquire("./index", { child_process: childProcessOK });

    mockFs({ "./": {} });

    sut.exportExistingCronJobs();

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      os.EOL + "gitpull"
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
      os.EOL + "gitpull"
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

    mockFs({ "./tmp_cron": "Existing Cron Job Entry" });

    sut.maybeAppendJob("frequencyPattern", "job");

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      "Existing Cron Job Entry" + os.EOL + "gitpull"
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
        "Existing Cron Job Entry" + os.EOL + "gitpull" + os.EOL + "Another"
    });

    sut.maybeAppendJob("frequencyPattern", "gitpull");

    expect(readFileSync("./tmp_cron", { encoding: "utf8" })).to.equal(
      "Existing Cron Job Entry" + os.EOL + "Another" + os.EOL + "gitpull"
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

  it("adds a Windows job", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK,
      os: osWindows,
      "readline-sync": readLineSync,
      "../../utils": mockUtils
    });

    mockFs({
      "./": {}
    });

    sut.addJob(2, "job");

    expect(readFileSync("./mockSuccess", { encoding: "utf8" })).to.equal("OK");

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

    sut.scheduleTask("-ps");

    expect(readFileSync("./mockSuccess", { encoding: "utf8" })).to.equal("OK");

    mockFs.restore();
  });

  it("errors if it can't recognize the OS when adding a job", function() {
    mockFs.restore();

    const sut = proxyquire("./index", {
      child_process: childProcessOK,
      os: osUnknown,
      "../../utils": mockUtils
    });

    sinon.spy(mockUtils.log, "error");

    mockFs({ "./": {} });

    sut.addJob(2, "job");

    expect(mockUtils.log.error.called).to.equal(true);
  });
});
