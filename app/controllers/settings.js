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
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  var viewSettings = function (req, res, next) {
    var user = req.user;
    user.validEmail = validateEmail(user.username);
    
    console.log('\n\n\n\n')
    console.log('--------')
    console.log(user.validEmail)
    console.log(user.username)
    console.log('--------')
    console.log('\n\n\n\n')

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
