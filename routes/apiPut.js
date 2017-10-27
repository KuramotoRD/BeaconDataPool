var express = require('express');
var router = express.Router();

var Cloudant = require('cloudant');
var cloudant = Cloudant({instanceName: 'Cloudant NoSQL DB-BeaconDataPool', vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
var db = cloudant.db.use('beacondb');

var Validator = require('jsonschema').Validator;
var beaconValidator = new Validator();

// JSON�X�L�[�}
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
						"description": "���o����",
						"type": "string"
					},
					"power": {
						"description": "�d�r�c��",
						"type": "boolean"
					},
					"rssi": {
						"description": "�d�g���x",
						"type": "integer"
					}
				}
			}
		}
	}
};

// Beacon�f�[�^��ǉ�����
router.post('/', function(req, res, next){

	// JSON�o���f�[�V����
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

	// Beacon�f�[�^�����݂��Ȃ��ꍇ�͓o�^���Ȃ�
	if (req.body.list.length == 0) {
		res.json({
			resultFlag: true,
			message: 'sucess'
		});

		return;
	}

	// �f�[�^�o�^
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
