"use strict";

const logger = require("logger-rotate");

module.exports = {
  log: {
    info: function() {
      logger.logSync(Array.from(arguments).join(" "), false);
    },

    infoSilent: function() {
      logger.logSync(Array.from(arguments).join(" "), true);
    },

    error: function() {
      logger.errorSync(Array.from(arguments).join(" "), false);
    }
  }
};
