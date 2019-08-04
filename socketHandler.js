const mongoose = require('mongoose');
const Entry = mongoose.model('Entry');
const Room = mongoose.model('Room');

module.exports = io => {

  io.on('connection', socket => {
    let userRoom = null;

    if (!socket.handshake.query.room) {
      socket.disconnect();
    }

    Room.findOne({ name: socket.handshake.query.room }).exec().then(room => {
      if (!room) return socket.disconnect();

      userRoom = room;

      socket.join(room.name);

      emitClients();

      Entry.find({ room: room._id }).sort({ checked: 1, _id: -1 }).exec().then(entries => {
        socket.emit('connected', { entries: entries.map(entry => entry.toJSON) });
        socket.emit('suggestions-changed', room.suggestions);
      });
    });

    //////////////////
    // Events Handlers

    socket.on('disconnect', () => userRoom && emitClients());

    socket.on('typing', data => socket.to(userRoom.name).emit('typed', data));

    socket.on('saving', data => {
      Entry.create({ text: data.text, room: userRoom._id }).then(entry => {
        io.sockets.in(userRoom.name).emit('saved', { tempId: data.id, entry: entry.toJSON });

        if (userRoom.suggestions.indexOf(data.text) > -1) return;

        userRoom.suggestions.push(data.text);

        Room.update({ _id: userRoom._id }, { $set: { suggestions: userRoom.suggestions } }, error => {
          if (!error) io.sockets.in(userRoom.name).emit('suggestions-changed', userRoom.suggestions);
        });
      });
    });

    socket.on('checking', data => {
      Entry.findOneAndUpdate(
        { _id: data.id, room: userRoom._id },
        { $set: { checked: data.state } },
        { new: true },
        (error, entry) => {
          if (entry) io.sockets.in(userRoom.name).emit('checked', entry.toJSON);
        }
      );
    });

    socket.on('removing', data => {
      Entry.remove({ _id: data.id, room: userRoom._id }, error => {
        if (!error) io.sockets.in(userRoom.name).emit('removed', data);
      });
    });

    socket.on('clearing', () => {
      Entry.remove({ checked: true, room: userRoom._id }, error => {
        if (!error) io.sockets.in(userRoom.name).emit('cleared');
      });
    });

    socket.on('clearing-suggestions', () => {
      userRoom.suggestions = [];

      Room.update({ _id: userRoom._id }, { $set: { suggestions: userRoom.suggestions } }, error => {
        if (!error) io.sockets.in(userRoom.name).emit('suggestions-changed', []);
      });
    });

    /////////////////
    // Helper methods

    function emitClients () {
      io.sockets.in(userRoom.name).clients((error, clients) => {
        io.sockets.in(userRoom.name).emit('users-changed', clients.length);
      });
    }
  });

};
