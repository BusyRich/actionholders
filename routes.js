module.exports = function(server) {
  var fs = require('fs'),
      Joi = require('joi'),
      image = require('./controllers/image');

  // simple request helper for image routes
  var replyImage = function(request, reply) {
    var code = request.params.code,
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

  // square image
  server.route({
    method: 'GET',
    path: '/i/{size}',
    config: {
      validate: {
        path: {
          size: validation.size
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
        path: {
          width: validation.size,
          height: validation.size
        }
      }
    },
    handler: replyImage
  });

  // specific image with custom width/height
  server.route({
    method: 'GET',
    path: '/i/{code}/{width}/{height}',
    config: {
      validate: {
        path: {
          width: validation.size,
          height: validation.size,
          code: Joi.string()
        }
      }
    },
    handler: replyImage
  });
};
