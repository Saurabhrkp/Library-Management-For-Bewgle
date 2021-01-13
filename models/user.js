const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { flat: String, street: String },
  username: { type: String, required: true, unique: true },
  borrowed: {
    books: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        returnDate: { type: Date, required: true },
      },
    ],
  },
});

userSchema.methods.borrowBook = function (book) {
  const borrowedBookIndex = this.borrowed.books.findIndex((cp) => {
    return cp.bookId.toString() === book._id.toString();
  });
  let date = new Date(); // Now
  date.setDate(date.getDate() + 30); // Set now + 30 days as the new date
  const updatedBorrowedBooks = [...this.borrowed.books];

  if (borrowedBookIndex >= 0) {
    updatedBorrowedBooks[borrowedBookIndex].returnDate = date;
  } else {
    updatedBorrowedBooks.push({
      bookId: book,
      returnDate: date,
    });
  }
  const updatedBorrowed = {
    books: updatedBorrowedBooks,
  };
  this.borrowed = updatedBorrowed;
  return this.save();
};

userSchema.methods.returnBorrowedBook = function (bookId) {
  const updatedBorrowedBooks = this.borrowed.books.filter((book) => {
    return book.bookId.toString() !== bookId.toString();
  });
  this.borrowed.books = updatedBorrowedBooks;
  return this.save();
};

userSchema.methods.returnBothBorrowedBook = function () {
  this.borrowed = { books: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
