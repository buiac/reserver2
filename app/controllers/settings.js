/* dashboard
 */

module.exports = function(config, db) {
  'use strict';

  var express = require('express');
  var request = require('superagent');
  var async = require('async');
  var fs = require('fs');
  var util = require('util');
  var passport = require('passport');

  var validateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  var viewSettings = function (req, res, next) {
    var user = req.user;
    user.validEmail = validateEmail(user.username);
    
    if (user.validEmail) {
      res.render('settings', {
        errors: [],
        orgId: req.params.orgId,
        user: user
      });
    } else {
      res.redirect('/dashboard')
    }
    
  };

  var updateSettings = function (req, res, next) {
  };

  return {
    viewSettings: viewSettings,
    updateSettings: updateSettings
  };

};
