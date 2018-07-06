"use strict";

module.exports = {
  log: {
    info: function() {
      console.log.apply(console, arguments);
    },

    error: function() {
      console.error.apply(console, arguments);
    }
  }
};
