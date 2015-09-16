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


  var tempEvent =  function(req, res, next) {

    // db.users.findOne({'_id': req.user._id}, function (err, user) {

    //   if (!user) {
    //     res.send({error: err}, 400);
    //   }
      
    //   if (user) {
        
    //     res.render('settings', {
    //       user: user,
    //     });

    //   }

    // });

  };

  var listEvents = function(req, res, next) {

    db.events.find({
      orgId: req.params.orgId
    }).sort({
      date: -1
    }).exec(function (err, events) {

      if(err) {
        return res.send(err, 400);
      }

      if (!events.length) {
        events = [];
      }

      res.json(events);

    });

  };

  var createEventView = function (req, res, next) {

  };

  var listEventsView = function (req, res, next) {
    db.events.find({
      calendarId: req.params.orgId
    }).sort({
      date: -1
    }).exec(function (err, events) {

      if(err) {
        return res.send(err, 400);
      }

      if (!events.length) {
        events = [];
      }

      res.render('events', {
        events: events
      });

    });
  };

  var redirectToEventsList = function (req, res, next) {

    db.orgs.findOne({'userId': req.user._id}, function (err, org) {
      
      if (!org) {
        res.send({error: 'error'}, 400);
      }
      
      if (org) {

        res.redirect('/dashboard/' + org._id + '/events');

      }

    });

  };

  var updateEventView = function (req, res, next) {

    db.events.findOne({_id: req.params.eventId}, function (err, ev) {
      
      res.render('event-update', {
        ev: ev
      });

    });
    
  };

  var redirectToEventUpdate = function (req, res, next) {

    db.orgs.findOne({'userId': req.user._id}, function (err, org) {
          
      if (!org) {
        res.send({error: 'error'}, 400);
      }
      
      if (org) {

        // 

        db.events.findOne({orgId: org._id}, function (err, ev) {
          
          if (!ev) {
            res.send({error: 'error'}, 400);
          }

          res.redirect('/dashboard/' + org._id + '/events/' + ev._id);

        });

      }

    });

  };
  
  return {
    tempEvent: tempEvent,
    listEventsView: listEventsView,
    listEvents: listEvents,
    redirectToEventsList: redirectToEventsList,
    redirectToEventUpdate: redirectToEventUpdate,
    createEventView: createEventView,
    updateEventView: updateEventView
  };

};
