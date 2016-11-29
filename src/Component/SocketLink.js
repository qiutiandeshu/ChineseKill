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
		app.ws = new WebSocket('ws://192.168.1.110:1111');
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
    var date = new Date();
    var timer = date.getTime();
		var data = {
			userid: _id,
      password: _password,
      username: _id,
      create: timer,
      time: timer,
      kind: 'create',
		};
		if (this.sendToSocket('New', 'helloworld', data)) {
			callback('success');
		} else {
			callback('fail');
		}
	}
  // 第三方facebook登陆
  this.facebookSignUp = function(_email, _name) {
    var date = new Date();
    var timer = date.getTime();
    app.storageUserInfo = {
      userid: _email,
      password: '',
      username: _name,
      create: timer,
      time: timer,
      kind: 'facebook',
    };
    this.sendToSocket('Login', 'helloworld', app.storageUserInfo);
    app.storageUserInfo.blnSign = true;
    app.saveUserInfo(app.storageUserInfo);
  }
  // 用户信息修改
  this.userChangePassword = function(_id, callback, _fromServer) {
    this.fromServer = _fromServer;
    var data = {
      userid: app.storageUserInfo.userid,
      password: _id,
    };
    if (this.sendToSocket('Update', 'helloworld', data)) {
      callback('success');
    } else {
      callback('fail');
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
  // 默认登陆 用户信息验证，更新
  this.verifyUserInfo = function(obj) {
    if (obj.kind == 'create') {
      this.userSignIn(obj.userid, obj.password, (msg)=>{
        if (msg == 'fail') {
          this.fromServer = null;
        }
      }, (json)=>{
        if (json.msg == '成功') {
          if (app.storageUserInfo.blnSign) {
            if (parseInt(json.data.time) != app.storageUserInfo.time) {
              app.storageUserInfo = json.data;
              app.storageUserInfo.blnSign = true;
              app.saveUserInfo(app.storageUserInfo);
            }
          }
        }
      });
    } else if (obj.kind == 'facebook') {

    }
  }
  // 从服务器获得card信息
  this.getCardMsg = function(kind, data, callback, _fromServer) {
    if (kind == 'Character') {
      this.fromServer = _fromServer;
      if (this.sendToSocket('GetCardMsg', 'Character', data)) {
        callback('success');
      } else {
        callback('fail');
      }
    } else if (kind == 'Word') {
      this.fromServer = _fromServer;
      if (this.sendToSocket('GetCardMsg', 'Word', data)) {
        callback('success');
      } else {
        callback('fail');
      }
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