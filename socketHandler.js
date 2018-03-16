const mongoose = require('mongoose');
const Entry = mongoose.model('Entry');

const users = [];

module.exports = io => {

  io.on('connection', socket => {
    const userId = Math.random().toString(36).substring(7);
    users.push(userId);

    io.emit('users-changed', { users: users.length });

    Entry.find().sort({ checked: 1, _id: -1 }).exec().then(entries => {
      socket.emit('connected', {
        id: userId,
        entries: entries.map(entry => entry.toJSON),
        suggestions: []
      });
    });

    /////////
    // Events

    socket.on('disconnect', () => {
      users.splice(users.indexOf(userId), 1);

      io.emit('users-changed', { users: users.length });
    });

    socket.on('typing', data => io.emit('typed', data));

    socket.on('saving', data => {
      new Entry({ text: data.text }).save((error, entry) => {
        io.emit('saved', {
          tempId: data.id,
          entry: entry.toJSON
        });
      });
    });

    socket.on('checking', data => {
      Entry.findOneAndUpdate({ _id: data.id }, { $set: { checked: data.state } }, { new: true }, (error, entry) => {
        io.emit('checked', entry.toJSON);
      });
    });

    socket.on('removing', data => {
      Entry.remove({ _id: data.id }, () => io.emit('removed', { id: data.id }));
    });

    socket.on('clearing', () => {
      Entry.remove({ checked: true }, () => io.emit('cleared'));
    });
  });

};
