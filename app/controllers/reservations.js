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
  var updateReservation = function (req, res, next) {
    req.checkBody('name', 'Va rugam sa completati numele.').notEmpty();
    req.checkBody('email', 'Va rugam sa completati email-ul.').notEmpty();
    req.checkBody('seats', 'Va rugam sa completati numarul de locuri.').notEmpty();

    var name = req.body.name.trim();
    var email = req.body.email.trim();
    var seats = req.body.seats;
    var waiting = req.body.waiting;
    var eventId = req.params.eventId;
    var orgId = req.params.orgId;
    // var mclistid = req.body.mclistid;

    var errors = req.validationErrors();

    if (errors) {
      res.status(400).json(errors);
      return;
    }


    var reservation = {
      name: name,
      email: email,
      seats: parseInt(seats),
      eventId: eventId,
      orgId: orgId,
      waiting: waiting,
      // mclistid: mclistid
    };

    var findEventReservations = function (err, reservations) {
      if (err) {
        res.status(400).json(err);
        return;
      }

      var reservedSeats = 0;
      var prevRes = false;
      // how many reservations have already been made for this event
      
      reservations.forEach(function (item) {
        reservedSeats = reservedSeats + parseInt(item.seats, 10);
        
        if (item.email === reservation.email) {
          prevRes = true;
        }
      });

      db.events.findOne({_id: eventId}, function (err, event) {
        if (err) {
          res.status(400).json(err);
          return;
        }

        var totalSeats = event.seats;
        
        // check if there are seats left 
        if (seats > (totalSeats - reservedSeats)) {
          reservation.waiting = true;
        }
        
        if (!prevRes) {
          db.reservations.insert(reservation, function (err, newReservation) {
            if (err) {
              res.status(400).json(err);
              return;
            }

            // update number of reservations on event object
            db.events.update(
              {_id: eventId}, 
              {$set: { reservedSeats: parseInt(reservedSeats, 10) + parseInt(seats, 10)}},
              function (err, num) {
                if (err) {
                  res.status(400).json(err);
                  return;
                }

                db.events.findOne({_id: eventId}, function (err, event) {
                  if (err) {
                    res.status(400).json(err);
                    return;
                  }

                  res.json({
                    message: 'Create successful.',
                    reservation: newReservation,
                    event: event
                  });

                });
              }
            );
          });
        } else {

          // upgrading or downgrading?
          db.reservations.findOne(
            {email: reservation.email}, 
            function (err, reserv) {

              if (reserv.seats === reservation.seats) {
                console.log('same seats')
                res.json({
                  message: 'Same seats',
                  reservation: reserv,
                  event: event
                });
                return;
              }

              if (reserv.seats < reservation.seats) {
                console.log('more seats')
                reservedSeats = reservedSeats + (parseInt(reservation.seats) - reserv.seats);
                console.log(reservedSeats)
              }

              if (reserv.seats > reservation.seats) {
                console.log('less seats')
                reservedSeats = reservedSeats - (reserv.seats - parseInt(reservation.seats)); 
                console.log(reservedSeats)
              }

              // update reserved seats on the event
              db.events.update(
                {_id: eventId}, 
                {$set: { reservedSeats: reservedSeats}},
                function (err, num) {
                  if (err) {
                    res.status(400).json(err);
                    return;
                  }
                }
              );

              db.reservations.update(
                {email: reservation.email},
                {$set: {seats: reservation.seats}},
                function (err, num) {
                  if (err) {
                    res.status(400).json(err);
                    return;
                  }

                  db.events.findOne({_id: eventId}, function (err, ev) {
                    if (err) {
                      res.status(400).json(err);
                      return;
                    }

                    res.json({
                      message: 'Update successful.',
                      reservation: reserv,
                      event: ev
                    });
                  });
                  
                }
              );
          });
        }
      });
    };

    db.reservations.find({eventId: eventId}, findEventReservations);

  };

  return {
    // view: view,
    list: list,
    updateReservation: updateReservation
  };

};
