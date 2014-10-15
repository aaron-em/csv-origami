require(['lib/csv-min', 'lib/csv-origami'], function(CsvOrigami) {
  var csvContent = []
    , index = 0;

  $(document.querySelector('button'))
    .on('click', readFile);

  function readFile() {
    var log = function() { console.log.apply(console, arguments); }
      , reader = new FileReader()
      , file
      , headers;

    file = document.querySelector('input[type=file]').files[0];
    if (file === 'undefined') {
      return;
    }

    reader.addEventListener('loadstart', function() {
      log('Reading source file');
    });

    reader.addEventListener('loadend', function() {
      log('Discovering headers')
      var rows = reader.result.split(/\n/)
        , headerRow = rows.shift();

      headers = Papa.parse(headerRow).data[0];
      parseFileContent(headers, rows.join('\n'));
    });

    reader.readAsText(file);
  };

  function parseFileContent(headers, text) {
    var folder = new CsvOrigami({
      streamMode: true,
      headers: headers,
      arrayColumns: []
    })
      , row = 0
      , startTime = new Date().getTime();

    Papa.parse(text, {
      worker: true,
      step: function(results, handle) {
        row += 1;
        csvContent.push(folder.parseRow(results.data[0]));
        if (row % 50000 === 0) {
          var now = new Date().getTime();
          console.log(row, 'rows', (now - startTime / 1000), 's');
        }
      },
      complete: function() {
        var finishTime = new Date().getTime();
        console.log('done with', row, 'rows in', (finishTime - startTime)/1000, 'seconds');
        updateViewer();
      }
    });
  };

  function updateViewer() {
    var item = csvContent[index];
    document.querySelector('#viewer > div.content')
      .innerHTML = JSON.stringify(item, false, 2);
  };
});