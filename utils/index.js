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

    infoConsole: function() {
      console.log.apply(console, arguments);
    },

    error: function() {
      logger.errorSync(Array.from(arguments).join(" "), false);
    },

    showRecent: function(lines) {
      console.log(logger.showRecent(lines));
    }
  }
};
