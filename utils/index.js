"use strict";

module.exports = {
  log: {
    info: function() {
      if (arguments[0] === "TEST_MESSAGE_FROM_UNIT_TESTING") {
        return true;
      }
      console.log.apply(console, Array.prototype.slice.call(arguments));
      return true;
    },

    error: function () {
      if (arguments[0] === "TEST_MESSAGE_FROM_UNIT_TESTING") {
        return true;
      }
      console.error.apply(console, Array.prototype.slice.call(arguments));
      return true;
    }
  }
};
