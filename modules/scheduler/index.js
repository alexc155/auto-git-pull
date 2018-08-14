"use strict";

const { execSync, spawnSync } = require("child_process");
const { readFileSync } = require("fs");
const os = require("os");

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

function addJob(frequencyInMinutes, job) {
  if (os.type() === "Linux" || os.type() === "Darwin") {
    addJobToCrontab(`*/${frequencyInMinutes} * * * *`, job);
  }
}

function schedulePull() {
  addJob(2, `/usr/local/bin/node ${__dirname}/../../index.js -ps`);
  return true;
}

module.exports = {
  schedulePull,
  exportExistingCronJobs,
  maybeAppendJob,
  addJobToCrontab,
  addJob
};
