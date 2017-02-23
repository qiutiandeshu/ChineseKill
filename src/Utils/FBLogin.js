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
  ShareDialog,
  ShareApi,
} = FBSDK;

var publish_permissions = [
  "publish_actions",
];
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
  static CB_ShareLogin = 5;
  static CB_Share = 6;

  static ERR_Login = 1;
  static ERR_Logout = 2;
  static ERR_Expired = 3;
  static ERR_Cancel = 4;
  static ERR_IsExpired = 5;
  static ERR_GetInfo = 6;
  static ERR_ShareLogin = 7;
  static ERR_Share = 8;

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
  // var shareContent = {
  //   contentType: 'link',
  //   contentUrl: "http://www.baidu.com",
  //   imageUrl: "https://facebook.github.io/react-native/img/react-native-congratulations.png",
  //   contentDescription: 'Wow, check out this great site!',
  // };
  ShareLogin(shareContent){
    AccessToken.getCurrentAccessToken().then((data)=>{
      if (data == null){
        this.ShareLoginChild(shareContent);
      }else {
        var date = new Date();
        var expirateDate = new Date();
        expirateDate.setTime(data.expirationTime);
        if (date.valueOf() > data.expirationTime){
          this.ShareLoginChild(shareContent);
        }else{
          var bln = false;
          for(var i=0;i<data.permissions.length;i++){
            if (data.permissions[i] == "publish_actions"){
              bln = true;
              break;
            }
          }
          if (bln){
            this.shareLinkWithShareDialog(shareContent);
          }else{
            this.ShareLoginChild(shareContent);
          }
        }
      }
    }).catch((error)=>{
      this.CallbackTo({
        'code': FBLogin.CB_Error,
        'id': FBLogin.ERR_ShareLogin,
        'err_msg': error.toString(),
      });
    });
    
  }
  ShareLoginChild(shareContent){
    LoginManager.logInWithPublishPermissions(publish_permissions).then(
      (result)=>{
        if (result.isCancelled){
          console.log("facebook share login cancel!");
          this.CallbackTo({
            'code': FBLogin.CB_Error,
            'id': FBLogin.ERR_Cancel,
            'err_msg': '取消授权！'
          });
        }else{
          console.log("facebook share login success!");
          this.CallbackTo({
            'code': FBLogin.CB_ShareLogin
          });
          this.shareLinkWithShareDialog(shareContent);
        }
      }, (error)=>{
        console.log("facebook share login:" + error);
        this.CallbackTo({
          'code': FBLogin.CB_Error,
          'id': FBLogin.ERR_ShareLogin,
          'err_msg': error
        });
      }
    );
  }
  shareLinkWithShareDialog(shareContent) {
    ShareDialog.canShow(shareContent).then(
      (canShow)=>{
        if (canShow) {
          return ShareDialog.show(shareContent);
        }
      }
    ).then(
      (result)=>{
        if (result.isCancelled || result.postId == undefined) {
          console.log('Share cancelled');
          this.CallbackTo({
            'code': FBLogin.CB_Error,
            'id': FBLogin.ERR_Cancel,
            'err_msg': '取消分享！'
          });
        } else {
          console.log('Share success with postId: ' + result.postId);
           this.CallbackTo({
            'code': FBLogin.CB_Share
          });
        }
      },
      (error)=>{
        console.log('Share fail with error: ' + error);
        this.CallbackTo({
          'code': FBLogin.CB_Error,
          'id': FBLogin.ERR_Share,
          'err_msg': error
        });
      }
    );

    // ShareApi.canShare(shareContent).then(
    //   (canShare)=>{
    //     if (canShare) {
    //       return ShareApi.share(shareContent, '/me', "Hello world!!");
    //     }
    //   }
    // ).then(
    //   (result)=>{
    //     alert('Share with ShareApi success.');
    //   },
    //   (error)=>{
    //     alert('Share with ShareApi failed with error: ' + error);
    //   }
    // );
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
