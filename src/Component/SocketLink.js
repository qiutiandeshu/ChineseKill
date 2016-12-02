'use strict';

var SERVER_K = {
  START: 0,
  WORK: 1,
  CLOSE: 2,
  ERROE: 3,
};

function SocketLink(app, _callback) {
  // 连接服务器
  this.callback = _callback;
	this.startLink = function() {
		app.ws = new WebSocket('ws://192.168.1.110:1111');
    this.server_k = SERVER_K.START;

    app.ws.onopen = (e) => {
      // connection opened
      this.server_k = SERVER_K.WORK;
      // console.log('socket open');
      this.callback('open');
    };
    app.ws.onmessage = (e) => {
      // a message was received
      var obj = JSON.parse(e.data);
      if (obj.from == 'Login') {
        if (obj.msg == '成功') {
          var bln = false;
          if (app.storageUserInfo == null) {
            bln = true;
          } else {
            if (app.storageUserInfo.userid != obj.data.userid) {
              bln = true;
            } else if (app.storageUserInfo.time < obj.data.time) {
              bln = true;
            }
          }
          if (bln) {
            if (obj.data.Review != null) {
              app.storageReview = JSON.parse(obj.data.Review);
              app.saveReview(app.storageReview);
            } else {
              app.storageReview = null;
              app.initReviewByStorage();
            }
            if (obj.data.CardInfo != null) {
              app.storageCardInfo = JSON.parse(obj.data.CardInfo);
              app.saveCardInfoMing();
            } else {
              app.storageCardInfo = null;
              app.initCardInfoByStorage();
            }
            if (obj.data.Learning != null) {
              var _learning = JSON.parse(obj.data.Learning);
              app.noneLearningStorage(_learning);
            } else {
              app.noneLearningStorage([]);
            }
            Home.Refresh();
          }
        }
      }
      if (this.fromServer) {
      	this.fromServer(obj);
      	this.fromServer = null;
      }
      this.callback('message');
    };
    app.ws.onclose = (e) => {
      // connection closed
      this.server_k = SERVER_K.CLOSE;
      // console.log('socket close');
      this.callback('close');
    };
    app.ws.onerror = (e) => {
      // an error occurred
      this.server_k = SERVER_K.ERROE;
      // console.log('socket error');
      this.callback('error');
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
  this.thirdSignUp = function(_id, _name, kind) {
    var date = new Date();
    var timer = date.getTime();
    app.storageUserInfo = {
      userid: _id,
      password: '111',
      username: _name,
      create: timer,
      time: timer,
      kind: kind,
    };
    console.log(app.storageUserInfo);
    this.sendToSocket('New', 'helloworld', app.storageUserInfo);
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
    if (this.sendToSocket('ChangePassword', 'helloworld', data)) {
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
  // 用户数据上传
  this.userUpdate = function(callback, _fromServer) {
    this.fromServer = _fromServer;
    var date = new Date();
    var timer = date.getTime();
    var data = {
      userid: app.storageUserInfo.userid,
      time: timer,
      Review: app.storageReview,
      CardInfo: app.storageCardInfo,
      Learning:app.storageLearning,
    };
    if (this.sendToSocket('Update', 'helloworld', data)) {
      callback('success');
    } else {
      callback('fail');
    }
  }
  // 默认登陆 用户信息验证，更新
  this.verifyUserInfo = function(obj) {
    if (obj.kind == 'create') {
      if (app.storageUserInfo.blnSign == false) return;
      app.onExpiredThird(obj.kind, (data)=>{

      });
    }
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
    } else if (kind == 'All') {
      this.fromServer = _fromServer;
      if (this.sendToSocket('GetCardMsg', 'All', data)) {
        callback('success');
      } else {
        callback('fail');
      }
    }
  }
  // 得到描红信息
  this.getCharacter = function(name, callback, _fromServer) {
    this.fromServer = _fromServer;
    var data = {
      name: name,
    };
    if (this.sendToSocket('GetPrint', 'helloworld', data)) {
      callback('success');
    } else {
      callback('fail');
    }
  }
  // 得到课程信息
  this.getLesson = function(name, callback, _fromServer) {
    this.fromServer = _fromServer;
    var data = {
      name: name,
    };
    if (this.sendToSocket('GetLesson', 'helloworld', data)) {
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

  // 获得时间
  this.getTime = function() {
    var date = new Date();
    var _h = date.getHours();
    var _m = date.getMinutes();
    var _s = date.getSeconds();
    var _ms = date.getMilliseconds();
    var time = date.getTime() - _h*3600000 - _m*60000 - _s*1000 - _ms;
    return time;
  }
  // 遗忘曲线，获得下次复习时间
  this.getReviewT = function(_day, _factor, _t) {
    var delay = Math.abs((this.getTime() - _day - _t)/86400000);
    var fct = _factor / 1000;

    var review_t = _t/86400000;
    if (review_t < 0) review_t = 1;
    var ivl2 = this.constrainedIvl((review_t + parseInt(delay/4))*1.2, review_t);
    var ivl3 = this.constrainedIvl((review_t + parseInt(delay/2))*fct, ivl2);
    var ivl4 = this.constrainedIvl((review_t + delay)*fct*1.3, ivl3);
    var list = [ivl4, ivl3, ivl2];
    return list;
  }
  this.constrainedIvl = function(ivl, prev) {
    var _review = ivl;
    if (ivl < prev+1) {
      _review = prev + 1;
    }
    return parseInt(_review);
  }
  //得到可复习的card列表
  this.getReviewList = function(blnC, blnW, blnS) {
    var json = {
      cNum: 0,
      wNum: 0,
      sNum: 0,
      list: [],
    };
    if (app.storageReview == null) return json;
    var learn = app.storageCardInfo.learnCards;
    if (blnC) {
      learn.ziKey.forEach((key)=>{
        var obj = app.storageReview['Character'][key];
        if (obj.review_t < 0) {
          obj.dis = -9999999;
          json.list.push(obj);
          json.cNum += 1;
        } else {
          var dis = obj.day + obj.review_t - socket.getTime();
          if (dis <= 0) {
            obj.dis = dis;
            json.list.push(obj)
            json.cNum += 1;
          }
        }
        obj.blnAgain = false;
      });
    }
    if (blnW) {
      learn.ciKey.forEach((key)=>{
        var obj = app.storageReview['Word'][key];
        if (obj.review_t < 0) {
          obj.dis = -9999999;
          json.list.push(obj);
          json.wNum += 1;
        } else {
          var dis = obj.day + obj.review_t - socket.getTime();
          if (dis <= 0) {
            obj.dis = dis;
            json.list.push(obj)
            json.wNum += 1;
          }
        }
        obj.blnAgain = false;
      });
    }
    // if (blnS) {
    //   learn.juKey.forEach((key)=>{
    //     var obj = app.storageReview['Sentence'][key];
    //     if (obj.review_t < 0) {
    //       obj.dis = -9999999;
    //       json.list.push(obj);
    //       json.sNum += 1;
    //     } else {
    //       var dis = obj.day + obj.review_t - socket.getTime();
    //       if (dis <= 0) {
    //         obj.dis = dis;
    //         json.list.push(obj);
    //         json.sNum += 1;
    //       }
    //     }
    //     obj.blnAgain = false;
    //   });
    // }
    json.list.sort((a, b)=>{
      return a.dis - b.dis;
    });
    return json;
  }

	this.startLink();
};

module.exports = SocketLink;