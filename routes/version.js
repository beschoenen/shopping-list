const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { version } = require('../package.json');

router.get('/', async (req, res) => {
  const info = await new Promise((resolve, reject) => {
    new mongoose.mongo.Admin(mongoose.connection.db).buildInfo((err, info) => {
      err ? reject(err) : resolve(info);
    });
  });

  res.setHeader('Content-Type', 'application/json');

  res.json({
    mongo: info.version,
    app: version,
  });
});

module.exports = router;
