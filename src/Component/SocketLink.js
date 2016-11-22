'use strict';

var SERVER_K = {
  START: 0,
  WORK: 1,
  CLOSE: 2,
  ERROE: 3,
};

function SocketLink(app) {
	this.startLink = function() {
		app.ws = new WebSocket('ws://192.168.1.111:1111');
    this.server_k = SERVER_K.START;
    console.log(this.server_k);

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
	this.userSignUp = function(_id, _password, callback, _fromServer) {
		this.fromServer = _fromServer;
		var data = {
			userid: _id,
      password: _password,
      username: _id,
		};
		if (this.sendToSocket('New', 'helloword', data)) {
			callback('success');
		} else {
			callback('fail')
		}
	}
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
    	this.startLink();
      return false;
    }
	}

	this.startLink();
};

module.exports = SocketLink;