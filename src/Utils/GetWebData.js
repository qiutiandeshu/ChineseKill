/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
} from 'react-native';

var RNFS = require('react-native-fs');
// var sound = require('react-native-sound');
// Sound.MAIN_BUNDLE, Sound.DOCUMENT, Sound.LIBRARY, Sound.CACHES

var webData = null;
export default class GetWebData{
  static Instance(){
    if (webData == null){
      webData = new GetWebData();
      console.log('init web data');
    }
    return webData;
  }
  static Remove(){
    webData.remove();
    webData = null;
  }
  //文件路径名称
  static MAIN_BUNDLE = RNFS.MainBundlePath;
  static DOCUMENT = RNFS.DocumentDirectoryPath;
  static CACHES = RNFS.CachesDirectoryPath;
  constructor(){
  }
  remove(){
  }

  //tpye为 uft8 则读取文件，返回data是数据，否则返回文件路径
  getWebFile(name, path, uri, type, callback){
    this.dlPath = path + '/' + name;
    RNFS.exists(path)//检测路径是否存在
    .then((result)=>{
      if (result) {//路径存在
        RNFS.exists(path + '/' + name)//检测文件是否存在
        .then((result1)=>{
          if (result1) {//文件存在
            if (type == 'utf8'){
              RNFS.readFile(path + '/' + name, type)
              .then((contents)=>{
                callback({
                  error: null,
                  data: contents,
                });
              })
              .catch((err)=>{
                console.log(err);
                callback({
                  error: '读取文件出错',
                  err_dsc: '读取 ' + path + '/' + name + ' 出错'
                });
              });
            }else {
              callback({
                error: null,
                data: path + '/' + name
              });
            }
          }else{
            this.downloadData(name, path, uri, type, callback);
          }
        })
        .catch((err)=>{
          console.log(err);
          callback({
            error: '检测文件出错',
            err_dsc: '检测 ' + path + '/' + name + '出错'
          });
        });
      }else{
        RNFS.mkdir(path)//创建路径
        .then((result)=>{
          if (result[0]){
            this.downloadData(name, path, uri, type, callback);
          }else{
            callback({
              error: '创建缓存文件出错',
              err_dsc: '创建路径 ' + path + ' 出错'
            });
          }
        })
        .catch((err)=>{
          console.log(err);
          callback({
            error: '创建路径出错',
            err_dsc: '创建路径 ' + path + '出错'
          });
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      callback({
        error: '检测路径出错',
        err_dsc: '检测 ' + path + '出错'
      });
    });
  }

  //tpye为 uft8 则读取文件，返回data是数据，否则返回文件路径
  downloadData(name, path, uri, type, callback){
    this.tempLen = [];
    console.log('download file: ', name, path, uri);
    RNFS.downloadFile({
      fromUrl: uri,
      toFile: path + '/' + name,
      begin: this.downloadBegin.bind(this),
      progress: this.downloadProgress.bind(this)
    }).promise.then((response)=>{
      if (response.statusCode == 200){//下载成功
        if (type == 'utf8'){//如果为utf8则读取文件返回
          RNFS.readFile(path + '/' + name, type)
          .then((contents)=>{
            callback({
              error: null,
              data: contents,
            });
          })
          .catch((err)=>{
            console.log(err);
            callback({
              error: '读取文件出错',
              err_dsc: '读取 ' + path + '/' + name + ' 出错'
            });
          });
        }else {
          callback({
            error: null,
            data: path + '/' + name
          });
        }
      }else{
        callback({
          error: '下载错误: ' + response.statusCode,
          err_dsc: '从 ' + uri + ' 下载出错!',
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      callback({
        error: 'download error',
        err_dsc: '网络信号不好，请稍后再试！'
      })
    });
  }
  downloadBegin(result){
    this.downloadJobId = result.jobId;
    this.tempLen[result.jobId] = 0;
  }
  downloadProgress(result){
    var progress = result.bytesWritten/result.contentLength
    this.tempLen[result.jobId] = result.bytesWritten;
    console.log('downloading: ' + progress);
  }
}
