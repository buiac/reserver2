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
  var moment = require('moment');
  moment.defaultFormat = 'YYYY-MM-DD LT';

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

    if (req.params.eventId) {

      db.events.findOne({
        _id: req.params.eventId
      }).exec(function (err, theEvent) {

        if(err) {
          return res.render('event-update', {errors: err});
        }

        if (!theEvent) {
          theEvent = {};
        }

        res.render('event-update', {
          errors: [],
          theEvent: theEvent,
          orgId: req.params.orgId,
          moment: moment
        });

      });

    } else {

      res.render('event-update', {
        errors: [],
        theEvent: {
          date: moment().format(),
          moment: moment
        }
      });

    }
    
  };

  var updateEvent = function (req, res, next) {

    req.checkBody('name', 'Event name should not be empty').notEmpty();
    req.checkBody('description', 'Event description should not be empty').notEmpty();
    req.checkBody('seats', 'Event seats should not be empty').notEmpty();
    req.checkBody('location', 'Event location should not be empty').notEmpty();

    var errors = req.validationErrors();
    var images = [];
    
    var name = (req.body.name) ? req.body.name.trim() : '';
    var description = (req.body.description) ? req.body.description.trim() : '';
    var eventId = (req.body._id) ? req.body._id.trim() : '';
    var seats = (req.body.seats) ? req.body.seats.trim() : '';
    var location = (req.body.location) ? req.body.location.trim() : '';
    var activeImage = parseInt(req.body.activeImage || 0);
    var mclistid = req.body.mclistid.trim();
    var orgId = req.params.orgId;

    var theEvent = {
      name: name,
      description: description,
      _id: eventId || '',
      images: images,
      date: new Date(req.body.date),
      seats: seats,
      location: location,
      activeImage: activeImage,
      mclistid: mclistid, // mailchimp list id
      orgId: orgId
    };
    
    // check if there's an image
    if (!req.files.images) {
            
      // for existing events,
      // if we don't add any new images, leave the old ones alone.
      if(req.body.existingImages) {
        

        theEvent.images = JSON.parse(req.body.existingImages);

        theEvent.images.forEach(function (image, i) {
          if (i === activeImage) {
            image.active = true;
          } else {
            image.active = false;
          }
        });

      } else {

        errors = errors || [];

        errors.push({
          msg: 'Please upload an event image'
        });  
        
      }

    } else if (!req.files.images.length) {

      images.push({
        path: '/media/' + req.files.images.originalname 
      });

    } else if (req.files.images.length) {

      req.files.images.forEach(function (image, i) {

        images.push({
          path: '/media/' + image.originalname
        });

      });

    }

    if (errors) {
      
      res.render('event-update', {
        theEvent: theEvent,
        orgId: orgId,
        errors: errors
      });

      return;

    }

    if (eventId) {

      db.events.update({
        '_id': eventId
      }, theEvent, function (err, num, newEvent) {

        if (err) {
          res.render('event-update', {
            errors: err,
            theEvent: theEvent
          });
        }

        if (num > 0) {
          
          res.redirect('/dashboard');

        }


      });

    } else {

      db.events.insert(theEvent, function (err, newEvent) {

        if (err) {
          res.render('event-update', {errors: err});
        }

        res.redirect('/dashboard');

      });

    }

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
    listEventsView: listEventsView,
    listEvents: listEvents,
    redirectToEventsList: redirectToEventsList,
    redirectToEventUpdate: redirectToEventUpdate,
    updateEventView: updateEventView,
    updateEvent: updateEvent
  };

};
