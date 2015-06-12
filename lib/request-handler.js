var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find().exec(function(links) {
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({ 'url': uri }, function(found) {
    if (found) {
      console.log("found is true :" + found);
      res.send(200, found.attributes);
    } else {
      console.log("found is false :" + found);
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          'url': uri,
          'title': title,
          'base_url': req.headers.origin
        });

        link.save(function(err, newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ 'username': username }, function(err, user) {
      if (!user) {
        console.log(user.username, "was undefinedddd");
        res.redirect('/login');
      } else {
        console.log("checking password on user: " + user);
        user.verifyPassword(password, function(err, valid){
          if (err){
            console.log("ERR verify pass")
          }
          if (valid) {
            util.createSession(req, res, user);
          }
          else {
            res.redirect('/login');
          }
        });
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

   User
    .find({ 'username': username }, function(err, user){
      if(err){
        throw err;
      }
      if (user.username === undefined) {
        var newUser = new User({
          'username': username,
          'password': password
        });
        newUser.save(function(err, newUser) {
          if(err){
            console.log('err2')
            throw err
          }
            util.createSession(req, res, newUser);
        });
      } else {
        res.redirect('/signup');
      }
    })
};

exports.navToLink = function(req, res) {
  console.log("Favicon: " + req.params[0]);
  Link.find({ code: req.params[0] }).exec(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};
