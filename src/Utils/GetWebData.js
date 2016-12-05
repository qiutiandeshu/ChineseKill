/**
 * Sample React Native FBLogin
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
} from 'react-native';

var RNFS = require('react-native-fs');

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
  static Release(){
    webData.remove();
  }
  //文件路径名称
  static MAIN_BUNDLE = RNFS.MainBundlePath;
  static DOCUMENT = RNFS.DocumentDirectoryPath;
  static CACHES = RNFS.CachesDirectoryPath;
  constructor(){
    this.isDownloading = false;
    
    this.jobId = -1;
    this.filePath = '';
    this.callback = null;
  }
  remove(){
    this.callback = null;
    if (this.jobId != -1){
      RNFS.stopDownload(this.jobId);
    }
  }
  
  static CODE_ERROR = 0;//错误
  static CODE_CHECKFILE = 1;//检测文件
  static CODE_CREATEDIR = 2;//创建路径
  static CODE_DOWNLOAD = 3;//下载文件
  static CODE_READFILE = 4;//读取文件
  static CODE_DELETEFILE = 5;//删除文件
  static CODE_DOWNLOAD_BEGIN = 6;//下载开始
  static CODE_DOWNLOAD_PROGRESS = 7;//下载进度

  static ERR_CHECKURI = 0;//下载地址不正确
  static ERR_CHECKFILE = 1;//检测文件错误
  static ERR_CREATEDIR = 2;//创建路径错误
  static ERR_DOWNLOADING = 3;//不能同时下载多个
  static ERR_DOWNLOADED = 4;//下载失败
  static ERR_DOWNLOAD = 5;//下载错误
  static ERR_READFILE = 6;//读取文件错误
  static ERR_DELETEFILE = 7;//删除文件错误

  /*
  param={
    name:'name', 文件名，带后缀
    path:'path', 文件路径
    uri:'uri', 下载地址，如果为空，则返回错误，文件不存在
    type:'utf8', 打开方式，‘utf8’则返回文件数据，其他则返回文件路径
    over:false, 是否覆盖，默认是不覆盖，如果是true，则直接下载文件覆盖原有文件
  } 
  callback:回调函数
  */
  getWebFile(param, callback){
    this.callback = callback;
    const {path, name, uri, type} = param;
    var over = param.over ? param.over : false;
    var pathName = path + '/' + name;
    
    if (over && uri == null || uri == ''){
      this.toCallback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_CHECKURI,
        error: '下载地址不正确'
      });
      return;
    }
    var read = ()=>{
      if (type == 'utf8'){
        this.readFile(pathName, type, (rf)=>{
          this.toCallback(rf);
        });
      }else{
        this.toCallback({
          code: GetWebData.CODE_DOWNLOAD,
          data: pathName,
          error: null,
        });
      }
    };
    var download = ()=>{
      this.downloadFile(pathName, uri, (df)=>{
        if (df.code == GetWebData.CODE_DOWNLOAD){
          read();
        }else{
          this.toCallback(df);
        }
      });
    };
    this.checkFile(path, (cf)=>{
      if (cf.code == GetWebData.CODE_CHECKFILE){
        if (cf.data){//路径存在
          if (over){//如果覆盖，则不检测文件是否存在，直接下载
            download();
          }else{
            this.checkFile(pathName, (cd)=>{//检测文件
              if (cd.code == GetWebData.CODE_CHECKFILE){
                if (cd.data && !over){//文件存在并且不覆盖，则返回数据
                  read();
                }else{
                  download();
                }
              }else{
                this.toCallback(cd);
              }
            });
          }
        }else{//路径不存在
          this.createDir(path, (cd)=>{
            if (cd.code == GetWebData.CODE_CREATEDIR){
              download();
            }else{
              this.toCallback(cd);
            }
          });
        }
      }else{
        this.toCallback(cf);
      }
    });
  }

  /* 基本方法 */
  toCallback(data){
    if (this.callback){
      this.callback(data);
    }else{
      console.log('没有设置回调函数');
    }
  }
  checkFile(path, callback){//检测路径或文件
    RNFS.exists(path)
    .then((result)=>{
      callback && callback({
        code: GetWebData.CODE_CHECKFILE,
        data: result, //返回结果，是否存在
        error: null,
      });
    })
    .catch((err)=>{
      console.log('检测路径错误', err);
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_CHECKFILE,
        error: '检测文件或路径错误',
      });
    });
  }
  createDir(path, callback){//创建路径
    RNFS.mkdir(path)
    .then(()=>{//创建成功
      callback && callback({
        code: GetWebData.CODE_CREATEDIR,
        data: true,
        error: null,
      });
    })
    .catch((err)=>{
      console.log('创建路径错误', err);
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_CREATEDIR,
        error: '创建路径错误'
      });
    });
  }
  readFile(path, format, callback){//读取文件，format为文件格式，一般都为utf8
    if (!format) format = 'utf8';
    RNFS.readFile(path, format)
    .then((contents)=>{//得到文件内容
      callback && callback({
        code: GetWebData.CODE_READFILE,
        data: contents,
        error: null,
      });
    })
    .catch((err)=>{
      console.log('读取文件错误', err);
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_READFILE,
        error: '读取文件错误',
      });
    });
  }
  deleteFile(path, callback){//删除文件
    RNFS.unlink(path)
    .then(() => {
      callback && callback({
        code: GetWebData.CODE_DELETEFILE,
        data: true,
        error: null,
      });
    })
    .catch((err) => {
      console.log('删除失败', err);
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_DELETEFILE,
        error: '删除文件错误'
      });
    });
  }
  downloadFile(path, uri, callback){//下载文件，path下载到指定文件路径，uri从指定地址下载
    if (this.isDownloading) {
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_DOWNLOADING,
        error: '无法同时下载'
      });
      return;//如果正在下载，则不处理
    }
    this.isDownloading = true;
    var dl =RNFS.downloadFile({
      fromUrl: uri,
      toFile: path,
      begin: this.downloadBegin.bind(this),
      progress: this.downloadProgress.bind(this)
    });
    this.jobId = dl.jobId;
    this.filePath = path;
    dl.promise.then((response)=>{
      this.jobId = -1;
      this.isDownloading = false;
      if (response.statusCode == 200){//下载成功
        callback && callback({
          code: GetWebData.CODE_DOWNLOAD,
          data: true,
          error: null, 
        });
      }else {
        this.deleteFile(path, null);
        callback && callback({
          code: GetWebData.CODE_ERROR,
          data: GetWebData.ERR_DOWNLOADED,
          error: '下载失败： ' + response.statusCode,
        });
      }
    })
    .catch((err)=>{
      this.isDownloading = false;
      this.jobId = -1;
      this.deleteFile(path, null);
      console.log('下载文件错误', err);
      callback && callback({
        code: GetWebData.CODE_ERROR,
        data: GetWebData.ERR_DOWNLOAD,
        error: '下载错误'
      })
    });
  }
  downloadBegin(result){
    // this.downloadJobId = result.jobId;
    this.toCallback({
      code: GetWebData.CODE_DOWNLOAD_BEGIN,
      data: result,
      error: null,
    });
  }
  downloadProgress(result){
    var progress = result.bytesWritten/result.contentLength;
    console.log('downloading: ' + progress);
    this.toCallback({
      code: GetWebData.CODE_DOWNLOAD_PROGRESS,
      data: result,
      error: null,
    });
  }
}
