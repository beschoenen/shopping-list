const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checked: { type: Boolean, default: false },
  text: { type: String, required: true }
});

entrySchema.virtual('toJSON').get(function () {
  return {
    id: this._id,
    text: this.text,
    checked: this.checked
  }
});

module.exports = mongoose.model('Entry', entrySchema);
