const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();

const Room = mongoose.model('Room');

router.get('/:room/sw.js', (req, res) => {
  res.sendFile('sw.js', { root: path.join(__dirname, 'public', 'js') });
});

router.get('/:room/manifest.json', (req, res) => {
  const name = req.params.room || 'default';

  res.setHeader('Content-Type', 'application/json');

  res.json({
    short_name: 'Shopping List',
    name: `Shopping List - ${name}`,
    icons: [
      {
        src: '/public/img/shopping-cart-128.png',
        type: 'image/png',
        sizes: '128x128'
      },
      {
        src: '/public/img/shopping-cart-192.png',
        type: 'image/png',
        sizes: '192x192'
      },
      {
        src: '/public/img/shopping-cart-256.png',
        type: 'image/png',
        sizes: '256x256'
      },
      {
        src: '/public/img/shopping-cart-512.png',
        type: 'image/png',
        sizes: '512x512'
      }
    ],
    start_url: `/${name}/`,
    display: 'standalone',
  });
});

router.get('/:room?', async (req, res) => {
  const name = req.params.room || 'default';

  const room = await Room.findOneAndUpdate(
    { name },
    { name },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec();

  res.render('room', { room });
});

module.exports = router;
