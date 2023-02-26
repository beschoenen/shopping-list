const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

const mongoHost = process.env.MONGO_HOST || '127.0.0.1';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoDB = process.env.MONGO_DB || 'shopping-list';

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${mongoHost}:${mongoPort}/${mongoDB}`).catch(error => {
  console.log(`MongoDB connection error. Please make sure MongoDB is running. ${error}`);
  process.exit(1);
}).then(() => console.log("Connected to MongoDB."));

require('./models');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', require('./routes/dependencies'));
app.use('/version', require('./routes/version'));
app.use('/', require('./routes/index'));

app.use((req, res) => res.redirect('/'));

module.exports = app;
