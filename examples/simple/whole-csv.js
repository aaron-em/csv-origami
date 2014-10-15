var CsvOrigami = require('..')
  , csvFolder = new CsvOrigami()
  , csv;

csv = [
  ['address.email', 'address.name', 'address.return_path', 'metadata.place', 'substitution_data.foo', 'substitution_data.bar', 'substitution_data.baz.foo', 'substitution_data.baz.bar', 'tags'],
  ['peas@ham.com', '"Pease Porridge"', 'peas@ham.com', 'Foobar', '2', 'b', 'welp', 'hi', 'omgwtf'],
  ['ham@peas.com', '"Ham Peas"', 'ham@peas.com', 'Gooberville', '1', 'a', 'foo', 'bar', 'fun;fact']
];

process.stdout.write(JSON.stringify(csvFolder.parse(csv), false, 2));
