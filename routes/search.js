var express = require('express');
var search = require('youtube-search');
var fs = require('fs');

var opts = {
    maxResults: 20,
    key: 'AIzaSyBFbhj76YtmD3_S0r_h6ntyvJNqn9QCLxQ'
};

var router = express.Router();
router.get("/:desc", (req, res) => {
    var desc = req.params.desc;
    if (req.user) {
        var userId = req.user.username
        fs.readFile('data/' + userId + '.json', (err, data) => {
            if (err) { res.status(404).end() }
            var parseData = JSON.parse(data)
            search(desc, opts, function (err, results) {
                res.send(results.map(x => {
                    return {
                        id: x.id,
                        like: (parseData.indexOf(x.id) != -1), // 수정 요함
                        title: x.title,
                        description: x.description,
                        thumbnails: x.thumbnails
                    }
                }));
            });
        })
    }
    else {
        search(desc, opts, function (err, results) {
            res.send(results.map(x => {
                return {
                    id: x.id,
                    like: false, // 수정 요함
                    title: x.title,
                    description: x.description,
                    thumbnails: x.thumbnails
                }
            }));
        });
    }
})

module.exports = router;