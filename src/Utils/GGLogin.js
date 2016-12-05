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

var GoogleLogin = NativeModules.GoogleLogin;
const glLoginCB = new NativeEventEmitter(GoogleLogin);

var ggLogin = null;
export default class GGLogin{
  static Instance(){
    if (ggLogin == null){
      ggLogin = new GGLogin();
      console.log('new gglogin!');
    }
    return ggLogin;
  }
  static Remove(){
    ggLogin.remove();
    ggLogin = null;
  }
  static CB_CODE_ERROR = GoogleLogin.CB_CODE_ERROR;
  static CB_CODE_LOGIN = GoogleLogin.CB_CODE_LOGIN;
  static CB_CODE_LOGOUT = GoogleLogin.CB_CODE_LOGOUT;
  static CB_CODE_EXPIRED = GoogleLogin.CB_CODE_EXPIRED;
  static CB_CODE_DISCONNECT = GoogleLogin.CB_CODE_DISCONNECT;

  static ERROR_LOGIN = GoogleLogin.ERROR_LOGIN;
  static ERROR_DISCONNECT = GoogleLogin.ERROR_DISCONNECT;

  static EXPIRED_OUT = GoogleLogin.EXPIRED_OUT;
  static EXPIRED_IN = GoogleLogin.EXPIRED_IN;

  constructor(){
    this.ggListener = glLoginCB.addListener('gglCallback', this.gglCallback.bind(this));
    this.callback = null;
  }
  remove(){
    this.ggListener && this.ggListener.remove();
    this.ggListener = null;
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
    GoogleLogin.Login();
  }
  Logout(){
    GoogleLogin.Logout();
  }
  LoginSilently(){
    GoogleLogin.LoginSilently();
  }
  Expired(){
    GoogleLogin.IsExpired();
  }
  gglCallback(data){
    this.CallbackTo(data);
    // if (data.code == GoogleLogin.CB_CODE_ERROR){
    //   var ret = JSON.parse(data.result);
    //   if (ret.id == GoogleLogin.ERROR_LOGIN){
    //     alert('登录失败：' + ret.dsc);
    //   }else if (ret.id == GoogleLogin.ERROR_DISCONNECT){
    //     alert('断开连接失败：' + ret.dsc);
    //   }else {
    //     alert("未知错误！");
    //   }
    // }else if (data.code == GoogleLogin.CB_CODE_LOGIN){
    //   var ret = JSON.parse(data.result);
    //   console.log('登录成功：' + ret.fullName + '!');
    //   // this.setState({
    //   //   glName: ret.fullName,
    //   //   glEmail: ret.email,
    //   //   glLoginStatus: true
    //   // });
    //   alert('欢迎回来，' + ret.fullName + '!');
    // }else if (data.code == GoogleLogin.CB_CODE_LOGOUT){
    //   // this.setState({
    //   //   glName: '',
    //   //   glEmail: '',
    //   //   glLoginStatus: false,
    //   // });
    //   alert('登出成功！');
    // }else if (data.code == GoogleLogin.CB_CODE_EXPIRED){
    //   if (data.result == GoogleLogin.EXPIRED_OUT){
    //     console.log('登录已经过期');
    //     // this.LoginGoolge();
    //   }else {
    //     console.log('登录成功！');
    //     // this.LoginGoogleSilently();
    //   }
    // }else if (data.code == GoogleLogin.CB_CODE_DISCONNECT){
    //   // this.setState({
    //   //   glName: '',
    //   //   glEmail: '',
    //   //   glLoginStatus: false,
    //   // });
    //   alert('登出成功：' + ret.fullName);
    // }
  }
}
