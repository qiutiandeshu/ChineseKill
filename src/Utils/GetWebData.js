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
    this.dlPath = null;
    this.tempLen = [];
    this.dlId = [];
  }
  remove(){
  }

  /*
  name，文件的名字，带后缀
  path，文件的的路径，如果需要下载，则保存在改路径下
  uri，下载地址，如果为空，则不下载，返回错误提示“文件不存在”
  tpye，‘uft8’ 则读取文件并且返回数据，否则返回文件路径（data）
  callback, 得到的结果回调，如果结果的.error不为空，说明出错了。
  */
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
                callback && callback({
                  error: null,
                  data: contents,
                });
              })
              .catch((err)=>{
                console.log(err);
                callback && callback({
                  error: '读取文件出错',
                  err_dsc: '读取 ' + path + '/' + name + ' 出错'
                });
              });
            }else {
              callback && callback({
                error: null,
                data: path + '/' + name
              });
            }
          }else{
            if (uri && uri != ''){//如果uri为空，则不下载，直接返回错误，提示文件未找到
              this.downloadData(name, path, uri, type, callback);
            }else{
              callback && callback({
                error: '文件不存在',
                err_dsc: '检测的文件' + path + '/' + name + '不存在'
              });
            }
          }
        })
        .catch((err)=>{
          console.log(err);
          callback && callback({
            error: '检测文件出错',
            err_dsc: '检测 ' + path + '/' + name + '出错'
          });
        });
      }else{
        RNFS.mkdir(path)//创建路径
        .then(()=>{
          this.downloadData(name, path, uri, type, callback);
        })
        .catch((err)=>{
          console.log(err);
          callback && callback({
            error: '创建路径出错',
            err_dsc: '创建路径 ' + path + '出错'
          });
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      callback && callback({
        error: '检测路径出错',
        err_dsc: '检测 ' + path + '出错'
      });
    });
  }

  //tpye为 uft8 则读取文件，返回data是数据，否则返回文件路径
  downloadData(name, path, uri, type, callback){
    this.tempLen = [];
    this.isDownloading = true;
    // console.log('download file: ', name, path, uri);
    var dl =RNFS.downloadFile({
      fromUrl: uri,
      toFile: path + '/' + name,
      begin: this.downloadBegin.bind(this),
      progress: this.downloadProgress.bind(this)
    });
    dl.promise.then((response)=>{
      this.isDownloading = false;
      if (response.statusCode == 200){//下载成功
        if (type == 'utf8'){//如果为utf8则读取文件返回
          RNFS.readFile(path + '/' + name, type)
          .then((contents)=>{
            callback && callback({
              error: null,
              data: contents,
            });
          })
          .catch((err)=>{
            console.log(err);
            callback && callback({
              error: '读取文件出错',
              err_dsc: '读取 ' + path + '/' + name + ' 出错'
            });
          });
        }else {
          callback && callback({
            error: null,
            data: path + '/' + name
          });
        }
      }else{
        RNFS.unlink(path+ '/' + name);
        callback && callback({
          error: '下载错误: ' + response.statusCode,
          err_dsc: '从 ' + uri + ' 下载出错!',
        });
      }
    })
    .catch((err)=>{
      this.isDownloading = false;
      console.log(err);
      callback && callback({
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

  //删除文件，path为文件或者路径
  deleteFile(path, callback){
    RNFS.unlink(path)
    .then(() => {
      callback && callback({
        error: null,
        data: '删除成功!'
      });
    })
    .catch((err) => {
      console.log(err);
      callback && callback({
        error: '删除失败:' + err.message,
        err_dsc: err.message
      });
    });
  }
}
