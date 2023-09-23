const {get, post} = require("#api/upload.js")

var express = require('express');
var router = express.Router();

router.route("/")
    .get(get)
    .post(post)

const render = (req, res) => {
    res.render("base", req.context)
}
router.use(render)

module.exports = router