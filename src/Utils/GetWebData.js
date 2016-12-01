/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
} from 'react-native';

var fs = require('react-native-fs');
// var sound = require('react-native-sound');
// Sound.MAIN_BUNDLE, Sound.DOCUMENT, Sound.LIBRARY, Sound.CACHES

var webData = null;
export default class GetWebData{
  static Instance(){
    if (webData == null){
      webData = new GetWebData();
    }
    return webData;
  }
  static Remove(){
    webData.remove();
    webData = null;
  }
  //文件路径名称
  static MAIN_BUNDLE = fs.MainBundlePath;
  static DOCUMENT = fs.DocumentDirectoryPath;
  static CACHES = fs.CachesDirectoryPath;
  constructor(){
    this.callback = null;
  }
  remove(){
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
  getWebFile(name, path, uri, callback){
    fs.exists(path)//检测路径是否存在
    .then((result)=>{
      if (result) {//路径存在
        fs.exists(path + '/' + name)//检测文件是否存在
        .then((result1)=>{
          if (result1) {//文件存在
            // fs.
          }
        })
      }else{
        // fs.mkdir(path)
        // .then()
      }
    })
  }
}
