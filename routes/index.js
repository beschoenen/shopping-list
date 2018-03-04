const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Entry = mongoose.model('Entry');

const RandomItemList = [
  "Eggs",
  "Bread",
  "Milk",
  "Cookies",
  "Vegetables"
];

router.get('/', function (req, res) {
  Entry.find().sort({ checked: 1, _id: -1 }).exec().then(entries => {
    res.render('index', {
      entries: entries.map(entry => entry.toJSON),
      item: RandomItemList[Math.floor(Math.random() * RandomItemList.length)]
    });
  })
});

module.exports = router;
