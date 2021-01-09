const User = require('../models/user');
const Book = require('../models/book');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const PAGE_PATH = 'auth';

exports.get_signup = (req, res) => {
  res.render('auth/signup', { PAGE_PATH, PAGE_TITLE: 'Create new account' });
};

exports.validateSignup = async (req, res, next) => {
  await body('username')
    .trim()
    .isLength({ min: 6, max: 16 })
    .withMessage('Username has to be longer than 6.')
    .isAlphanumeric()
    .withMessage('Username has non-alphanumeric characters.')
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already in use');
      }
      return true;
    })
    .run(req);
  await body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('E-mail already in use');
      }
      return true;
    })
    .run(req);
  await body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .run(req);
  await body('passwordConfirmation')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
    .run(req);
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    const error = errors.map((error) => error.msg)[0];
    const { name, email, username, password, passwordConfirmation } = req.body;
    return res.render('auth/signup', {
      PAGE_PATH,
      PAGE_TITLE: 'Create new account',
      error,
      name,
      username,
      email,
      password,
      passwordConfirmation,
    });
  }
  next();
};

exports.signup = async (req, res) => {
  const { email, password, username, flat, street, pincode, state } = req.body;
  const address = { flat, street, pincode, state };
  const user = await new User({ email, username, password, address });
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  await user.save();
  req.flash('success_msg', 'Registered and check your email for verification');
  res.redirect('/auth/signin');
};

exports.get_signin = (req, res) => {
  res.render('auth/signin', { PAGE_PATH, PAGE_TITLE: 'Sign in' });
};

exports.signin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.render('auth/signin', {
        PAGE_PATH,
        PAGE_TITLE: 'Sign in',
        error: err.message,
      });
    }
    if (!user) {
      return res.render('auth/signin', {
        PAGE_PATH,
        PAGE_TITLE: 'Sign in',
        error: info.message,
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.render('auth/signin', {
          PAGE_PATH,
          PAGE_TITLE: 'Sign in',
          error: err.message,
        });
      }
      res.redirect('/');
    });
  })(req, res, next);
};

exports.signout = (req, res) => {
  req.session.destroy(() => {
    req.logout();
    res.clearCookie();
    res.redirect('/');
  });
};

exports.getAuthUser = (req, res) => {
  res.render('auth/profile', {
    PAGE_PATH,
    PAGE_TITLE: `${req.profile.username}`,
    profile: req.profile,
  });
};

exports.checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'You have to be registered and logged in');
  res.redirect('/auth/signin');
};

exports.getUserByUsername = async (req, res, next, username) => {
  try {
    req.profile = await User.findOne({ username: username });
    req.profile.borrowedBookList = await Book.find({
      usersBorrowed: { $in: [req.profile._id] },
    }).select('-usersBorrowed');
    next();
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res) => {
  const { flat, street, pincode, state } = req.body;
  req.body.address = { flat, street, pincode, state };
  await User.findOneAndUpdate({ _id: req.user._id }, { $set: req.body });
  req.flash('success_msg', 'Your Account is updated');
  res.redirect(`/auth/${req.user.username}`);
};

exports.deleteUser = async (req, res) => {
  await async.parallel([
    (callback) => {
      User.findByIdAndDelete(req.profile._id).exec(callback);
    },
    (callback) => {
      Book.updateMany(
        { usersBorrowed: { $in: [req.profile._id] } },
        { $pull: { usersBorrowed: req.profile._id } }
      ).exec(callback);
    },
  ]);
  res.redirect('/auth/signout');
};
