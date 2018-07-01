"use strict";

const expect = require("chai").expect;
const gitAutofetch = require("../index");

describe("#gitAutofetch", function() {
  it("sets a path in config if directory is valid", function() {
    const result = gitAutofetch.setProjectsDirectory(
      "~/Documents/GitHub.nosync"
    );
    expect(result).to.equal(true);
  });
});
