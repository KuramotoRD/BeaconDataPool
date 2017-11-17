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
	// PowerColumn用Formatter
	var powerFormatter = function(row, cell, value, columnDef, dataContext) {
		return value ? "<img src='../images/delete.png'>" : "";
	}

	// Column定義
	var columns = [
		{id: 'major', name: 'Major', field: 'major', minWidth: 150},
		{id: 'minor', name: 'Minor', field: 'minor', minWidth: 150},
		{id: 'time', name: '検知時刻', field: 'time', minWidth: 180, formatter: datetimeFormatter},
		{id: 'power', name: 'Power', field: 'power', minWidth: 60, formatter: powerFormatter},
		{id: 'rssi', name: 'RSSI', field: 'rssi', minWidth: 60}
	];

	// Option定義
	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false
	};

	// 初期化処理
	$(function() {

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
		grid = new Slick.Grid('#BeaconDetail', dataView, columns, options);

		// Beacaonデータ取得
		getBeaconDetail();
	});

	// BeaconデータHeaderList取得
	function getBeaconDetail() {

		// 非同期Ajax
		ajaxCall('/api/get/' + $('#headerId').text(), 'GET', null,
			function(json_data) {
				if (json_data.resultFlag) {
					// ヘッダに反映
					$('#gatewayId').text(json_data.data.gateway_id);
					$('#receivedTime').text(new Date(json_data.data.received_time).toFullLocaleString());
					$('#sendStatus').text(json_data.data.send_status);

					// 一覧データ unique key生成
					var list = json_data.data.list;
					for (var i = 0; i < list.length; i++) {
						list[i]._id = list[i].major + '|' + list[i].minor + '|' + list[i].time;
					}

					// 一覧に反映
					dataView.beginUpdate();
					dataView.setItems(list, '_id');
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
