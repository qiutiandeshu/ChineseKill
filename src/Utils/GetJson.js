/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
} from 'react-native';
var Sound = require('react-native-sound');
// Sound.MAIN_BUNDLE, Sound.DOCUMENT, Sound.LIBRARY, Sound.CACHES

var getJson = null;
export default class GetJson{
  static Instance(){
    if (getJson == null){
      getJson = new GetJson();
    }
    return getJson;
  }
  static Remove(){
    getJson.remove();
    getJson = null;
  }
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
