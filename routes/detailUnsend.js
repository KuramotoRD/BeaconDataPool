var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var data = { 
		title: 'BeaconData Detail(未送信)',
		headerId: req.params.id,
	};
	res.render('detailUnsend', data);
});

module.exports = router;
