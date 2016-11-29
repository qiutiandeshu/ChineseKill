function Search() {
	var Read = require('./Read.js');
	var read = new Read();
	var fs = require('fs');


	var r_hz = require('./随机字数据.json');
	var r_ch = require('./随机词数据.json');

	var ming = require('./ming.json');

	var LimitHz = [];
	r_hz.forEach(function(data) {
		var _hz = data['随机字'];
		LimitHz.push(_hz);
	});
	var LimitCh = [];
	r_ch.forEach(function(data) {
		var _ch = data['随机词'];
		LimitCh.push(_ch);
	});
	function blnAddHz(_hz) {
		if (LimitHz.indexOf(_hz) < 0) return false;
		return true;
	}
	function blnAddCh(_ch) {
		if (LimitCh.indexOf(_ch) < 0) return false;
		return true;
	}
	var s_word = '';
	this.changeAdd = function(_data) {
		var GxList = _data.list;
		GxList.forEach(function(gxkey) {
			ming[gxkey-1]['空白节点'] = _data[gxkey];
		});
		fs.writeFile("./Data/ming.json", JSON.stringify(ming), function() {
			console.log('保存成功');
		});
		return this.searchWord(s_word);
	}
	this.searchWord = function(_word) {
		s_word = _word;
		var json = {
			type: 'fail',
			data: '没有该字'
		};
		var zxData = read.foundZxByWord(_word);
		if (zxData == undefined) return json;
		json = {
			type: 'success',
			parent: [],
			children: []
		};
		var addMsg = {
			List: [],
		};
		// 得到对应字形key，获得字形拆分信息
		var zxKey = zxData['Key'];
		var _name = '' + zxKey;
		var node = {id: _name, word: zxData['字形内容']};
		json.parent.push(node);
		// 根据拆分信息，获得组成该字的构件
		var hzGxKeyList = read.gethzGxKey(zxKey);
		hzGxKeyList.forEach(function(_gxkey) {
			var _gxData = read.gethzGxData(_gxkey);
			var _gjData = read.getGjData(_gxData["构件key"]);
			var _zxKey = _gjData["字形key"];
			var _pname = _name + '.' + _zxKey;
			var _zxData = read.getZxData(_zxKey);
			var pnode = {id: _pname, word: _zxData['字形内容'], type: getType(_gxData['意音记类型'])};
			json.parent.push(pnode);
		});

		json.children.push(node);
		// 根据构字能力，获得该字子对象
		getChildren(zxKey, _name);

		function getChildren(zxKey, name) {
			var hzGzKeyList = read.gethzGzKey(zxKey);
			var zxlist = [];   //防止添加重复的字形
			var _word = '';
			hzGzKeyList.forEach(function(_gxkey) {
				var _gxData = read.gethzGxData(_gxkey);
				var _zxKey = _gxData['字形key'];
				var bln = false;
				if (_zxKey != zxKey) {
					if (zxlist.indexOf(_zxKey) < 0) {
						bln = true;
						var _cname = name + '.' + _zxKey;
						var _zxData = read.getZxData(_zxKey);
						_word = _zxData["字形内容"];
						var cnode = {id: _cname, word: _zxData['字形内容'], type: getType(_gxData['意音记类型']), index: 2};
						json.children.push(cnode);
						getChildren(_zxKey, _cname);
						zxlist.push(_zxKey);
					}
				}

				if (bln) {
					var _gxData = ming[_gxkey - 1];
					var add_n = _gxData['空白节点'];
					var add_name = name + '.' + _zxKey;
					addMsg[add_name] = {};
					addMsg[add_name]['num'] = add_n;
					addMsg[add_name]['word'] = _word;
					addMsg[add_name]['gxkey'] = _gxkey;
					addMsg.List.push(add_name);
				}
			});
		}
		json.Add = addMsg;
		return json;
	}
	this.searchCh = function(_word) {
		var json = {
			type: "fail",
			data: '没有该词'
		};
		if (blnAddCh(_word)==false) {
			json.data = '不在随机词汇范围内';
			return json;
		}
		var chDataList = read.foundChByWord(_word);
		if (chDataList == null) return json;
		json = {
			type: 'success',
			parent: [],
			children: [],
			yxstr: {},
		};
		var _name = 'zx';
		var chData = null;
		yxList = [];
		if (_word.length == 1) {
			if (blnAddHz(_word) == false) {
				json = {
					type: 'fail',
					data: '不在随机600字范围内'
				};
				return json;
			}
			// 单个，判断是否是汉字
			var zxData = read.foundZxByWord(_word);
			var _zxKey = zxData['Key'];
			var gcKeyList = read.gethzGcKey(_zxKey);
			if (gcKeyList == undefined) {
				json = {
					type: 'fail',
					data: '未拆分词汇'
				};
				return json;
			}
			if (gcKeyList.length > 1) {
				var node = {id: _name, word: zxData["字形内容"], kind: 'hz'};
				json.children.push(node);
			}
			var chlist = [];
			gcKeyList.forEach(function(_gckey) {
				var _gxData = read.getchGxData(_gckey);
				var _yxkey = _gxData['字义项key'];
				var _yxname = _name + '.yx' + _yxkey;
				if (yxList.indexOf(_yxkey) < 0) {
					var yxnode = {id: _yxname, word: _yxkey, kind: 'yx', yx: "z"+_yxkey};
					json.children.push(yxnode);
					yxList.push(_yxkey);

					if (_yxkey != undefined) {
						var _yxData = read.gethzYxData(_yxkey);
						json.yxstr['z'+_yxkey] = _yxData['义项中文'];
					}
				}
				var _chKey = _gxData['词汇key'];
				if (chlist.indexOf(_chKey) < 0) {
					var _chData = read.getChData(_chKey);
					var _cname = _yxname + "." + _chKey;
					if (json.children.length == 0) {
						_cname = "" + _chKey;
					}
					if (blnAddCh(_chData['词汇内容'])) {
						var cnode = {id: _cname, word: _chData['词汇内容'], kind: 'ch', index: _gxData["在词汇中的序号"], yx: 'z'+_gxData['字义项key']};
						json.children.push(cnode);
						getChildren(_chKey, _cname);
					}
					chlist.push(_chKey);
				}
			});
		} else {
			chData = chDataList[0];
			if (blnAddCh(chData['词汇内容']) == false) {
				json = {
					type: 'fail',
					data: '词汇不在随机词汇内'
				};
				return json;
			}
			var chKey = chData['Key'];
			// 词汇（输入词汇key得到词汇组词信息）
			var node = {id: _name, word: chData["词汇内容"], kind: 'ch', yx: 'c'};
			var yxMsg = '';
			var _index = 1;
			var _yxkeyList = read.getChYxKey(chKey);
			if (_yxkeyList) {
				_yxkeyList.forEach(function(_yxkey) {
					var _yxData = read.getchYxData(_yxkey);
					if (_index != 1) {
						yxMsg += '\n';
					}
					if (_yxkeyList.length > 1) {
						yxMsg += _index + ': ';
					}
					yxMsg += _yxData['义项英文内容'];
					_index += 1;
				});
				json.yxstr['c'] = yxMsg;
			}

			json.parent.push(node);
			// 根据词汇拆分获得组成该词汇的其他词汇或字形
			var chGxKeyList = read.getchGxKey(chKey);
			chGxKeyList.forEach(function(_gxkey) {
				var _gxData = read.getchGxData(_gxkey);
				var _zxKey = _gxData['字形key'];
				var _pname = '';
				var _word = '';
				var _kind = '';
				if (_zxKey != null) {
					var _zxData = read.getZxData(_zxKey);
					if (_zxData != undefined) {
						_pname = _name + "." + _zxKey;
						_word = _zxData['字形内容'];
						_kind = 'hz';
					}
				}
				var _chKey = _gxData['组成词汇key'];
				if (_chKey != null) {
					var _chData = read.getChData(_chKey);
					if (_chData != undefined) {
						_pname = _name + '.' + _chKey;
						_word = _chData['词汇内容'];
						_kind = 'ch';
					}
				}
				if (_pname != '') {
					var bln = false;
					if (_kind == 'hz') {
						bln = blnAddHz(_word);
					} else if (_kind == 'ch') {
						bln = blnAddCh(_word);
					}
					if (bln) {
						var pnode = {id: _pname, word: _word, kind: _kind};
						json.parent.push(pnode);
					}
				}
			});

			// 填充词汇构词的词
			json.children.push(node);
			getChildren(chData['Key'], _name, 1);
		}

		function getChildren(_chkey, name) {
			// 词汇构词能力（chkey和chgc）
			var gcKeyList = read.getchGcKey(_chkey);
			var chlist = [];
			if (gcKeyList == undefined) return;
			// 所有构词词汇在构词关系表中的位置
			gcKeyList.forEach(function(_gxkey) {
				var _gxData = read.getchGxData(_gxkey);
				var _yxkey = _gxData['组成的词汇义项key'];
				if (yxList.indexOf(_yxkey) < 0) {
					yxList.push(_yxkey);

					if (_yxkey != undefined) {
						var _yxData = read.getchYxData(_yxkey);
						json.yxstr['c'+_yxkey] = _yxData['义项中文'];
					}
				}
				var _chKey = _gxData['词汇key'];
				if (chlist.indexOf(_chKey) < 0) {
					if (_chkey != _chKey) {
						var _cname = name + "." + _chKey;
						var _chData = read.getChData(_chKey);
						if (blnAddCh(_chData["词汇内容"])) {
							var cnode = {id: _cname, word: _chData['词汇内容'], kind: 'ch', index: _gxData["在词汇中的序号"], yx: 'c'+_gxData['组成的词汇义项key']};
							json.children.push(cnode);
							chlist.push(_chKey);
							getChildren(_chKey, _cname);
						}
					}
				}
			});
		}
		return json;
	}
	function getType(_type) {
		var index = 0;
		if (_type == "音") {
      index = 1;
    } else if (_type == "义") {
      index = 2;
    } else if (_type == "记") {
      index = 3;
    } else {
      index = 4;
    }
    return index;
	}
	function getIndex(_str) {
		var index = 0;
		return index;
	}
}
module.exports = Search;