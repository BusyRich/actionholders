module.exports = function(server) {
  var fs = require('fs'),
      Joi = require('joi'),
      image = require('./controllers/image');

  // simple request helper for image routes
  var replyImage = function(request, reply) {
    var code = request.query.image,
        width = request.params.width,
        height = request.params.height;

    if(request.params.hasOwnProperty('size')) {
      width = request.params.size;
      height = request.params.size;
    }

    if(typeof code === 'string') {
      code = code.toLowerCase();
    }

    image.get(code, width, height, function(err, img) {
      if(err) {
        console.error(err);
        reply('Internal Server Error').code(500);
      } else {
        reply(fs.createReadStream(img)).type('image/jpeg');
      }
    });
  };

  // common validation
  var validation = {
    size: Joi.number().min(0).max(1500).integer()
  };

  // index page
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: './public',
        index: true
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply.view('index', {images:image.originals});
    }
  });

  // square image
  server.route({
    method: 'GET',
    path: '/i/{size}',
    config: {
      validate: {
        params: {
          size: validation.size
        },
        query: {
          image: Joi.string()
        }
      }
    },
    handler: replyImage
  });

  // custom width/height
  server.route({
    method: 'GET',
    path: '/i/{width}/{height}',
    config: {
      validate: {
        params: {
          width: validation.size,
          height: validation.size
        },
        query: {
          image: Joi.string()
        }
      }
    },
    handler: replyImage
  });
};
