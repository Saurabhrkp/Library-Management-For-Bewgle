const User = require('../models/user');
const Book = require('../models/book');
const async = require('async');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const PAGE_PATH = 'user';

exports.get_signup = (req, res) => {
  res.render('user/signup', { PAGE_PATH, PAGE_TITLE: 'Create new account' });
};

exports.validateSignup = async (req, res, next) => {
  await body('username')
    .trim()
    .isLength({ min: 6, max: 16 })
    .withMessage('Username has to be longer than 6.');
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
  await body('flat').trim().notEmpty().withMessage('Fill complete address');
  await body('street').trim().notEmpty().withMessage('Fill complete address');
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    const error = errors.map((error) => error.msg)[0];
    const { name, email, username, flat, street } = req.body;
    return res.render('user/signup', {
      PAGE_PATH,
      PAGE_TITLE: 'Create new account',
      error,
      name,
      username,
      email,
      flat,
      street,
    });
  }
  next();
};

exports.signup = async (req, res) => {
  const { email, password, username, flat, street } = req.body;
  const address = { flat, street };
  const user = await new User({ email, username, password, address });
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  await user.save();
  req.flash('success_msg', 'Account has been created');
  res.redirect('/user/signin');
};

exports.get_signin = (req, res) => {
  res.render('user/signin', { PAGE_PATH, PAGE_TITLE: 'Sign in' });
};

exports.signin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.render('user/signin', {
        PAGE_PATH,
        PAGE_TITLE: 'Sign in',
        error: err.message,
      });
    }
    if (!user) {
      return res.render('user/signin', {
        PAGE_PATH,
        PAGE_TITLE: 'Sign in',
        error: info.message,
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.render('user/signin', {
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
  res.render('user/profile', {
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
  res.redirect('/user/signin');
};

exports.getUserByID = async (req, res, next, userId) => {
  try {
    req.profile = await User.findById(userId);
    next();
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res) => {
  const { flat, street } = req.body;
  req.body.address = { flat, street };
  await User.findOneAndUpdate({ _id: req.user._id }, { $set: req.body });
  req.flash('success_msg', 'Your Account is updated');
  res.redirect(`/user/${req.user._id}`);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.profile._id);
  res.redirect('/user/signout');
};
