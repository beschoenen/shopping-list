const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Room = mongoose.model('Room');

router.get('/:room?', async function (req, res) {
  const name = req.params.room || 'default';

  const room = await Room.findOneAndUpdate(
    { name },
    { name },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec();

  res.render('room', { room });
});

module.exports = router;
