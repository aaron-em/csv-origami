var util = require('util')
  , CsvOrigami = require('lib/csv-origami')
  , StreamWrapper = require('lib/stream-wrapper');

/**
 * Instantiate and return either a CsvOrigami or a StreamWrapper,
 * depending on whether the streamMode option is given.
 *
 * @param {Object} options - CsvOrigami options, plus "streamMode".
 */
module.exports = function(options) {
  options = options || {};

  if (options.streamMode === true) {
    return new StreamWrapper(options);
  } else {
    return new CsvOrigami(options);
  }
};
