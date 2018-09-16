var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'index.html')) // 페이지 보내기
});

module.exports = router;