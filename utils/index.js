"use strict";

const logger = require("logger-rotate");

module.exports = {
  log: {
    info: function() {
      logger.logSync(Array.from(arguments).join(" "));
    },

    error: function() {
      logger.errorSync(Array.from(arguments).join(" "));
    }
  }
};
