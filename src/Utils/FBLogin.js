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

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} = FBSDK;

var fbLogin = null;
export default class FBLogin{
  static Instance(){
    if (fbLogin == null){
      fbLogin = new FBLogin();
    }
    return fbLogin;
  }
  static Remove(){
    fbLogin.remove();
    fbLogin = null;
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
    this.infoRequest = new GraphRequest(
      '/me?fields=age_range,id,email,name,link', 
      null, 
      this.infoCallback.bind(this)
    );
    this.callback = null;
  }
  remove(){
    this.infoReques = null;
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

  // permissions=[
  //   'public_profile', //默认基本信息
  //   'email', //获取邮箱地址
  // ]
  Login(permissions){
    LoginManager.logInWithReadPermissions(permissions).then(
      (result)=>{
        if (result.isCancelled){
          this.CallbackTo({
            'code': FBLogin.CB_Error,
            'id': FBLogin.ERR_Cancel,
            'err_msg': '取消登录！'
          });
        }else{
          this.CallbackTo({
            'code': FBLogin.CB_Login
          });
        }
      }, (error)=>{
        this.CallbackTo({
          'code': FBLogin.CB_Error,
          'id': FBLogin.ERR_Login,
          'err_msg': error
        });
      }
    );
  }
  Logout(){
    LoginManager.logOut();
    this.CallbackTo({
      'code': FBLogin.CB_Logout, 
    });
  }
  Expired(){
    AccessToken.getCurrentAccessToken().then(data=>{
      if (data == null){
        this.CallbackTo({
          'code': FBLogin.CB_Error,
          'id': FBLogin.ERR_IsExpired,
          'err_msg': '未登录或登录过期了，请重新登录!'
        });
      }else {
        var date = new Date();
        var expirateDate = new Date();
        expirateDate.setTime(data.expirationTime);
        // console.log(data.expirationTime);
        // console.log(expirateDate.toDateString());
        if (date.valueOf() > data.expirationTime){
          this.CallbackTo({
            'code': FBLogin.CB_Error,
            'id': FBLogin.ERR_IsExpired,
            'err_msg': '登录过期了，重新登录!'
          });
        }else{
          this.CallbackTo({//没过期
            'code': FBLogin.CB_Expired,
          });
        }
      }
    }).catch(error=>{
      this.CallbackTo({
        'code': FBLogin.CB_Error,
        'id': FBLogin.ERR_Expired,
        'err_msg': error.toString(),
      });
    });
  }
  GetInfo(){
    new GraphRequestManager().addRequest(this.infoRequest).start();
  }
  infoCallback(error, result){
    if (error){
      this.CallbackTo({
        'code': FBLogin.CB_Error,
        'id': FBLogin.ERR_GetInfo,
        'err_msg': error.toString()
      });
    }else{
      this.CallbackTo({
        'code': FBLogin.CB_GetInfo,
        'result': result,
      });
    }
  }
}
