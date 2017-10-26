var express = require("express");
var router = express.Router();

var Cloudant = require('cloudant');
var cloudant = Cloudant({instanceName: "Cloudant NoSQL DB-BeaconDataPool", vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
var db = cloudant.db.use('beacondb');

// Beacon�f�[�^��ǉ�����
router.post("/", function(req, res, next) {
	// �f�[�^�o�^
	db.insert(req.body, function (err, result) {
		if (err) {
			console.log("DB Access Error!!!");
			console.log(err);

			res.json({
				resultFlag: false,
				message: "DB Access Error!!!"
			});

			return;
		}

		res.json({
			resultFlag: true,
			message: "sucess"
		});
	});
});

module.exports = router;
