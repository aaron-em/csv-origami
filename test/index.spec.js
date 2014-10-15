var chai = require('chai')
  , expect = chai.expect
  , StreamWrapper = require('lib/stream-wrapper')
  , CsvOrigami = require('lib/csv-origami')
  , LibraryIndex = require('..');

describe('Library index', function() {
  var subject;

  describe('Stream mode', function() {
    it('should instantiate a StreamWrapper', function() {
      subject = new LibraryIndex({
        streamMode: true,
        headers: ['foo'],
        arrayColumns: []
      });

      expect(subject)
        .to.be.instanceof(StreamWrapper);
    });
  });

  describe('Vanilla mode', function() {
    it('should instantiate a CsvOrigami', function() {
      expect(new LibraryIndex())
        .to.be.instanceof(CsvOrigami);
    });
  });
});