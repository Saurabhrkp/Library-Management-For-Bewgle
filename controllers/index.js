const Book = require('../models/book');
const User = require('../models/user');
const async = require('async');

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
      currentPage: false,
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
  let currentPage = req.query.page || 1,
    booksPerPage = 6,
    currentBooks = [];
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const totalPages = Math.ceil(books.length / booksPerPage);
  currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  res.render('index', {
    PAGE_TITLE: 'All Books',
    PAGE_PATH: 'index',
    books: currentBooks,
    totalPages,
    currentPage,
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
  req.user.borrowBook(bookId);
  res.redirect(`/borrowed/${req.user.id}`);
};

exports.postReturnBorrowedBook = async (req, res) => {
  const bookId = req.body.bookId;
  await Book.findByIdAndUpdate(bookId, { available: true });
  await req.user.returnBorrowedBook(bookId);
  res.redirect(`/borrowed/${req.user.id}`);
};
