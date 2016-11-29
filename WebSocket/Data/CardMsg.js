function CardMsg() {
	var Read = require('./Read.js');
	var read = new Read();
	// 得到卡片信息
	this.foundCardMsg = function(json) {
		if (json.msg == 'Character') {
			return this.foundCardByGjKey(json.data)
		} else if (json.msg == 'Word') {
			return this.foundCardByChKey(json.data)
		}
	}
	// 
	this.foundCardByGjKey = function(data) {
		var json = {
			from: "GetCardMsg",
			msg: 'Character',
			data: "失败"
		};

		var list = [];
		data.forEach(function(_gjKey) {
			var gjData = read.getGjData(_gjKey);
			var _zxKey = gjData['字形key'];
			var zxData = read.getZxData(_zxKey);
			var _pyKey = gjData['拼音key'];
			var pyData = read.getPyData(_pyKey);
			var hzyxList = read.gethzYxKey(_gjKey);
			var yx_c = '';
			var yx_e = '';
			if (hzyxList != null) {
				var yxData = read.gethzYxData(hzyxList[0]);
				yx_c = yxData["义项中文"];
				yx_e = yxData['义项翻译'];
			}
			var _msg = {
				key: _gjKey,
				zx: zxData["字形内容"],
				show: zxData['描红数据信息'],
				py: pyData['拼音内容'],
				yx_c: yx_c,
				yx_e: yx_e,
			};
			list.push(_msg);
		});
		json.data = list;

		return json;
	}
	this.foundCardByChKey = function(data) {
		var json = {
			from: "GetCardMsg",
			msg: 'Word',
			data: "失败"
		};

		var list = [];
		data.forEach(function(_chKey) {
			var chData = read.getChData(_chKey);
			var yx_c = '';
			var yx_e = '';
			var chyxList = read.getChYxKey(_chKey);
			if (chyxList != null) {
				var yxData = read.getchYxData(chyxList[0]);
				yx_c = yxData["义项中文"];
				yx_e = yxData['义项英文内容'];
			}
			var _msg = {
				key: _chKey,
				zx: chData["词汇内容"],
				py: chData['词汇拼音'],
				yx_c: yx_c,
				yx_e: yx_e,
			};
			list.push(_msg);
		});
		json.data = list;

		return json;
	}
}
module.exports = CardMsg;