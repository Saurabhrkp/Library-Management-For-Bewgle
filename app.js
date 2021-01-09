const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Passport Config
require('./lib/passport')(passport);

// MongoDB Config
const mongoDB_URI = 'mongodb://localhost:27017/library';
const mongoDBOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

(async () => {
  // Connect to MongoDB
  try {
    await mongoose.connect(mongoDB_URI, mongoDBOptions);
    console.log(`Connected to ${mongoDB_URI}`);
    mongoose.Promise = global.Promise;
  } catch (error) {
    console.error(`Unable to connect MongoDB due to ${error.message}`);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(
  session({
    secret: 'secretSession',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
