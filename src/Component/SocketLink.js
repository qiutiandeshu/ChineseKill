'use strict';

var SERVER_K = {
  START: 0,
  WORK: 1,
  CLOSE: 2,
  ERROE: 3,
};

function SocketLink(app) {
  // 连接服务器
	this.startLink = function() {
		app.ws = new WebSocket('ws://192.168.1.111:1111');
    this.server_k = SERVER_K.START;

    app.ws.onopen = (e) => {
      // connection opened
      this.server_k = SERVER_K.WORK;
      console.log('socket open');
    };
    app.ws.onmessage = (e) => {
      // a message was received
      var obj = JSON.parse(e.data);
      if (this.fromServer) {
      	this.fromServer(obj);
      	this.fromServer = null;
      }
    };
    app.ws.onclose = (e) => {
      // connection closed
      this.server_k = SERVER_K.CLOSE;
      console.log('socket close');
    };
    app.ws.onerror = (e) => {
      // an error occurred
      this.server_k = SERVER_K.ERROE;
      console.log('socket error');
    };
	}
	this.stopLink = function() {
		app.ws.close();
	}

  // 客户端请求实现，有两个回调函数 callback发送完调用，返回发送是否成功；_fromServer服务器返回消息后调用，获得服务器返回的信息
  // 用户注册
	this.userSignUp = function(_id, _password, callback, _fromServer) {
		this.fromServer = _fromServer;
		var data = {
			userid: _id,
      password: _password,
      username: _id,
		};
		if (this.sendToSocket('New', 'helloworld', data)) {
			callback('success');
		} else {
			callback('fail')
		}
	}
  // 用户登录
  this.userSignIn = function(_id, _password, callback, _fromServer) {
    this.fromServer = _fromServer;
    var data = {
      userid: _id,
      password: _password,
    };
    if (this.sendToSocket('Login', 'helloworld', data)) {
      callback('success');
    } else {
      callback('fail');
    }
  }
  // 客户端向服务器发送消息
	this.sendToSocket = function(_from, _msg, _data) {
		var json = {
      from: _from,
      msg: _msg,
      data: _data,
    }
    if (this.server_k == SERVER_K.WORK) {
      app.ws.send(JSON.stringify(json));
      return true;
    } else {
      if (this.server_k == SERVER_K.CLOSE) {
      	this.startLink();
      }
      return false;
    }
	}

	this.startLink();
};

module.exports = SocketLink;