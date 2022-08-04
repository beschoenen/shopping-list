const express = require('express');
const path = require('path');
const router = express.Router();

const dependencies = [
  {
    folder: path.join(__dirname, '..', 'node_modules', 'socket.io', 'client-dist'),
    file: 'socket.io.min.js',
    slug: '/js/socket.io.min.js',
  },
  {
    folder: path.join(__dirname, '..', 'node_modules', 'jquery', 'dist'),
    file: 'jquery.min.js',
    slug: '/js/jquery.min.js',
  },
  {
    folder: path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js'),
    file: 'bootstrap.min.js',
    slug: '/js/bootstrap.min.js',
  },
  {
    folder: path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css'),
    file: 'bootstrap.min.css',
    slug: '/css/bootstrap.min.css',
  },
];

for (const dependency of dependencies) {
  router.get(dependency.slug, (req, res) => {
    res.sendFile(dependency.file, { root: dependency.folder });
  });
}

module.exports = router;
