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
      userRoom = room;

      socket.join(room.name);

      emitClients();

      Entry.find({ room: room._id }).sort({ checked: 1, _id: -1 }).exec().then(entries => {
        socket.emit('connected', { entries: entries.map(entry => entry.toJSON) });
        socket.emit('suggestions-changed', { suggestions: room.suggestions });
      });
    });

    //////////////////
    // Events Handlers

    socket.on('disconnect', () => {
      if (!userRoom) return;

      emitClients();
    });

    socket.on('typing', data => io.sockets.in(userRoom.name).emit('typed', { socketId: socket.id, data: data }));

    socket.on('saving', data => {
      Entry.create({ text: data.text, room: userRoom._id }).then(entry => {
        io.sockets.in(userRoom.name).emit('saved', { tempId: data.id, entry: entry.toJSON });

        if (userRoom.suggestions.indexOf(data.text) === -1) {
          userRoom.suggestions.push(data.text);

          Room.update({ _id: userRoom._id }, { $set: { suggestions: userRoom.suggestions } }, () => {
            io.sockets.in(userRoom.name).emit('suggestions-changed', { suggestions: userRoom.suggestions });
          });
        }
      });
    });

    socket.on('checking', data => {
      Entry.findOneAndUpdate(
        { _id: data.id, room: userRoom._id },
        { $set: { checked: data.state } },
        { new: true },
        (error, entry) => {
          if (!entry) return;

          io.sockets.in(userRoom.name).emit('checked', entry.toJSON);
        }
      );
    });

    socket.on('removing', data => {
      Entry.remove({ _id: data.id, room: userRoom._id }, () => {
        io.sockets.in(userRoom.name).emit('removed', data);
      });
    });

    socket.on('clearing', () => {
      Entry.remove({ checked: true, room: userRoom._id }, () => {
        io.sockets.in(userRoom.name).emit('cleared');
      });
    });

    /////////////////
    // Helper methods

    function emitClients () {
      io.sockets.in(userRoom.name).clients((error, clients) => {
        io.sockets.in(userRoom.name).emit('users-changed', { users: clients.length });
      });
    }
  });

};
