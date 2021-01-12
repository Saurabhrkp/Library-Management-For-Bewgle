const mongoose = require('mongoose');
const shortId = require('crypto-random-string');
const Schema = mongoose.Schema;

function URI() {
  return shortId(12);
}

const bookSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  summary: { type: String, required: true },
  isbn: { type: String, default: URI() },
  usersBorrowed: [{ type: Schema.ObjectId, ref: 'User' }],
  available: { type: Boolean, default: true },
  coverImageID: { type: String, required: true },
});

module.exports = mongoose.model('Book', bookSchema);
