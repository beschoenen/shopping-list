const mongoose = require('mongoose');
const Entry = mongoose.model('Entry');

const users = [];

module.exports = function (io) {

  io.on('connection', function (socket) {
    const userId = Math.random().toString(36).substring(7);
    users.push(userId);

    socket.emit('connected', {
      id: userId
    });

    io.emit('users-changed', {
      users: users.length
    });

    socket.on('disconnect', function () {
      users.splice(users.indexOf(userId), 1);

      io.emit('users-changed', {
        users: users.length
      });
    });

    socket.on('typing', function (data) {
      io.emit('typed', data);
    });

    socket.on('saving', function (data) {
      new Entry({ text: data.text }).save(function (error, entry) {
        io.emit('saved', {
          tempId: data.id,
          entry: entry.toJSON
        });
      });
    });

    socket.on('checking', function (data) {
      Entry.findOneAndUpdate({ _id: data.id }, { $set: { checked: data.state } }, { new: true }, function (error, entry) {
        io.emit('checked', entry.toJSON);
      });
    });

    socket.on('clearing', function () {
      Entry.remove({ checked: true }, function () {
        io.emit('cleared');
      });
    });
  });

};
