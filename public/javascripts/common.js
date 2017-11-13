/**
 * 共通JavaScript
 */

/**
 * Ajax呼び出し(非同期).
 *
 * @param url         呼び出しURL
 * @param method      呼び出しMethod (Default: POST)
 * @param sendData    送信データ(JSON形式) (Default: なし)
 * @param seccessFunc 送信成功callback関数
 * @param failFunc    送信失敗callback関数
 */
function ajaxCall(url, method, sendData, successFunc, failFunc) {
	// パラメタチェック
	if (!url) {
		window.alert("ERROR: 呼び出しURL 未定義");
	}
	if (!method) {
		method = 'POST';
	}
	if (!sendData) {
		sendData = {};
	}

	// callback関数初期化
	if (!successFunc) {
		// 送信成功callback関数 初期化
		successFunc = function(json_data) {
			if (!json_data.resultFlag) {
				window.alert("ERROR: " + json_data.message);
			}
		};
	}
	if (!failFunc) {
		// 送信失敗callback関数 初期化
		failFunc = function() {
			window.alert('ERROR: 通信失敗');
		};
	}

	// AJAX通信処理
	$.ajax({
		url: url,
		type: method,
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(sendData)
	})
	.done(successFunc)
	.fail(failFunc);
};

/**
 * DateオブジェクトのtoLocaleDateString() Function上書き.
 *
 * @retrun YYYY/MM/DD形式の文字列
 */
Date.prototype.toLocaleDateString = function() {
	return [
		this.getFullYear(),
		('0' + (this.getMonth() + 1)).slice(-2),
		('0' + this.getDate()).slice(-2)
		].join( '/' );
}

/**
 * DateオブジェクトにtoFullLocaleString() Function追加.
 *
 * @retrun YYYY/MM/DD HH:MM:SS.SSS形式の文字列
 */
Date.prototype.toFullLocaleString = function() {
	return this.toLocaleDateString() + ' ' + this.toLocaleTimeString() + "." + ('00' + this.getMilliseconds()).slice(-3);
};
