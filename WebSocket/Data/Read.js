function Read() {
	var zxData = require('./1字形表x.json');
	var pyData = require('./2拼音表x.json');
	var gjData = require('./3构件表x.json');
	var hzGxData = require('./4汉字部件关系表x.json');
	var hzYxData = require('./6字义项表x.json');

	var chData = require('./5词汇表x.json');
	var chGxData = require('./8构词关系表x.json');
	var chYxData = require('./7词义项表x.json');

	/*
		zxKey：输入汉字，得到字形key
		zxGx：输入字形key，得到字形拆分信息（返回部件关系key）
		gjGz：输入构件key，得到可构词的字（返回部件关系key）
		zxGj：输入字形key，得到使用同一字形的构件（返回构件key）
		gjYx: 输入构件key，得到构件义项（返回构件对义项key列表）

		chKey：输入词汇信息，得到词汇在chData中的key
		chGx：输入词汇key，得到词汇拆分信息（返回值为 构词关系key列表）
		hzGc：输入字形key，得到可构成的词汇（返回值为 构词关系key列表）
		chGc：输入词汇key，得到可构成的词汇（返回值为 构词关系key列表）
		chYx：输入词汇key，得到词汇义项（返回值为 词汇对应义项key列表）
	*/
	var zxKey={}, zxGx={}, gjGz={}, zxGj={}, gjYx={};
	var chKey={}, chGx={}, hzGc={}, chGc={}, chYx={};
	// 对词汇数据进行处理，方便查询
	function dealData() {
		/////////////////////////////////// 汉字 ///////////////////////////////////////
		// 保存汉字对应的字形key（方便查找）
		zxData.forEach(function(zx) {
			var _word = zx["字形内容"];
			var _key = zx["Key"];
			if (zxKey[_key] == null) {
				zxKey[_word] = [];
			}
			zxKey[_word].push(_key);
		});

		// 字形拆分信息
		hzGxData.forEach(function(gx) {
			var _gxkey = gx["Key"];
			var _zxkey = gx["字形key"];
			// 字形拆分信息
			if (zxGx[_zxkey] == null) zxGx[_zxkey] = [];
			zxGx[_zxkey].push(_gxkey);
			// 构件构字信息
			var _gj = gx["构件key"];
			if (gjGz[_gj] == null) gjGz[_gj] = [];
			gjGz[_gj].push(_gxkey);
		});

		// 字形与构件关系
		gjData.forEach(function(gj) {
			var _gjkey = gj["Key"];
			var _zxkey = gj["字形key"];
			if (zxGj[_zxkey] == null) zxGj[_zxkey] = [];
			zxGj[_zxkey].push(_gjkey);
		});
		// 构件与义项关系
		hzYxData.forEach(function(yx) {
			var _gjkey = yx["构件key"];
			var _yxkey = yx['Key'];
			if (gjYx[_gjkey] == null) gjYx[_gjkey] = [];
			gjYx[_gjkey].push(_yxkey);
		});
		/////////////////////////////////// 词汇 ///////////////////////////////////////
		// 保存词汇对应的词汇Key（方便查找）		
		chData.forEach(function(ch) {
			var _word = ch["词汇内容"];
			var _key = ch["Key"];
			if (chKey[_word] == null) chKey[_word] = [];
			chKey[_word].push(_key);
		});
		// 词汇拆分信息
		chGxData.forEach(function(gx) {
			var _gxkey = gx["key"];
			var _key = gx["词汇key"];
			// 词汇拆分信息
			if (chGx[_key] == null) chGx[_key] = [];
			chGx[_key].push(_gxkey);

			// 汉字组词能力
			var _hz = gx['字形key'];
			if (hzGc[_hz] == null) hzGc[_hz] = [];
			hzGc[_hz].push(_gxkey);
			// 词汇组词能力
			var _ch = gx['组成词汇key'];
			if (chGc[_ch] == null) chGc[_ch] = [];
			chGc[_ch].push(_gxkey);
		});
		// 词汇与义项关系
		chYxData.forEach(function(yx) {
			var _chkey = yx['词汇key'];
			var _yxkey = yx['Key'];
			if (chYx[_chkey] == null) chYx[_chkey] = [];
			chYx[_chkey].push(_yxkey);
		});
	}

	dealData();

	this.foundZxByWord = function(_word) {
		// 输入字形，得到字形数据
		return zxData[zxKey[_word] - 1];
	}
	this.foundZxByKey = function(_zxkey) {
		// 输入字形key，得到字形数据
		if (_zxkey < zxData.length) {
			return zxData[_zxkey - 1];
		} else return null;
	}
	this.foundChByWord = function(_word) {
		// 输入词汇，得到词汇数据
		if (chKey[_word]) {
			var _dataList = [];
			chKey[_word].forEach(function(_chkey) {
				_dataList.push(chData[_chkey - 1]);
			})
			return _dataList;
		} else return null
	}
	this.gethzGxKey = function(_zxkey) {
		// 输入字形key，得到字形拆分信息
		return zxGx[_zxkey];
	}
	this.getchGxKey = function(_chkey) {
		return chGx[_chkey];
	}
	this.gethzGzKey = function(_zxkey) {
		// 输入字形key，得到字形构字列表（根据字形得到构件key，统计构件key获得gjGz数据中的信息，最后返回部件关系中的key）
		var gjKey = zxGj[_zxkey];
		var gzKey = [];
		if (gjKey) {
			gjKey.forEach(function(_gjkey) {
				var _gzList = gjGz[_gjkey];
				if (_gzList) {
					_gzList.forEach(function(_gxkey) {
						gzKey.push(_gxkey);
					})
				}
			});
		}
		return gzKey;
	}
	this.gethzGcKey = function(_zxkey) {
		// 输入字形key，得到字形构成的词汇信息
		var _hzgcList = hzGc[_zxkey];
		return _hzgcList;
	}
	this.getchGcKey = function(_chkey) {
		// 输入词汇key，得到词汇构成的词汇信息
		var _chgcList = chGc[_chkey];
		return _chgcList;
	}
	this.getChYxKey = function(_chkey) {
		// 输入词汇key，得到词汇义项key列表
		return chYx[_chkey];
	}
	this.gethzYxKey = function(_gjkey) {
		// 输入构件key，得到汉字义项key列表
		return gjYx[_gjkey];
	}


	this.gethzGxData = function(_gxkey) {
		return hzGxData[_gxkey - 1];
	}
	this.getGjData = function(_gjkey) {
		return gjData[_gjkey - 1];
	}
	this.getZxData = function(_zxkey) {
		return zxData[_zxkey - 1];
	}
	this.getPyData = function(_pykey) {
		return pyData[_pykey - 1];
	}
	this.getchGxData = function(_gxkey) {
		return chGxData[_gxkey - 1];
	}
	this.getChData = function(_chkey) {
		return chData[_chkey - 1];
	}
	this.gethzYxData = function(_yxkey) {
		return hzYxData[_yxkey - 1];
	}
	this.getchYxData = function(_yxkey) {
		return chYxData[_yxkey - 1];
	}
}
module.exports = Read;