const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Entry = mongoose.model('Entry');

router.get('/', function (req, res) {
  res.render('index');
});

module.exports = router;
