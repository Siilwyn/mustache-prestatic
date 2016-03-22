'use strict';

module.exports = function (verbose) {
  return function () {
    if (verbose) {
      console.log(...arguments);
    }
  };
};
