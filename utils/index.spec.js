"use strict";

const { expect } = require("chai");
const sinon = require("sinon");

const sut = require("./");

/* istanbul ignore next */
const showWarning = function(args) {
  let template = args[0];

  for (const replacement of args.slice(1)) {
    template = template.replace(/\%\w/, replacement);
  }
  console.warn(template);
};

/* istanbul ignore next */
describe("#utils", function() {
  it("logs info messages", function() {
    var consoleLog = console.log;
    console.log = function() {
      if (
        arguments &&
        Array.from(arguments)
          .join(" ")
          .indexOf("INFO") === 0
      ) {
        return;
      } else {
        showWarning(Array.from(arguments));
      }
    };
    sinon.spy(console, "log");

    sut.log.info("INFO");
    expect(console.log.calledWith("INFO")).to.equal(true);

    console.log.restore();
    console.log = consoleLog;
  });

  it("logs error messages", function() {
    var consoleError = console.error;
    console.error = function() {
      if (
        arguments &&
        Array.from(arguments)
          .join(" ")
          .indexOf("ERROR") === 0
      ) {
        return;
      } else {
        showWarning(Array.from(arguments));
      }
    };
    sinon.spy(console, "error");

    sut.log.error("ERROR");
    expect(console.error.calledWith("ERROR")).to.equal(true);

    console.error.restore();
    console.error = consoleError;
  });
});
