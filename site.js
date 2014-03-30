process.config = require('figgs').load();

var Hapi = require('hapi'),
    server = Hapi.createServer(process.config.port);

require('./routes')(server);

server.start(function() {
  console.log('Server listening on port %s', server.info.port);
});
