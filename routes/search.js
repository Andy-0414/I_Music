var express = require('express');
var search = require('youtube-search');

var opts = {
    maxResults: 8,
    key: 'AIzaSyBFbhj76YtmD3_S0r_h6ntyvJNqn9QCLxQ'
};

var router = express.Router();
router.get("/:desc", (req, res) => {
    var desc = req.params.desc;
    search(desc, opts, function (err, results) {
        res.send(results);
    });
})

module.exports = router;