var mongoose = require('mongoose');

var entrySchema = mongoose.Schema({
  checked: {type: Boolean, default: false},
  text: {type: String, required: true}
});

module.exports = mongoose.model("Entry", entrySchema);
