const Book = require('../models/book');
const User = require('../models/user');

exports.getBookByID = async (req, res, next, bookId) => {
  try {
    req.book = await Book.findById(bookId);
    if (req.book !== null) {
      return next();
    }
    req.flash(
      'error_msg',
      `No Book with id: ${bookId}, may be because ID is incorrect or modified`
    );
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

exports.searchBook = async (req, res) => {
  books = await Book.find({ title: { $regex: req.body.text, $options: 'i' } });
  if (books.length > 0) {
    return res.render('index', {
      PAGE_TITLE: `Result for: ${req.body.text}`,
      PAGE_PATH: 'index',
      books,
    });
  }
  req.flash('error_msg', `No Book with name: ${req.body.text}.`);
  res.redirect('/');
};

exports.sendBookDetails = (req, res) => {
  res.render('book', {
    PAGE_PATH: 'index',
    PAGE_TITLE: req.book.title,
    book: req.book,
    user: req.user,
  });
};

exports.getBooks = async (req, res) => {
  const books = await Book.find({});
  res.render('index', {
    PAGE_TITLE: 'All Books',
    PAGE_PATH: 'index',
    books,
  });
};

exports.getBorrowed = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'borrowed.books.bookId',
    select: '-password -address',
  });
  const books = user.borrowed.books;
  res.render('borrow', {
    PAGE_PATH: 'borrow',
    PAGE_TITLE: 'Your Borrowed List',
    books: books,
    profile: req.profile,
  });
};

exports.postBorrowed = async (req, res) => {
  const bookId = req.body.bookId;
  await Book.findByIdAndUpdate(bookId, {
    available: false,
    $push: { usersBorrowed: req.user.id },
  });
  req.user.borrowBook(bookId);
  res.redirect(`/borrowed/${req.user.id}`);
};

exports.postReturnBorrowedBook = async (req, res) => {
  const bookId = req.body.bookId;
  await Book.findByIdAndUpdate(bookId, { available: true });
  await req.user.returnBorrowedBook(bookId);
  res.redirect(`/borrowed/${req.user.id}`);
};

exports.postReturnBothBorrowedBook = async (req, res) => {
  const books = req.body.books;
  async.each(books, (bookId, callback) => {
    Book.findByIdAndUpdate(bookId, { available: true }).exec(callback);
  });
  await req.user.returnBothBorrowedBook(bookId);
  res.redirect(`/borrowed/${req.user.id}`);
};
