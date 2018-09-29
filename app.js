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
const fs = require('fs');

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


var mysql = require('mysql2');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'imusic'
});
con.connect(err => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + con.threadId);
}); // SQL 접속


app.use(session({
    secret: 'Andy0414',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '1111',
        database: 'imusic'
    })
})) // 세션 스토리지
app.use(passport.initialize()); // 패스포트 사용
app.use(passport.session()); // 패스포트 세션 사용

passport.use(new LocalStrategy(
    (username, password, done) => {
        var sql = "SELECT id,password FROM userData WHERE id=?"
        con.query(sql, username, (err, result, fields) => {
            if (!result[0]) {
                console.log("[FAIL LOGIN] ID");
                done(null, false)
            }
            else {
                if (result[0].password == password) {
                    console.log(`[LOGIN USER]\nID : ${username}`);
                    var userId = username
                    fs.readdir('data/', (err, files) => {
                        if (files.indexOf(userId + ".json") == -1) {
                            fs.writeFile('data/' + userId + '.json', '[]', (err) => {
                                if (err) { console.log(err) }
                                done(null, {
                                    username: username
                                })
                            })
                        }
                        else {
                            done(null, {
                                username: username
                            })
                        }
                    })
                }
                else {
                    console.log("[FAIL LOGIN] PW");
                    done(null, false)
                }
            }
        })
    }
)); // 로그인 조건 - local

passport.serializeUser(function (user, done) {
    done(null, user);
}); // 세션 생성

passport.deserializeUser(function (user, done) {
    done(null, user);
}); // 세션 확인


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
