const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');
const handlebars = require('hbs');

const app = express();

mongoose.connect('mongodb://localhost/shopping-list', {
  useMongoClient: true,
  promiseLibrary: global.Promise
});

require('./models/entry');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(sassMiddleware({ src: __dirname }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));

app.use((req, res) => res.redirect('/'));

handlebars.registerHelper('ifAnyChecked', (value, options) => {
  if (value.filter(e => e.checked).length > 0) {
    return options.fn(this);
  }
});

module.exports = app;
