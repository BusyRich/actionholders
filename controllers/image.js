var async = require('async'),
    mongoose = require('mongoose'),
    magick = require('gm').subClass({imageMagick:true}),
    originals = {
      length: 4, // helper for random choices
      'a1': 'arnold-1.jpg',
      'a2': 'arnold-2.jpg',
      'a3': 'arnold-3.jpg',
      'a4': 'arnold-4.jpg'
    };

module.exports = image = {};

// connect to the db
mongoose.connect(process.config.mongodb);

// create an image model
var imageSchema = mongoose.Schema({
      original: String,
      width: {type: Number, required: true},
      height: {type: Number, required: true},
      path: {type: String, required: true}
    }),
    model = mongoose.model('Image', imageSchema);

image.create =  function(original, width, height, callback) {
  var img = process.config.to + '/' + original + '-' + width + 'x' + height + '.jpg';
  console.log('Creating image %s', img);

  magick(process.config.from + originals[original])
    .resize(width, height, '^')
    .gravity('center')
    .crop(width, height, 0, 0)
    .write(img, function(err) {
      if(err) {
        return callback(err);
      }

      model.create({
        original: original,
        width: width,
        height: height,
        path: img
      }, callback);
    });
};

// picks a random image to use
image.rand = function() {
  var r = Math.floor(Math.random() * originals.length) + 1,
      i = 0;

  for(var o in originals) {
    // skip the first property "length"
    if(i === 0) {
      i++;
      continue;
    }

    if(i === r) {
      return o;
    }

    i++;
  }

  return o;
};

image.get = function(original, width, height, callback) {
  var query = {
    width: width,
    height: height
  };

  if(typeof original === 'string' && originals.hasOwnProperty(original) && original !== 'length') {
    query.original = original.toLowerCase();
  } else if(typeof original === 'number') {
    query.original = this.rand();
    query.width = original;
    query.height = width;
    callback = height;
  } else {
    query.original = this.rand();
  }

  var self = this;
  async.waterfall([
    function(cb) {
      model.findOne(query, cb);
    },

    function(img, cb) {
      if(!img) {
        self.create(query.original, query.width, query.height, cb);
      } else {
        cb(null, img);
      }
    }
  ], function(err, img) {
    if(err) {
      return callback(err, null);
    }

    callback(null, img.path);
  });
};
