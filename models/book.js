const mongoose = require('mongoose');
const shortId = require('crypto-random-string');
const Schema = mongoose.Schema;

function URI() {
  return (random = shortId({ length: 12 }));
}

const bookSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  summary: { type: String, required: true },
  isbn: { type: String, default: URI() },
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Book', bookSchema);
