process.config = require('figgs').load();

var path = require('path'),
    Hapi = require('hapi'),
    server = Hapi.createServer(process.config.port);

server.views({
  engines: {
    hbs: require('handlebars')
  },
  path: path.join(__dirname, 'views')
});

require('./routes')(server);

server.start(function() {
  console.log('Server listening on port %s', server.info.port);
});
