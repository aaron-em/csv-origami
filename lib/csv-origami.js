var CsvOrigami;

/**
 * @typedef {OptionsHash}
 * @type {Object}
 * @property {Boolean} streamMode - Whether to expect rows of CSV data, or a whole blob.
 * @property {string} delimiter - String delimiting values in array columns.
 * @property {string[]} headers - Headers of the CSV content to parse.
 * @property {string[]} arrayColumns - Headers of CSV columns with array content.
 */

/**
 * Construct a CsvOrigami instance.
 *
 * @param {OptionsHash} options - Options controlling the instance's behavior.
 * @returns {Object} A CsvOrigami instance.
 */
CsvOrigami = function(options) {
  var self = this
    , errors = [];

  options = options || {};

  if (options.streamMode === true) {
    if (!Array.isArray(options.headers) || options.headers.length === 0) {
      errors.push('Stream mode requires headers in constructor options');
    }

    if (!Array.isArray(options.arrayColumns)) {
      errors.push('Stream mode requires arrayColumns in constructor options');
    }

    if (errors.length > 0) {
      throw new Error('Unable to instantiate CsvOrigami: ' + errors.join('; '));
    }
  }


  this.arrayColumns = []; // Columns known to have array values.
  this.fixColumns = {};   // Columns known to require array fixup.
  this.headers = options.headers || undefined;

  this.options = {
    arrayDelimiter: options.delimiter || ';'
  };

  (options.arrayColumns || []).forEach(function(column) {
    self.arrayColumns.push(column);
  });

  this.arrayMatcher = new RegExp(this.options.arrayDelimiter);
};

/**
 * Parse a complete CSV data collection (an array of arrays of
 * strings).
 * @param {Array[String[]]} data - The data collection to parse.
 * @returns {Object[]} An array of JSON objects folded from rows.
 */
CsvOrigami.prototype.parse = function(data) {
  var self = this
    , folded = []
    , startRow = 0
    , headers
    , row
    , col;

  // we can take headers as part of the blob, in this case
  if (typeof this.headers === 'undefined') {
    this.headers = data[0];
    startRow = 1;
  }

  for (row = startRow; row < data.length; row++) {
    folded.push(this.parseRow(data[row], row));
  }

  return fixArrayColumns(folded, this.fixColumns);
};

/**
 * Parse a single row of CSV data (an array of strings).
 *
 * Called by the parse method, once per (non-header) row. Can also be
 * called independently, as for example by a streaming CSV parser, to
 * fold each row as it arrives; this use case requires a value of
 * undefined for 'index', and that the 'headers' and 'arrayColumns'
 * options be passed to the constructor.
 *
 * @param {String[]} row - The row of CSV data to parse.
 * @param {Integer|undefined} index - The index of this row in an array of CSV rows.
 * @returns {Object} A JSON object folded from the row.
 */
CsvOrigami.prototype.parseRow = function(row, index) {
  var self = this
    , foldedRow = {}
    , header
    , cell
    , i
    , setValue;

  if (typeof this.headers === 'undefined' || this.headers.length === 0) {
    throw new Error('Can\'t parse row without known headers');
  }

  /**
   * Assign a cell value to its appropriate position in the folded
   * row.
   *
   * Values of cells in array columns are individually pushed into the
   * array; values of object cells are assigned to a property keyed by
   * the 'leaf' parameter.
   *
   * If parsing a complete blob, and the cell value is detected to
   * contain the array delimiter while the column isn't known to be an
   * array column, the column's header is added to the object's
   * arrayColumns array, and a post-parse array fixup is scheduled for
   * the column.
   *
   * @type {DescenderCallback}
   */
  setValue = function(target, leaf) {
    var columnIsArray = false;

    if (self.arrayColumns.indexOf(header) !== -1) {
      columnIsArray = true;
    } else if (typeof index !== 'undefined' && cell.match(self.arrayMatcher)) {
      // previously unknown array column in whole-blob mode
      columnIsArray = true;
      self.arrayColumns.push(header);
      self.fixColumns[header] = index;
    }

    if (columnIsArray) {
      if (typeof target[leaf] === 'undefined') {
        target[leaf] = [];
      }
      cell.split(self.arrayMatcher).forEach(function(val) {
        target[leaf].push(val);
      });
    } else {
      target[leaf] = cell;
    }
  };

  for (i = 0; i < row.length; i++) {
    header = this.headers[i];
    cell = row[i];

    descendInto(foldedRow, header, setValue);
  }

  return foldedRow;
};

/**
 * Perform array column fixup on an array of folded JSON blobs.
 *
 * When parsing a complete CSV collection without knowing array
 * columns in advance, identifying array columns prior to parsing
 * would require scanning arbitrarily deep into the content. To avoid
 * this, the parser identifies array columns as it goes, and schedules
 * previously unidentified array columns to have their string values
 * boxed into arrays after parsing is complete.
 *
 * @param {Object[]} content - The array of blobs on which to operate.
 * @param {Object.<String, Integer>} fixColumns - Hash of columns needing fixup, and where to stop.
 * @returns {Object[]} The received content, with array columns fixed.
 */
function fixArrayColumns(content, fixColumns) {
  /**
   * Perform array column fixup.
   * @type {DescenderCallback}
   */
  var fixValue = function(target, leaf) {
      if (typeof target[leaf] === 'string') {
        target[leaf] = [target[leaf]];
      }
    };

  Object.keys(fixColumns).forEach(function(path) {
    for (var i = 0; i < fixColumns[path]; i++) {
      descendInto(content[i], path, fixValue);
    }
  });

  return content;
}

/**
 * Descend into a JSON object, following a period-delimited path to a
 * given property and creating nested collections as necessary along
 * the way, and upon arrival execute a callback on that property. The
 * last element of 'path' identifies the property on which to operate.
 *
 * Note well! This function modifies its first argument in place.
 *
 * For example, given path "foo.bar", content:
 * {
 *   "foo": {
 *   }
 * }
 * and callback:
 * function(target, leaf) {
 *   target[leaf] = "baz";
 * };
 * the result, in 'content', would be:
 * {
 *   "foo": {
 *     "bar": "baz"
 *   }
 * }
 *
 * @param {Object} content - The JSON object into which to descend.
 * @param {String} path - The path to follow into the object.
 * @param {DescenderCallback} callback - The callback to execute on arrival.
 */
function descendInto(content, path, callback) {
  var target = content
    , nodes = path.split(/\./)
    , leaf = nodes.pop();

  nodes.forEach(function(node) {
    if (typeof target[node] === 'undefined') {
      target[node] = {};
    }
    target = target[node];
  });

  callback(target, leaf);
}

/**
 * @callback {DescenderCallback}
 * @param {Object} target - A collection.
 * @param {String} leaf - A (possibly not yet defined) property in that collection.
 */

module.exports = CsvOrigami;
