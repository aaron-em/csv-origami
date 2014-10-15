var chai = require('chai')
  , expect = chai.expect
  , _ = require('lodash')
  , CsvOrigami = require('lib/csv-origami');

describe('CSV Origami', function() {
  var subject
    , fixture = [
      ['foo', 'bar.foo', 'bar.bar', 'bar.baz', 'baz'],
      ['one', 'hi', 'there', 'y\'all', 'ham/peas'],
      ['two', 'how\'s', 'it', 'going', 'peas;ham'],
    ];

  describe('constructor', function() {
    it('should fail in stream mode without minimum required options', function(done) {
      try {
        subject = new CsvOrigami({
          streamMode: true
        });
        done(new Error('Should\'ve thrown'));
      } catch (err) {
        expect(err.message)
          .to.equal('Unable to instantiate CsvOrigami: '
                   + 'Stream mode requires headers in constructor options; '
                   + 'Stream mode requires arrayColumns in constructor options');
        done();
      }
    });

    it('should assign defaults correctly on instantiation', function() {
      subject = new CsvOrigami();

      expect(subject.arrayColumns)
        .to.be.instanceof(Array)
        .and.have.length(0);

      expect(subject.fixColumns)
        .to.be.instanceof(Object)
        .and.be.empty;

      expect(subject.headers)
        .to.equal(undefined);

      expect(subject.options.arrayDelimiter)
        .to.equal(';');

      expect(subject.arrayMatcher.toString())
        .to.equal(new RegExp(';').toString());
    });

    it('should assign passed options correctly on instantiation', function() {
      subject = new CsvOrigami({
        headers: ['foo', 'bar'],
        arrayColumns: ['baz'],
        delimiter: '|'
      });

      expect(subject.headers)
        .to.be.instanceof(Array)
        .and.deep.equal(['foo', 'bar']);

      expect(subject.arrayColumns)
        .to.be.instanceof(Array)
        .and.deep.equal(['baz']);

      expect(subject.options.arrayDelimiter)
        .to.equal('|');

      expect(subject.arrayMatcher.toString())
        .to.equal(new RegExp('|').toString());
    });
  });

  describe('whole-array parsing', function() {
    it('should correctly parse an array of CSV data', function() {
      var result;

      subject = new CsvOrigami({
        headers: fixture.slice(0, 1)[0],
        arrayColumns: ['baz']
      });

      result = subject.parse(fixture.slice(1));

      expect(result)
        .to.deep.equal([
          {
            'foo': 'one',
            'bar': {
              'foo': 'hi',
              'bar': 'there',
              'baz': 'y\'all'
            },
            baz: ['ham/peas']
          },
          {
            'foo': 'two',
            'bar': {
              'foo': 'how\'s',
              'bar': 'it',
              'baz': 'going'
            },
            baz: ['peas', 'ham']
          }
        ]);
    });

    it('should correctly handle a non-default delimiter', function() {
      var result;

      subject = new CsvOrigami({
        headers: fixture.slice(0, 1)[0],
        arrayColumns: ['baz'],
        delimiter: '/'
      });

      result = subject.parse(fixture.slice(1));

      expect(result[0].baz)
        .to.deep.equal(['ham', 'peas']);

      expect(result[1].baz)
        .to.deep.equal(['peas;ham']);
    });

    it('should capture headers when not provided at instantiation', function() {
      subject = new CsvOrigami();
      subject.parse(fixture);

      expect(subject.headers)
        .to.deep.equal(fixture[0]);
    });

    it('should fix up array columns when not provided at instantiation', function() {
      var result;

      subject = new CsvOrigami();
      result = subject.parse(fixture);

      expect(result[0].baz)
        .to.be.instanceof(Array)
        .and.deep.equal(['ham/peas']);
    });

    it('should not mutate its input data', function() {
      var fixtureCopy = _.cloneDeep(fixture);

      subject = new CsvOrigami();
      subject.parse(fixture);

      expect(fixture)
        .to.deep.equal(fixtureCopy);
    });

  });

  describe('row-by-row parsing', function() {
    it('should throw when no headers are defined', function(done) {
      subject = new CsvOrigami();
      try {
        subject.parseRow([]);
        done(new Error('Should\'ve thrown'));
      } catch (err) {
        expect(err.message)
          .to.equal('Can\'t parse row without known headers');
        done();
      }
    });

    it('should correctly parse a row of CSV data given the necessary options', function() {
      var result;

      subject = new CsvOrigami({
        headers: fixture.slice(0, 1)[0],
        arrayColumns: ['baz']
      });

      result = subject.parseRow(fixture[1]);

      expect(result)
        .to.deep.equal({
          'foo': 'one',
          'bar': {
            'foo': 'hi',
            'bar': 'there',
            'baz': 'y\'all'
          },
          baz: ['ham/peas']
        });
    });
  });
});