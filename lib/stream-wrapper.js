var TransformStream = require('stream').Transform
  , CsvOrigami = require('./csv-origami')
  , util = require('util')
  , StreamWrapper;

/**
 * Wrap a Node transform stream around CsvOrigami.
 *
 * @param {Object} options - CsvOrigami options.
 */
StreamWrapper = function(options) {
  TransformStream.call(this, {objectMode: true});
  this.folder = new CsvOrigami(options);
};
util.inherits(StreamWrapper, TransformStream);

/**
 * Implement the TransformStream interface around CsvOrigami's
 * parseRow method.
 *
 * @param {Object} chunk - A row of CSV data.
 * @param {String} encoding - Not used.
 * @param {Function} done - The sending stream's done callback.
 */
StreamWrapper.prototype._transform = function(chunk, encoding, done) {
  this.push(this.folder.parseRow(chunk));
  done();
};

module.exports = StreamWrapper;