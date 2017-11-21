/**
 * detail_unsend.ejs用 JavaScript
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
		{id: 'time', name: '検知時刻', field: 'time', minWidth: 180, formatter: datetimeFormatter},
		{id: 'gateway_id', name: 'Gateway', field: 'gateway_id', minWidth: 100},
		{id: 'major', name: 'Major', field: 'major', minWidth: 150},
		{id: 'minor', name: 'Minor', field: 'minor', minWidth: 150},
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
		//----- jQuery UI -----//

		$('#reload').tooltip()+
		$('#reload').on('click', function() {
			getBeaconDetailUnsend();
		});



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
		grid = new Slick.Grid('#BeaconDetailUnsend', dataView, columns, options);

		// Beacaonデータ取得
		getBeaconDetailUnsend();
	});

	// BeaconデータHeaderList取得
	function getBeaconDetailUnsend() {

		// 非同期Ajax
		ajaxCall('/api/get/unsendlist', 'POST', null,
			function(json_data) {
				if (json_data.resultFlag) {
					// ヘッダに反映
					$('#dataCount').text(json_data.data.length);

					// 一覧データ 生成
					var src = json_data.data
					var list = [];
					for (var i = 0; i < src.length; i++) {
						var obj = {
							'time': src[i].key[0],
							'gateway_id': src[i].key[1],
							'major': src[i].key[2],
							'minor': src[i].key[3],
							'power': src[i].value.power,
							'rssi': src[i].value.rssi
						};
						obj._id = obj.time + '|' + obj.gateway_id + '|' + obj.major + '|' + obj.minor;

						list.push(obj);
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
