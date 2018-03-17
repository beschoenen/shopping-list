const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  name: { type: String, required: true },
  suggestions: { type: Array, default: [] }
});

roomSchema.virtual('toJSON').get(function () {
  return {
    id: this._id,
    name: this.name,
    suggestions: this.suggestions
  }
});

module.exports = mongoose.model('Room', roomSchema);
