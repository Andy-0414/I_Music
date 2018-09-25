var express = require('express');
const passport = require('passport')
const fs = require('fs');

var router = express.Router();

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

router.post('/list', function (req, res, next) {
    if (req.user) {
        fs.readFile('data/' + userId + '.json', (err, data) => {
            if (err) { res.status(404).end() }
            res.send(JSON.parse(data))
        })
    }
    else {
        res.status(404);
    }
});
router.get('/list/create/:id', function (req, res, next) { // 짜야함
    if (req.user) {
        var userId = req.user.username
        var y_id = req.params.id
        fs.readFile('data/' + userId + '.json', (err, data) => {
            if (err) { res.status(404).end() }
            var parseData = JSON.parse(data)
            var index = parseData.indexOf(y_id)
            if(index == -1)
            {
                parseData.push(y_id)
                fs.writeFile('data/' + userId + '.json', JSON.stringify(parseData), (err) => {
                    if (err) { console.log(err) }
                    res.status(200).end()
                })
            }
            else{
                res.status(200).end()
            }
        })
    }
    else {
        res.status(404);
    }
});
router.get('/list/delete/:id', function (req, res, next) { // 짜야함
    if (req.user) {
        var userId = req.user.username
        var y_id = req.params.id
        fs.readFile('data/' + userId + '.json', (err, data) => {
            if (err) { res.status(404).end() }
            var parseData = JSON.parse(data)
            var index = parseData.indexOf(y_id)
            if (index != -1) {
                parseData.splice(index,1)
                fs.writeFile('data/' + userId + '.json', JSON.stringify(parseData), (err) => {
                    if (err) { console.log(err) }
                    res.status(200).end()
                })
            }
            else {
                res.status(200).end()
            }
        })
    }
    else {
        res.status(404);
    }
});
module.exports = router;