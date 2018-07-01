"use strict";

module.exports = {
  log: {
    info: function() {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    },

    error: function() {
      console.error.apply(console, Array.prototype.slice.call(arguments));
    }
  }
};
