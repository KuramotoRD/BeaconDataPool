var express = require('express');
var router = express.Router();

var Cloudant = require('cloudant');
var cloudant = Cloudant({instanceName: 'Cloudant NoSQL DB-BeaconDataPool', vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
var db = cloudant.db.use('beacondb');

var Validator = require('jsonschema').Validator;
var beaconValidator = new Validator();

// JSONスキーマ
const beaconSchema = {
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"required": ["gateway_id"],
	"properties": {
		"gateway_id": {
			"description": "Gateway ID",
			"type": "string"
		},
		"list": {
			"type": "array",
			"items": {
				"type": "object",
				"required": ["major", "minor", "time", "power", "rssi"],
				"properties": {
					"major": {
						"description": "Beacon Major ID",
						"type": "integer"
					},
					"minor": {
						"description": "Beacon Minor ID",
						"type": "integer"
					},
					"time": {
						"description": "検出時刻",
						"type": "string"
					},
					"power": {
						"description": "電池残量",
						"type": "boolean"
					},
					"rssi": {
						"description": "電波強度",
						"type": "integer"
					}
				}
			}
		}
	}
};

// Beaconデータを追加する
router.post('/', function(req, res, next){

	// JSONバリデーション
	var check = beaconValidator.validate(req.body, beaconSchema);
	if (check.errors.length > 0) {
		console.log(check.errors);

		var message = '';
		for (i = 0; i < check.errors.length; i++){
			if (i > 0) {
				message += ', ';
			}
			var error = check.errors[i];
			message += error.property + ':' + error.message;
		}

		res.json({
			resultFlag: false,
			message: message
		});

		return;
	}

	// Beaconデータが存在しない場合は登録しない
	if (req.body.list.length == 0) {
		res.json({
			resultFlag: true,
			message: 'sucess'
		});

		return;
	}

	// データ登録
	db.insert(req.body, function (err, result) {
		if (err) {
			console.log('DB Access Error!!!');
			console.log(err);

			res.json({
				resultFlag: false,
				message: 'DB Access Error!!!'
			});

			return;
		}

		res.json({
			resultFlag: true,
			message: 'sucess'
		});
	});
});

module.exports = router;
