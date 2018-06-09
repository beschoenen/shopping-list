const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');

const app = express();

const mongoHost = process.env.MONGO_HOST || 'localhost';

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${mongoHost}/shopping-list`, { useMongoClient: true }).then(() => {
  console.log("Connected to MongoDB.");
}).catch(error => {
  console.log(`MongoDB connection error. Please make sure MongoDB is running. ${error}`);
  process.exit(1);
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
