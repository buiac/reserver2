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

  var list = function (req, res, next) {
    // body...
  };

  return {
    // view: view,
    list: list
  };

};
