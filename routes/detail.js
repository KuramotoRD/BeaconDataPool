var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
	var data = { 
		title: 'BeaconData Detail',
		headerId: req.params.id,
	};
	res.render('detail', data);
});

module.exports = router;
