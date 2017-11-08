var express = require('express');
var router = express.Router();

var Cloudant = require('cloudant');
var cloudant = Cloudant({instanceName: 'Cloudant NoSQL DB-BeaconDataPool', vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
var db = cloudant.db.use('beacondb');

var Validator = require('jsonschema').Validator;
var searchValidator = new Validator();

// JSON�X�L�[�} ��������
const searchSchema = {
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
		"start_time": {
			"description": "�擾�J�n���� UNIX time(ms) (Default:1���ԑO)",
			"type": "integer"
		},
		"gateway_id": {
			"description": "Gateway ID",
			"type": "string"
		},
		"status": {
			"description": "���M�X�e�[�^�X�@true:���M�� false:�����M",
			"type": "boolean"
		},
		"limit": {
			"description": "�擾������� (Default:20)",
			"type": "integer"
		}
	}
};

// Beacon�f�[�^��ID�w��Ŏ擾����
router.get('/:id', function(req, res, next){

	// Query
	var query = {
		'selector': {
			'_id' : req.params.id
		},
		"fields": [
			"_id",
			"gateway_id",
			"received_time",
			"send_status",
			"list"
		],
	};

	// �f�[�^�擾
	db.find(query, function(err, data) {
		if (err) {
			console.log('DB Access Error!!!');
			console.log(err);

			res.json({
				resultFlag: false,
				message: 'DB Access Error!!!'
			});

			return;
		}

		var resultData = {
			resultFlag: true,
			message: 'sucess'
		};

		if (data.docs.length == 0) {
			resultData.data = {};
		}
		else {
			resultData.data = data.docs[0];
		}

		res.json(resultData);
	});
});

// Beacon�f�[�^�̃w�b�_���X�g���擾����
router.post('/headerlist', function(req, res, next){

	// JSON�o���f�[�V����
	var check = searchValidator.validate(req.body, searchSchema);
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

	// ��������
	var startTime = req.body.start_time; //�擾�J�n����
	if (typeof startTime === 'undefined') {
		var now = new Date();
		now.setHours(now.getHours() + 1);
		startTime = now.getTime();
	}

	var limit = req.body.limit; //�擾�������
	if (typeof startTime === 'undefined') {
		limit = 20;
	}

	// Query
	var query = {
		'selector': {
			'received_time': {
				'$gt': startTime
			}
		},
		"fields": [
			"_id",
			"gateway_id",
			"received_time",
			"send_status"
		],
		'limit': limit,
		'sort': [
			{
				'received_time:number': 'desc'
			}
		]
	};

	if (typeof req.body.gateway_id !== 'undefined') {
		query.selector.gateway_id = req.body.gateway_id;
	}
	if (typeof req.body.status !== 'undefined') {
		query.selector.send_status = req.body.status;
	}

	// �f�[�^�擾
	db.find(query, function(err, data) {
		if (err) {
			console.log('DB Access Error!!!');
			console.log(err);

			res.json({
				resultFlag: false,
				message: 'DB Access Error!!!'
			});

			return;
		}

		var resultData = {
			resultFlag: true,
			message: 'sucess',
			data: data.docs
		};

		res.json(resultData);
	});
});

module.exports = router;
