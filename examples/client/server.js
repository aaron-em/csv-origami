var express = require('express')
  , argv = require('minimist')(process.argv.slice(2))
  , app = express()
  , port = argv.port || 3001;

app.use('/', express.static('public'));

console.log('CSV Origami client-side example reporting in on port ' + port + '!');
app.listen(port);