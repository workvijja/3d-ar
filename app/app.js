const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const uploadRouter = require('#router/upload.js');
const viewRouter = require('#router/view.js')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'feature'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/items", express.static(path.join(__dirname, 'items')));
app.use("/backbone", express.static(path.join(__dirname, 'backbone')));

app.use('/upload', uploadRouter);
app.use('/view', viewRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
  // res.render('error');
});

module.exports = app;
