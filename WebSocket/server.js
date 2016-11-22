var WebSocketServer = require('ws').Server;
var Deal = require('./Deal.js');
var server = new WebSocketServer({
	port: 1111,
});

var work = new Deal();
server.on('connection', function(socket) {
	console.log('新客户');

	socket.on('message', function(data) {
		var json = JSON.parse(data);
		console.log('得到客户端信息');
		work.getMsg(json, function(_json) {
			socket.send(JSON.stringify(_json));
			console.log(_json);
		})
	});

	socket.on('close', function() {
		console.log('客户离开');
	});
});

console.log("服务器开启！");