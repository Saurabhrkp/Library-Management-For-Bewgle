const Book = require('../models/book');
const User = require('../models/user');
const async = require('async');
const PAGE_PATH = 'panel';

exports.panel = async (req, res) => {
  const results = await async.parallel({
    users: (callback) => {
      User.countDocuments(callback);
    },
    books: (callback) => {
      Book.countDocuments(callback);
    },
  });
  results.create = 'Add Book';
  res.render('panel/index', {
    PAGE_PATH,
    PAGE_TITLE: 'Panel',
    results,
  });
};

exports.createBook = (req, res) => {
  res.render('panel/book-form', { PAGE_PATH, PAGE_TITLE: 'New Book' });
};

exports.saveBook = async (req, res) => {
  const book = await new Book(req.body).save();
  res.redirect(`/${book._id}`);
};

exports.sendBookForm = (req, res) => {
  res.render('panel/book-form', {
    PAGE_PATH,
    PAGE_TITLE: `Update Book: ${req.book.title}`,
    book: req.book,
  });
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.render('panel/lists', {
    PAGE_PATH,
    PAGE_TITLE: 'List of users',
    users,
  });
};

exports.getBooks = async (req, res) => {
  const books = await Book.find().populate('usersBorrowed');
  res.render('panel/lists', {
    PAGE_PATH,
    PAGE_TITLE: 'List of books',
    books,
  });
};

exports.updateBook = async (req, res) => {
  await Book.findOneAndUpdate(
    { _id: req.book._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  req.flash('success_msg', `${req.book.title} updated`);
  res.redirect(`${req.book.slug}`);
};

exports.deleteBook = async (req, res) => {
  const { _id } = req.book;
  await Book.findOneAndDelete({ _id });
  req.flash('success_msg', `Deleted ${req.book.tilte}`);
  res.redirect('/panel/panel');
};
