const mongoose = require('mongoose');
const Entry = mongoose.model('Entry');
const Room = mongoose.model('Room');

class SocketHandler {
  constructor (io) {
    this.io = io;

    io.on('connection', async socket => {
      if (!socket.handshake.query.room) {
        socket.disconnect();
      }

      const room = await Room.findOne({ name: socket.handshake.query.room }).exec();

      if (!room) {
        socket.disconnect();
        return;
      }

      socket.join(room.name);
      socket.on('disconnect', () => this.onDisconnect(room));
      socket.on('typing', data => this.onTyping(data, room));
      socket.on('saving', data => this.onSaving(data, room));
      socket.on('checking', data => this.onChecking(data, room));
      socket.on('removing', data => this.onRemoving(data, room));
      socket.on('clearing', () => this.onClearing(room));
      socket.on('clearing-suggestions', () => this.onSuggestionsChanged([], room));

      await this.emitClients(room);

      const entries = await Entry.find({ room: room._id }).sort({ checked: 1, _id: -1 }).exec();

      socket.emit('connected', { entries: entries.map(entry => entry.toJSON) });
      socket.emit('suggestions-changed', room.suggestions);
    });
  }

  async onDisconnect (room) {
    if (room) {
      await this.emitClients(room);
    }
  }

  async onTyping (data, room) {
    this.io.sockets.in(room.name).emit('typed', data);
  }

  async onSaving (data, room) {
    const entry = await Entry.create({ text: data.text, room: room._id });

    this.io.sockets.in(room.name).emit('saved', { tempId: data.id, entry: entry.toJSON });

    if (room.suggestions.includes(data.text)) {
      return;
    }

    room.suggestions.push(data.text);

    await this.onSuggestionsChanged(room.suggestions, room);
  }

  async onChecking (data, room) {
    try {
      const entry = await Entry.findOneAndUpdate(
        { _id: data.id, room: room._id },
        { $set: { checked: data.state } },
        { new: true },
      ).exec();

      this.io.sockets.in(room.name).emit('checked', entry.toJSON);
    } catch (e) {
      // Nothing
    }
  }

  async onRemoving (data, room) {
    try {
      await Entry.deleteOne({ _id: data.id, room: room._id }).exec();

      this.io.sockets.in(room.name).emit('removed', data);
    } catch (e) {
      // Nothing
    }
  }

  async onClearing (room) {
    try {
      await Entry.deleteOne({ checked: true, room: room._id }).exec();

      this.io.sockets.in(room.name).emit('cleared');
    } catch (e) {
      // Nothing
    }
  }

  async onSuggestionsChanged (data, room) {
    try {
      await Room.updateOne({ _id: room._id }, { $set: { suggestions: data } }).exec();

      this.io.sockets.in(room.name).emit('suggestions-changed', data);
    } catch (e) {
      // Nothing
    }
  }

  async emitClients (room) {
    const sockets = await this.io.sockets.in(room.name).fetchSockets();

    this.io.sockets.in(room.name).emit('users-changed', sockets.length);
  }
}

module.exports = SocketHandler;
