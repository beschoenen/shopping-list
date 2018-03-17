const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Room = mongoose.model('Room');

router.get('/', function (req, res) {
  Room.findOneAndUpdate(
    { name: 'default' },
    { name: 'default' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec().then(room => {
    res.render('index', { room: room });
  });
});

router.get('/:room', function (req, res) {
  Room.findOneAndUpdate(
    { name: req.params.room },
    { name: req.params.room },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec().then(room => {
    res.render('index', { room: room });
  });
});

module.exports = router;
