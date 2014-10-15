var chai = require('chai')
  , expect = chai.expect
  , stream = require('stream')
  , StreamWrapper = require('lib/stream-wrapper')
  , CsvOrigami = require('lib/csv-origami');

describe('Stream wrapper', function() {
  var subject
    , fixture = [
      ['foo', 'bar'],
      ['1', '2']
    ];

  beforeEach(function() {
    subject = new StreamWrapper({
      headers: fixture[0],
      arrayColumns: []
    });
  });

  it('should inherit TransformStream', function() {
    expect(subject)
      .to.be.instanceof(stream.Transform);
  });

  it('should have a "folder" property that is a CsvOrigami instance', function() {
    expect(subject)
      .to.include.key('folder');
    expect(subject.folder)
      .to.be.instanceof(CsvOrigami);
  });

  it('should define _transform to push a parsed row', function(done) {
    var from = new stream.Readable({objectMode: true})
      , to = new stream.Writable({objectMode: true});

    from._read = function() {};
    to._write = function(chunk) {
      try {
        expect(chunk)
          .to.deep.equal({
            foo: '1',
            bar: '2'
          });
        done();
      } catch (err) {
        done(err);
      }
    };

    from.pipe(subject).pipe(to);
    from.push(fixture[1]);
  });
});