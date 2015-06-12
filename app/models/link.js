var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linksSchema = new mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number,
  date: { type: Date, default: Date.now }
});

var Link = mongoose.model('Link', linksSchema);

var createSha = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

linksSchema.pre('save', function(next){
  var code = createSha(this.url);
  this.code = code;
  next();
});


module.exports = Link
