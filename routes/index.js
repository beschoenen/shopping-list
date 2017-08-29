var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Entry = mongoose.model('Entry');

var RandomItemList = [
  "Eggs",
  "Bread",
  "Milk",
  "Cookies",
  "Vegetables"
];

router.get('/', function (req, res) {
  Entry.find().sort('-_id').exec().then(function (entries) {
    res.render('index', {
      entries: entries,
      item: RandomItemList[Math.floor(Math.random() * RandomItemList.length)]
    });
  })
});

module.exports = router;
