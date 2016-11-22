var mysql = require('mysql');

var MSG_K = {
	SUCCESS: '成功',
	FAIL: '失败',
};
// 连接sql 处理数据库发送信息
function Deal() {
	var config = {
		host: '192.169.1.19',
		user: 'root',
		password: 'root',
		database: 'samp_db',
	}
	var client;
	var blnConnect = false;

	// 要返回的json信息
	var json = {
		from: 'from',
		msg: MSG_K.SUCCESS,
		data: 'helloworld',
	};

	// 连接sql 失败 等待2000毫秒后尝试重新连接
	function handleDisconnect() {
		client = mysql.createConnection(config);
		client.connect(function(err) {
			if (err) {
				console.log("SQL连接失败，尝试重新连接");
				blnConnect = false;
				setTimeout(handleDisconnect, 2000);
				return;
			}
			console.log("SQL连接成功");
			blnConnect = true;
		});

		client.on('error', function(err) {
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log("SQL连接错误");
				handleDisconnect();
			} else {
				return;
			}
		});
	}
	handleDisconnect();

	this.getMsg = function(msg, callback) {
		// 处理得到的客户端消息
		if (blnConnect == false) {
			json = {
				from: msg.from,
				msg: MSG_K.FAIL,
				data: '数据库连接失败',
			};
			callback(json);
			return;
		}

		switch (msg.from) {
			case 'New':
				// 新注册
				addNewUser(msg.data, function(_json) {
					callback(_json);
				})
				break;
			case 'Login':
				// 已有登陆
				userLogin(msg.data, function(_json) {
					callback(_json);
				})
				break;
			case 'Update':
				// 修改
				userUpdate(msg.data, function(_json) {
					callback(_json);
				})
				break;
			case 'Delete':
				// 注销
				userDelete(msg.data);
				break;
		}

		// if (msg.from == "New") {
		// 	addNewUser(msg.data, function(_json) {
		// 		callback(_json);
		// 	})
		// } else if (msg.from == "Login") {
		// 	userLogin(msg.data, function(_json) {
		// 		callback(_json);
		// 	})
		// } else if (msg.from == "Update") {
		// 	userUpdate(msg.data, function(_json) {
		// 		callback(_json);
		// 	})
		// }
	}

// 注册新用户
	function addNewUser(data, callback) {
		json = {
			from: 'New',
			msg: MSG_K.FAIL,
			data: data,
		};
		client.query('insert into forumuser set ?', data, function(err, result) {
			if (err) {
				if (err.code === 'ER_DUP_ENTRY') {
					json.data = "该账号已被注册";
				} else {
					console.log(err);
					json.data = "注册失败";
				}
			} else {
				json.msg = MSG_K.SUCCESS;
			}
			callback(json);
		});
	}
// 用户登陆
	function userLogin(data, callback) {
		json = {
			from: 'Login',
			msg: MSG_K.FAIL,
			data: data,
		}

		client.query('select * from forumuser where userid = ?', data.userid, function(err, rows, fields) {
			if (err) {
				return;
			} else {
				if (rows[0] == null) {
					json.data = "账号输入错误";
				} else {
					if (rows[0].password == data.password) {
						json.msg = MSG_K.SUCCESS;
						json.data = rows[0];
					} else {
						json.data = "密码输入错误";
					}
				}
			}
			callback(json);
		});
	}
// 用户信息修改
	function userUpdate(data, callback) {
		json = {
			from: 'Update',
			msg: MSG_K.FAIL,
			data: data,
		}
		var _index = 0;
		client.query('update forumuser set username = ? where userid = ?', [data.username, data.userid], function(err, rows, fields) {
			if (err) {
				json.data = "修改失败";
				callback(json);
				return;
			}
			success();
		});
		client.query('update forumuser set password = ? where userid = ?', [data.password, data.userid], function(err, rows, fields) {
			if (err) {
				json.data = '修改失败';
				callback(json);
				return;
			}
			success();
		});

		function success(rows) {
			_index += 1;
			if (_index == 2) {
				json.msg = MSG_K.SUCCESS;
				callback(json);
			}
		}
	}
// 注销用户信息
	function userDelete(data) {
		client.query('delete from forumuser where userid = ?', data.userid);
		console.log('注销成功');
	}
}
module.exports = Deal;