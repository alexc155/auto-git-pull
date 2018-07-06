"use strict";

const { expect } = require("chai");

const sut = require("./");

describe("#utils", function() {
  it("logs info messages", function() {
    const result = sut.log.info("");
    expect(result).to.equal(true);
  });

  it("logs error messages", function() {
    const result = sut.log.error("");
    expect(result).to.equal(true);
  });
});
