"use strict";

const { execSync, spawnSync } = require("child_process");
const { readFileSync } = require("fs");
const os = require("os");
const readlineSync = require("readline-sync");
const { log } = require("../../utils");

function exportExistingCronJobs() {
  let ct;
  ct = spawnSync("crontab", ["-l"], {
    encoding: "utf8"
  });

  if (!ct.error) {
    execSync(`echo '${ct.stdout}' > tmp_cron`, {
      encoding: "utf8"
    });
  } else {
    if (ct.error.code === "ENOENT") {
      execSync("touch tmp_cron");
    } else {
      throw ct.error;
    }
  }
}

function maybeAppendJob(frequencyPattern, job) {
  const currentJobs = readFileSync("tmp_cron", { encoding: "utf8" });

  if (currentJobs.indexOf(job) < 0) {
    execSync(`echo '${frequencyPattern} ${job}' >> tmp_cron`, {
      encoding: "utf8"
    });
  }
}

function addJobToCrontab(frequencyPattern, job) {
  exportExistingCronJobs();

  maybeAppendJob(frequencyPattern, job);

  execSync("crontab tmp_cron", {
    encoding: "utf8"
  });

  execSync("rm tmp_cron", { encoding: "utf8" });
}

function addWindowsScheduledTask(frequencyInMinutes, job, username, password) {
  execSync(
    `schtasks /create /F /RU ${username} /RP ${password} /sc minute /mo ${frequencyInMinutes} /tn "Git-AutoFetch" /tr "${job}"`
  );
  log.infoConsole("");
  log.infoConsole("A Scheduled Task has been created.");
  log.infoConsole(
    "However, it isn't possible to automate this task to run when the computer is not plugged in."
  );
  log.infoConsole(
    "To fix this, find the task called Git-AutoFetch in the task library, and do the following:"
  );
  log.infoConsole("Right-click and choose Properties.");
  log.infoConsole(
    "In the Conditions tab, untick 'Start the task only if the computer is on AC power'"
  );
  log.infoConsole("Choose OK");
  log.infoConsole("");
  readlineSync.question("Press Enter to continue...");
}

function addJob(frequencyInMinutes, job) {
  if (os.type() === "Linux" || os.type() === "Darwin") {
    addJobToCrontab(`*/${frequencyInMinutes} * * * *`, `/usr/local/bin/${job}`);
  } else if (os.type() === "Windows_NT") {
    const password = readlineSync.question(
      "Please enter your windows login password ", {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default).
      }
    );

    addWindowsScheduledTask(
      frequencyInMinutes,
      job,
      process.env.USERNAME,
      password
    );
  } else {
    log.error("Sorry, the operating system is not recognized");
  }
}

function schedulePull() {
  addJob(2, `node ${__dirname.replace(/\\/g, "/")}/../../index.js -ps`);
  return true;
}

module.exports = {
  schedulePull,
  exportExistingCronJobs,
  maybeAppendJob,
  addJobToCrontab,
  addJob
};
