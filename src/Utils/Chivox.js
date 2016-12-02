/**
 * Sample React Native Chivox
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

var ChivoxISE = NativeModules.ChivoxISE;
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
const myNativeEvt = new NativeEventEmitter(ChivoxISE);

var chivoxInfo = {
  "APP_KEY": "1476169544000061",
  "SECRET_KEY": "8cc1377165d4a3a84a975dba19873c85"
};
const PUNCTUATION = ['，', '。', '？', '“', '”', '！', '：', '（', '）', '；'];//标点符号集(中文符号)
let cv = {
  PLAYER_NOT: -1,
  PLAYER_STOP: 0,
  PLAYER_PLAY: 1,
  PLAYER_PAUSE: 2,

  CB_CODE_ERROR: ChivoxISE.CB_CODE_ERROR,
  CB_CODE_RESULT: ChivoxISE.CB_CODE_RESULT,
  CB_CODE_STATUS: ChivoxISE.CB_CODE_STATUS,

  SPEECH_PRESTART: ChivoxISE.SPEECH_PRESTART,
  SPEECH_RECOG: ChivoxISE.SPEECH_RECOG,
  SPEECH_START: ChivoxISE.SPEECH_START,
  SPEECH_STOP: ChivoxISE.SPEECH_STOP,
  SPEECH_TIMEOUT: ChivoxISE.SPEECH_TIMEOUT,
  SPEECH_WORK: ChivoxISE.SPEECH_WORK,
  
  PCM_CURRENTTIME: ChivoxISE.PCM_CURRENTTIME,
  PCM_ERROR: ChivoxISE.PCM_ERROR,
  PCM_PLAYOVER: ChivoxISE.PCM_PLAYOVER,
  PCM_TOTALTIME: ChivoxISE.PCM_TOTALTIME
};

var chivox = null;
class Chivox{
  static Instance(){
    if (chivox == null){
      chivox = new Chivox();
    }
    return chivox;
  }
  static Remove(){
    chivox.remove();
    chivox = null;
  }
  constructor(){
    ChivoxISE.initAll(chivoxInfo);
    this.listener = myNativeEvt.addListener('iseCallback', this.iseCallback.bind(this));
    this.volumeListener = myNativeEvt.addListener('iseVolume', this.iseVolume.bind(this));
    this.pcmListener = myNativeEvt.addListener('playCallback', this.playCallback.bind(this));
    this.audioCurrentTime = 0;
    this.audioTime = 0;
    this.playerState = cv.PLAYER_NOT;
    this.speechStatus = ChivoxISE.SPEECH_STOP;
    this.volume = 0;
    this._isecb = null;
    this._volcb = null;
    this._pcmcb = null;
  }
  remove(){
    this.listener && this.listener.remove();
    this.listener = null;
    this.volumeListener && this.volumeListener.remove();
    this.volumeListener = null;
    this.pcmListener && this.pcmListener.remove();
    this.pcmListener = null;
    this._isecb = null;
    this._volcb = null;
    this._pcmcb = null;
  }
  setCallback(iseCb, volCb, pcmCb){
    this._isecb = iseCb;
    this._volcb = volCb;
    this._pcmcb = pcmCb;
  }
  playCallback(data){
    if (this._pcmcb){
      this._pcmcb(data);
    }
    if (data.status == ChivoxISE.PCM_TOTALTIME) {
      //
    } else if (data.status == ChivoxISE.PCM_PLAYOVER) {
      this.playerState = cv.PLATER_STOP;
    } else if (data.status == ChivoxISE.PCM_CURRENTTIME) {
      //
    } else if (data.status == ChivoxISE.PCM_ERROR) {
      //
    }
  }
  iseVolume(data){
    if (this._volcb){
      if (this.speechStatus == cv.SPEECH_RECOG){
        data.volume = 0;
      }
      this._volcb(data);
    }
    this.volume = parseFloat(data.volume);
  }
  iseCallback(data){
    if (this._isecb){
      this._isecb(data);
    }
    if (data.code == ChivoxISE.CB_CODE_RESULT) {
      // console.log('have result!');
      // this.resultParse(data.result);
      this.speechStatus = ChivoxISE.SPEECH_STOP;
      // this.volume = 0;
    }
    else if (data.code == ChivoxISE.CB_CODE_ERROR) {
      // if (data.result.match("-20161015_")){
      //   var r = data.result.split('_');
      //   var ret = JSON.parse(r[1]);
      //   console.log(ret);//里面包含errorid 和 error的描述
      //   if (chivoxErr[ret.errId]){
      //     console.log(chivoxErr[ret.errId]);
      //   }else{
      //     console.log(`${ret.errId}，未知错误！`);
      //   }
      //   // ret.errId;//id
      //   // ret.error;//描述
      // }else{
      //   console.log('error', data.result);
      // }
      this.speechStatus = ChivoxISE.SPEECH_STOP;
      // this.volume = 0;
    }
    else if (data.code == ChivoxISE.CB_CODE_STATUS) {//正在录音
      // console.log('status', data.result);
      // if (data.result == ChivoxISE.SPEECH_START) {//已经开始
      //   //
      // } else if (data.result == ChivoxISE.SPEECH_WORK) {//工作中...
      //   //
      // } else if (data.result == ChivoxISE.SPEECH_STOP) {//手动停止
      //   //
      // } else if (data.result == ChivoxISE.SPEECH_RECOG) {//识别中...
      //   //
      // } else if (data.result == ChivoxISE.SPEECH_PRESTART) {//启动前...
      //   //整个时候还不能说话
      // }
      this.speechStatus = data.result;
    }
    else {//..真的是未知的错误
      // console.log('传回其他参数', data.result);
      this.speechStatus = ChivoxISE.SPEECH_STOP;
    }
  }
  resultParse(result){
    var obj = eval('(' + result + ')');
    console.log(obj);
    if (obj.error){
      // console.log('评测错误', obj.errId, obj.error);
      //已经在原生端处理了，这里只是加个保险。
    }else{
      var result = obj.result;
      console.log('总分：' + result.overall);
      console.log('无调分：' + result.phn);
      console.log('带调分：' + result.pron);
      console.log('声调分：' + result.tone);
      console.log('详情：', result.details);
    }
  }

  //var initInfo = {
  //  FILE_PATH: fileName,//录音文件的名称，不带后缀，默认为wav
  //  SAMPLE_RATE: '16000',//采样率，16000即可，不需要调整
  //  WAV_PATH: ''//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
  //};
  async initPcm(initInfo, callback){//初始化录音播放接口，带回调函数，返回音频文件的播放总时长
    try {
      var ret = await ChivoxISE.initPcm(initInfo);
      this.audioCurrentTime = 0;
      this.audioTime = ret;
      this.playerState = cv.PLAYER_STOP;
      callback({
        'error': null,
        'audioTime': this.audioTime,
      });
    }catch(error){
      console.log('initPcm', error);
      this.playerState = cv.PLAYER_NOT;
      callback({
        'error': 1,
        'err_msg': 'init pcm error',
      });
    }
  }
  async getCurrentTime(callback) {//获取播放录音最新播放进度，做播放进度条用，带一个回调函数
    try {
      if (this.playerState == cv.PLAYER_STOP || this.playerState == cv.PLAYER_NOT) {
        callback({
          'error': 2,
          'err_msg': 'not to play pcm',
        });
        return;
      }
      this.audioCurrentTime = await ChivoxISE.getPcmCurrentTime();
      callback({
        'error': null,
        'audioCurrentTime': this.audioCurrentTime
      });
    } catch (error) {
      console.log("getCurrentTime", error);
      callback({
        'error': 3,
        'err_msg': 'get current time error!'
      });
    }
  }
  playPcm(){//播放录音文件
    if (this.playerState == cv.PLAYER_NOT){
      console.log('this pcm is not init, please initPcm first!');
    }
    if (this.playerState != cv.PLAYER_PLAY && this.playerState != cv.PLAYER_NOT){
      ChivoxISE.playPcm();
      this.playerState = cv.PLAYER_PLAY;
    }
  }
  stopPcm(){//停止播放
    if (this.playerState == cv.PLAYER_PLAY || this.playerState == cv.PLAYER_PAUSE){
      ChivoxISE.stopPcm();
      this.playerState = cv.PLAYER_STOP;
    }
  }
  pausePcm(){//暂停播放
    if (this.playerState == cv.PLAYER_PLAY){    
      ChivoxISE.pausePcm();
      this.playerState = cv.PLAYER_PAUSE;
    }
  }

  // data = {
  //   VOLUME_TS: 0.7,//音量超过多少则表示检测到说话了，最大值为1
  //   VAD_BOS: 3600,//静音超时时间，即用户多长时间不说话则当做超时处理vad_bos 毫秒 ms
  //   VAD_EOS: 1800,//后端点静音检测时间，即用户停止说话多长时间内即认为不再输入，自动停止录音 毫秒 ms
  //   ISE_CATEGORY: 'word',//评测模式：word 字词, sent 句子
  //   SPEECH_TIMEOUT: '10000',//录音超时，录音达到时限时自动触发vad，停止录音，默认-1（无超时）
  //   TEXT: 'jin1 tian1',//需要评测的内容，带后标声调的拼音数据
  //   ISE_AUDIO_PATH: 'pcm',//录音文件的名称，不带后缀，默认为wav
  //   SAMPLE_RATE: '16000',//采样率，16000即可，不需要调整
  //   USER_ID: 'jld-9527',//userID
  //   index: 0,//使用和讯飞的字段，在评测之后返回会自带该字段
  //   //WAV_PATH: ''//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
  // }
  //iseCb: 评测的回调, volCb: 音量回调
  startISE(data){//开始评测，各参数看上面
    this.cancelISE();
    ChivoxISE.start(data, ''+data.index, data.ISE_CATEGORY);//这里使用和讯飞一样的字段，后面两个的作用参考LiuliSpeak@唐
  }
  stopISE(){//中途如果录音了，则不会停止这次评测，只是停止录音
    if (this.speechStatus != cv.SPEECH_STOP){
      ChivoxISE.stop();
    }
  }
  cancelISE(){//取消本次评测，调用后，本次评测取消，录音停止，不会得到评测结果
    if (this.speechStatus != cv.SPEECH_STOP){
      ChivoxISE.cancel();
    }
  }
}
var chivoxErr = {//返回错误码，可以对应该错误码进行log或者提示。
  40001: '未指定请求参数',
  40002: '未在参数中添加request参数项',
  40092: '传输的音频时长超限',
  40400: '请求的内核资源不存在',
  41001: '参数非JSON格式',
  41002: '控制消息的格式出错，没有cmd项',
  41004: '控制消息的格式出错，没有param项',
  41007: '未传输音频格式',
  41008: '音频格式不支持',
  41009: '音频信息不合法',
  41010: '音频信息不合法',
  41011: '音频信息不合法',
  41012: '为传输音频信息',
  41014: 'request中的信息不合法',
  41030: 'auth验证未通过',
  41031: 'auth验证异常',
  41032: 'sdk为按照流程发送auth信息',
  51000: '初始化内核出错',
  51001: 'feed音频给内核时出错',
  51002: '生成内核结果时出错',
  52000: '集群进程资源短缺',
  53000: '内核进程崩溃',
  55200: '内核跳转出错',
  55201: '内核跳转出错',
  55202: '内核跳转出错',
  70001: 'SDK版本需要升级',
  41015: '参数中有遗漏或不合法',
  41016: '参数中有遗漏或不合法',
  41017: '参数中有遗漏或不合法',
  41018: '参数中有遗漏或不合法',
  41019: '参数中有遗漏或不合法',
  41020: '参数中有遗漏或不合法',
  41021: '参数中有遗漏或不合法',
  41022: '参数中有遗漏或不合法',
  41023: '参数中有遗漏或不合法',
  41024: '参数中有遗漏或不合法',
  41025: '参数中有遗漏或不合法',
  42003: '客户端发送请求的顺序出错',
  60001: 'param参数有错，非JSON格式',
  60002: 'param参数有错，使用本地服务，无request参数',
  60003: 'param参数有错，使用云服务，无音频格式参数',
  60004: 'param参数有错，使用云服务，采样率设置错误',
  60005: 'param参数有错，使用云服务，声道数设置错误',
  60006: 'param参数有错，使用云服务，采样字节数设置错误',
  60007: 'param参数有错，使用本地服务，设置的coreType不存在',
  60008: 'param参数有错，使用本地服务，内核参数无效',
  60009: 'param参数有错，使用本地服务，保存音频参数设置错误',
  60010: '网络异常，使用云服务，设备未连接网络',
  60011: 'SDK接口调用序出错',
  60012: '没有本地调用的配置',
  60013: '没有云端调用的配置',
  60014: '使用云服务，服务响应超时',
  60015: '授权认证失败',
  5501: '内核跳转内部的参数不符合规则',
  10000: '音频数据为0',
  10001: '发音不完整',
  10002: '发音不完整',
  10003: '发音不完整',
  10004: '音量偏低，可能位置太远',
  10005: '音频截幅，可能位置太近',
  10006: '音频质量偏差',
  10007: '检测到语音非英文'
};

module.exports = {
  Chivox,
  chivoxErr,
  cv,
};
