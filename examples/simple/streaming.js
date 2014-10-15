var CsvOrigami = require('..')
  , stream = require('stream')
  , csvFolder
  , mockParser
  , stdoutWriter
  , csv;

csv = [
  ['address.email', 'address.name', 'address.return_path', 'metadata.place', 'substitution_data.foo', 'substitution_data.bar', 'substitution_data.baz.foo', 'substitution_data.baz.bar', 'tags'],
  ['peas@ham.com', '"Pease Porridge"', 'peas@ham.com', 'Foobar', '2', 'b', 'welp', 'hi', 'omgwtf'],
  ['ham@peas.com', '"Ham Peas"', 'ham@peas.com', 'Gooberville', '1', 'a', 'foo', 'bar', 'fun;fact']
];

csvFolder = new CsvOrigami({
  streamMode: true,
  headers: csv.shift(),
  arrayColumns: ['tags']
});

mockParser = new stream.Readable({objectMode: true});
mockParser._read = function() {};

stdoutWriter = new stream.Writable({objectMode: true});
stdoutWriter._write = function(chunk, encoding, done) {
  process.stdout.write(JSON.stringify(chunk, false, 2) + '\n');
  done();
};

mockParser.pipe(csvFolder).pipe(stdoutWriter);

while (csv.length > 0) {
  mockParser.push(csv.shift());
}