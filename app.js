const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');

const app = express();

const mongoHost = process.env.MONGO_HOST || 'localhost';

mongoose.connect(`mongodb://${mongoHost}/shopping-list`, {
  useMongoClient: true,
  promiseLibrary: global.Promise
});

require('./models/entry');
require('./models/room');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(sassMiddleware({ src: __dirname }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));

app.use((req, res) => res.redirect('/'));

module.exports = app;
