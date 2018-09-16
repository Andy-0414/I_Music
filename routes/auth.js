var express = require('express');
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy; // Passport Local
const session = require('express-session'); // Session
const MySQLStore = require('express-mysql-session')(session); // MySQL Store

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

var router = express.Router();

router.use(session({
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
router.use(passport.initialize()); // 패스포트 사용
router.use(passport.session()); // 패스포트 세션 사용

passport.use(new LocalStrategy(
    (username, password, done) => {
        var sql = "SELECT id,password FROM userData WHERE id=?"
        con.query(sql, username, (err, result, fields) => {
            if (!result[0]) {
                console.log("[FAIL LOGIN] ID");
                done(null,false)
            }
            else {
                if (result[0].password == password) {
                    console.log(`[LOGIN USER]\nID : ${username}`);
                    done(null,{
                        username : username
                    })
                }
                else {
                    console.log("[FAIL LOGIN] PW");
                    done(null,false)
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

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        res.status(200).end();
    }); // 로그인 시도
router.post('/logout', function (req, res, next) {
    req.logout();
    res.status(200).end();
}); // 회원 가입
router.post('/register', function (req, res, next) {
    var id = req.body.username; // 유저 아이디
    var pw = req.body.password; // 유저 패스워드
    var email = req.body.email; // 유저 이메일
    if (!id || !pw || !email) {
        
        console.log("[NOT DATA]")
        res.status(405).end() // 데이터가 없을 시 405
    }
    else {
        var sql = "SELECT id FROM userData WHERE id=?";
        con.query(sql, [id], (err, result, fields) => {
            if (err) {
                res.status(505).end(); // 에러 시 505
            }
            if (!result[0]) {
                var sql = "INSERT INTO userData (id, password, email) VALUES(?,?,?)";
                con.query(sql, [id, pw, email], (err, result, fields) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        console.log(`[Create User]\nID : ${id}`);
                        res.status(200).end() // 제대로 생성됬을 시 200
                    }
                })
            }
            else {
                console.log("[SAME USER]")
                res.status(405).end(); // 이미 있는 사용자일시 405
            }
        });
    }
}); // 회원 가입

router.post('/token', function (req, res, next) {
    if (req.user) {
        res.send({
            username: req.user.username
        });
    }
    else {
        res.status(404);
    }
}); // 로그인 확인
module.exports = router;