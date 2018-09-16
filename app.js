var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
//var logger = require('morgan');
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy; // Passport Local
const session = require('express-session'); // Session
const MySQLStore = require('express-mysql-session')(session); // MySQL Store

// var mysql = require('mysql2');
// var con = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '1111',
//     database: 'imusic'
// });
// con.connect(err=>{
//     if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//     }
//     console.log('connected as id ' + con.threadId);
// }); // SQL 접속


var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var searchRouter = require('./routes/search');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev')); // 로그
app.use(express.json()); // body parser
app.use(express.urlencoded({ extended: false })); // body parser
app.use(cookieParser()); // 쿠키파서
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일

app.listen(3000) // 포트 3000

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);

app.use(function (req, res, next) { // 에러 핸들링
    next(createError(404));
});

app.use(function (err, req, res, next) { // 에러 핸들링
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
