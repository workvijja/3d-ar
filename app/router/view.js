const {get} = require("#api/view.js")

var express = require('express');
var router = express.Router();

router.get("/:store_id/:cloth_id/", get)
router.get("/:store_id/", get)

const render = (req, res) => {
    res.render("base", req.context)
}
router.use(render)

module.exports = router