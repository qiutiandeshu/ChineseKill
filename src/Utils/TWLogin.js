/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

var TwitterLogin = NativeModules.TwitterLogin;
const twLoginCB = new NativeEventEmitter(TwitterLogin);

var twLogin = null;
export default class TWLogin{
  static Instance(){
    if (twLogin == null){
      twLogin = new TWLogin();
      console.log('new twlogin!');
    }
    return twLogin;
  }
  static Remove(){
    twLogin.remove();
    twLogin = null;
  }
  static CB_Error = 0;
  static CB_Login = 1;
  static CB_Logout = 2;
  static CB_Expired = 3;
  static CB_GetInfo = 4;

  static ERR_Login = 1;
  static ERR_Logout = 2;
  static ERR_Expired = 3;
  static ERR_Cancel = 4;
  static ERR_IsExpired = 5;
  static ERR_GetInfo = 6;

  constructor(){
    this.twListener = twLoginCB.addListener('twlCallback', this.twlCallback.bind(this));
    this.callback = null;
  }
  remove(){
    this.twListener && this.twListener.remove();
    this.twListener = null;
    this.callback = null;
  }

  SetCallback(callback){//设置回调
    this.callback = callback;
  }
  CallbackTo(data){
    if (this.callback){
      this.callback(data);
    }
  }

  Login(){
    TwitterLogin.Login();
  }
  Logout(){
    TwitterLogin.Logout();
  }
  Expired(){
    TwitterLogin.IsExpired();
  }
  GetInfo(){
    TwitterLogin.GetInfos();
  }
  twlCallback(data){
    this.CallbackTo(data);
    if (data.code == TwitterLogin.CB_CODE_ERROR){
      var ret = JSON.parse(data.result);
      if (ret.id == TwitterLogin.ERROR_LOGIN){
        alert('登录失败：' + ret.dsc);
      }else if (ret.id == TwitterLogin.ERROR_EXPIRED){
        console.log('验证有效期失败：' + ret.dsc);
        // this.LoginTwitter();
      }else if (ret.id == TwitterLogin.ERROR_GETINFO){
        alert('获取信息失败：' + ret.dsc);
      }else if (ret.id == TwitterLogin.ERROR_NOTLOGIN){
        console.log('你还未登录呢！');
        // this.LoginTwitter();
      }else {
        alert("未知错误！");
      }
    }else if (data.code == TwitterLogin.CB_CODE_LOGIN){
      var ret = JSON.parse(data.result);
      console.log('登录成功：' + ret.userName + '!');
      // this.GetInfoTwitter();
    }else if (data.code == TwitterLogin.CB_CODE_LOGOUT){
      var ret = JSON.parse(data.result);
      // this.setState({
      //   twName: '',
      //   twLoginStatus: false,
      //   twIcon: null,
      // });
      alert('登出成功：' + ret.userID);
    }else if (data.code == TwitterLogin.CB_CODE_EXPIRED){
      if (data.result == TwitterLogin.EXPIRED_OUT){
        console.log('登录已经过期');
        // this.LoginTwitter();
      }else {
        console.log('登录成功！');
        // this.GetInfoTwitter();
      }
    }else if (data.code == TwitterLogin.CB_CODE_GETINFO){
      var ret = JSON.parse(data.result);
      console.log(ret);
      // this.setState({
      //   twName: ret.name,
      //   twLoginStatus: true,
      //   twIcon: ret.profile_image_url,
      // });
      alert('欢迎回来，' + ret.name + '!');
    }
  }
}