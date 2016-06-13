var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var io = require('socket.io')();
var people = {};
app.io = io;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

io.on('connection', function(socket) {

  console.log('A user connected to the socket.io server');
  socket.on('username', function(username) {
    people[socket.id] = username;
    socket.broadcast.emit('message', 'Server: ' + people[socket.id] + ' has connected');
    console.log('User ID: ', people[socket.id]);
    socket.emit('message', 'Welcome ' + people[socket.id] );
  });

  //people[socket.id] = name;       TODO make name login


  socket.on('disconnect', function() {
    console.log(people[socket.id] + ' disconnected from the socket.io server');
      socket.emit('message','Server: ' + people[socket.id] + ' disconnected');
  });

  socket.on('message', function(msg) {
    console.log('New message: ' + msg);
    io.emit('message',people[socket.id] + ': ' + msg);
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
