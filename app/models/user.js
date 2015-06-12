var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: String,
  password: { type: String, required: true, bcrypt: true },
  date: { type: Date, default: Date.now }
});
userSchema.plugin(require('mongoose-bcrypt'));

var User = mongoose.model('User', userSchema);


module.exports = User;
