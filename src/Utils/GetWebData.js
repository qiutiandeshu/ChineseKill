/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
} from 'react-native';
var sound = require('react-native-sound');
var fs = require('react-native-fs');
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
  static MAIN_BUNDLE = sound.MAIN_BUNDLE;
  static DOCUMENT = sound.DOCUMENT;
  static LIBRARY = sound.LIBRARY;
  static CACHES = sound.CACHES;
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
  getCharactorJson(name){
    
  }
}
