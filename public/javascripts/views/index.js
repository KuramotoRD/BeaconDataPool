/**
 * index.ejs用 JavaScript
 */

(function() {
	var grid;
	var dataView;

	// 日付Column用Formatter
	var datetimeFormatter = function(row, cell, value, columnDef, dataContext) {
		return new Date(value).toFullLocaleString();
	};
	// 詳細Column用Formatter
	var linkFormatter = function(row, cell, value, columnDef, dataContext) {
		return '<a href="/detail/' + value + '" target="beaconDataWindow">詳細</a> <a href="/api/get/' + value + '" target="beaconDataWindow">JSON</a>';
	};

	// Column定義
	var columns = [
		{id: '_id', name: 'ID', field: '_id', minWidth: 300},
		{id: 'gateway_id', name: 'Gateway', field: 'gateway_id', minWidth: 100},
		{id: 'received_time', name: '追加時刻', field: 'received_time', minWidth: 180, formatter: datetimeFormatter},
		{id: 'rssi', name: 'RSSI', field: 'rssi_max', minWidth: 60},
		{id: 'send_status', name: '送信済', field: 'send_status', minWidth: 60, formatter: Slick.Formatters.Checkmark},
		{id: 'detail', name: '詳細', field: '_id', minWidth: 100, formatter: linkFormatter}
	];

	// Option定義
	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false
	};

	// 初期化処理
	$(function() {
		//----- jQuery UI -----//

		// WebStorage
		var storage = window.localStorage;

		$('#startDate').datepicker();
		$('#startDate').datepicker('option', 'dateFormat', 'yy/mm/dd');
		$('#startDate').on('change', function() {
			storage.setItem('startDate', $('#startDate').val());
			getBeaconHeaderList();
		});

		$('#startTime').on('change', function() {
			storage.setItem('startTime', $('#startTime').val());
			getBeaconHeaderList();
		});

		$('#gatewayId').on('change', function() {
			storage.setItem('gatewayId', $('#gatewayId').val());
			getBeaconHeaderList();
		});

		$('#limit').selectmenu({
			change: function(event, data) {
				storage.setItem('limit', $('#limit').val());
				getBeaconHeaderList();
			}
		});
		$('#limit').selectmenu('option', 'width', 90);

		$('#reload').tooltip()+
		$('#reload').on('click', function() {
			getBeaconHeaderList();
		});

		// 初期値設定
		$('#startDate').val(storage.startDate ? storage.startDate : new Date().toLocaleDateString());
		$('#startTime').val(storage.startTime ? storage.startTime : '00:00:00');
		if (storage.gatewayId) {
			$('#gatewayId').val(storage.gatewayId);
		}
		$('#limit').val(storage.limit ? storage.limit : '100');
		$('#limit').selectmenu('refresh')



		//----- Grid -----//

		// DataView生成
		dataView = new Slick.Data.DataView();
		dataView.onRowCountChanged.subscribe(function(e, args) {
			grid.updateRowCount();
			grid.render();
		});

		dataView.onRowsChanged.subscribe(function(e, args) {
			grid.invalidateRows(args.rows);
			grid.render();
		});

		// Grid生成
		grid = new Slick.Grid('#BeaconHeaderGrid', dataView, columns, options);

		// Beacaonデータ取得
		getBeaconHeaderList();
	});

	// BeaconデータHeaderList取得
	function getBeaconHeaderList() {

		// 送信データ(JSON)
		var sendData = {};
		sendData.start_time = Date.parse($('#startDate').val() + ' ' + $('#startTime').val());
		sendData.limit = Number($('#limit').val());
		if ($('#gatewayId').val()) {
			sendData.gateway_id = $('#gatewayId').val();
		}
		if ($('#rssi').val()) {
			sendData.rssi = Number($('#rssi').val());
		}

		// 非同期Ajax
		ajaxCall('/api/get/headerlist', 'POST', sendData,
			function(json_data) {
				if (json_data.resultFlag) {
					// 一覧に反映
					dataView.beginUpdate();
					dataView.setItems(json_data.data, '_id');
					dataView.endUpdate();
				}
				else {
					// エラーメッセージ表示
					window.alert("ERROR: " + json_data.message);
				}
			}
		);
	};
}());
