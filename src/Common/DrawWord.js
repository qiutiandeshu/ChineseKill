/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes} from 'react';
import {
  StyleSheet,
  View,
  ART,
  PixelRatio,
  PanResponder,
  Alert,
} from 'react-native';

const {
  Shape,
  Group,
  Transform,
  Surface,
  Path,
  Pattern,
  LinearGradient,
  RadialGradient,
  // Text,
  ClippingRectangle,
} = ART;

import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
import Utils from '../Utils/Utils.js';
import Waiting from './Waiting.js';
import webData from '../Utils/GetWebData.js';

var mhUrl = 'http://192.169.1.19:8080/ChineseSkill/miaohongSrc/';
var mhPath = webData.CACHES + '/mhJson';

var backLineData = [
  {w: 2, t: 0, c: [1,1,1,-1,-1,-1,-1,1,1,1], p:[0, 0, 0, 100, 100, 100, 100, 0, 0, 0]},
  {w: 1, t: 0, c: [0, 0, 0, 0], p:[50, 0, 50, 100]},
  {w: 1, t: 0, c: [0, 0, 0, 0], p:[0, 50, 100, 50]},
  {w: 1, t: 1, c: [0, 0, 0, 0], p:[0, 0, 100, 100]},
  {w: 1, t: 1, c: [0, 0, 0, 0], p:[0, 100, 100, 0]}
];

export default class DrawWord extends Component {
  constructor(props){
    super(props);
    this.state = {
      blnUpdate: false
    };
    this.props.autoSpeed = Math.min(1, Math.max(5, this.props.autoSpeed));
    this.backLine = [];
    this._panResponder = {};
    this.touchLastPoint = null;
    this.unitDisSt = this.props.curWidth / 25;
    this.unitDisMv = this.props.curWidth / 15;
    this.wrongCount = 0;
    this.nowPos = 0;
    this.blnShowArrow = this.props.arrowShow;
    this.blnShowBack = true;
    this.delayPlay = this.props.autoDelay;
    this.arrLine = [];
    this.showArrow = [];
    this.tempDrawLine = null;
    this.blinkLine = null;
    this.blnDownload = false;
    this.isData = false;
    this.createBackLine();
    this.blnBlink = false;
    this.blinkIdx = -1;
    this.blinkFrame = 0;
  }
  static propTypes = {
    curWidth: PropTypes.number.isRequired, //宽高必须
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired, //数据，点阵数组数据 或者 一个带 path，name，uri的对象
    blnTouch: PropTypes.bool.isRequired, //是否可书写
    backColor: PropTypes.string, //背景颜色
    fillColor: PropTypes.string, //填充颜色，
    fillArray: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]), //如果存在则以这个为准，用于不同部件的颜色标识，如果是bool类型，则在内部随机颜色，否则以给定颜色为准
    writeOver: PropTypes.func, //写完回调函数
    autoSpeed: PropTypes.number, //自动书写速度
    autoDelay: PropTypes.number, //自动书写首次延迟设置
    arrowShow: PropTypes.bool, //是否显示箭头
    showAll: PropTypes.bool, //是否一开始都显示 
    firstPlay: PropTypes.bool, //是否初始化自动播放
    errorTip: PropTypes.number, //描红错误提示，书写错误几次就提示，0：表示不提示，默认不提示
  }
  static defaultProps = {
    autoSpeed: 3,
    backColor: '#DADADA',
    fillColor: '#000000',
    fillArray: null,
    blnTouch: true, //默认是可写的
    autoDelay: 30,
    arrowShow: true,
    showAll: false,
    firstPlay: false,
    errorTip: 0,
  }
  componentWillMount() {
    if (this.props.blnTouch){
      this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: this.onStartShouldSetPanResponder.bind(this),
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
        onPanResponderGrant: this.onPanResponderGrant.bind(this),
        onPanResponderMove: this.onPanResponderMove.bind(this),
        onPanResponderRelease: this.onPanResponderRelease.bind(this),
        onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
      });
    }
  }
  componentDidMount() {
    this.checkData();
  }
  componentWillUnmount() {
    this._blinkTime && clearTimeout(this._blinkTime);
    this._autoWrite && clearInterval(this._autoWrite);
    webData.Release();
  }
  componentDidUpdate(prevProps, prevState) {
    var str1 = JSON.stringify(prevProps);
    var str2 = JSON.stringify(this.props);
    if (str1 != str2){
      this.checkData();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    var str1 = JSON.stringify(nextProps);
    var str2 = JSON.stringify(this.props);
    if (str1 != str2 || nextState != this.state){
      return true;
    }
    return false;
  }
  checkData(){
    if (this.props.data == null || this.props.data == undefined){
      this.blnDownload = false;
    }else{
      if (Utils.isArray(this.props.data)){
        this.updateData(this.props.data);
      }else{
        this.downloadData();
      }
    }
  }
  setAlert(message){
    Alert.alert(
      '提示',
      message,
      [
        {text: 'OK', onPress: () => {
          this.blnDownload = false;
          this.setUpdate();
        }},
      ]
    );
  }
  downloadData(){
    if (!this.props.data.uri){
      console.log('传递的网址不正确');
      return;
    }
    if (!this.props.data.name){
      console.log('传递的名字不正确');
      return;
    }
    if (!this.props.data.path){
      console.log('传递的路径不正确');
      return;
    }
    this.resetBaseData();
    this.blnDownload = true;
    var name = this.props.data.name;
    var uniName = Utils.Utf8ToUnicode(name);
    uniName = uniName.replace('\\u', '') + '.json';
    console.log(this.props.data.path, uniName);
    // webData.Instance().deleteFile(this.props.data.path + '/' + uniName, null);
    var param={
      name: uniName,//文件名，带后缀
      path: this.props.data.path,//文件路径
      uri: this.props.data.uri+uniName,//下载地址，如果为空，则返回错误，文件不存在
      type: 'utf8',//打开方式，‘utf8’则返回文件数据，其他则返回文件路径
      over: false,//是否覆盖，默认是不覆盖，如果是true，则直接下载文件覆盖原有文件
    };
    webData.Instance().getWebFile(param, (result)=>{
      if (result.code == webData.CODE_ERROR){
        this.setAlert('错误：未找到文件或者服务器没有数据，' + result.error);
      }else if (result.code == webData.CODE_READFILE) {
        // console.log(result.data);
        var data = JSON.parse(result.data);
        this.blnDownload = false;
        this.updateData(data.character);
      }
    });
    this.setUpdate();
  }
  updateData(data){
    this.isData = true;
    this.InitWord(data);
    this.tempColor = [];
    this.tempColor.push(this.props.fillColor);
    if (this.props.fillArray != null){
      if (Utils.isArray(this.props.fillArray)){
        for(var i=0; i<this.data.length;i++){
          this.tempColor.push(this.props.fillArray[i % this.props.fillArray.length]);
        }
      }else{
        for(var i=0; i<this.data.length;i++){
          this.tempColor.push(`rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`);
        }
      }
    }
    if (this.props.showAll){
      this.setAllDraw();
    }else{
      this.drawIdx = 0;
      this.setBeginDraw();
    }
    if (this.props.firstPlay){
      this.setAutoWrite();
    }
  }
  setUpdate(){
    this.setState({
      blnUpdate: !this.blnUpdate,
    });
  }
  createBackLine(){
    for(var i=0;i<backLineData.length;i++){
      var line = new Path();
      for(var j=0;j<backLineData[i].p.length;){
        if (j==0) {
          line.moveTo(
            backLineData[i].p[j+0] * this.props.curWidth/100 + backLineData[i].c[j+0], 
            backLineData[i].p[j+1] * this.props.curWidth/100 + backLineData[i].c[j+1]
          );
        }else { 
          line.lineTo(
            backLineData[i].p[j+0] * this.props.curWidth/100 + backLineData[i].c[j+0], 
            backLineData[i].p[j+1] * this.props.curWidth/100 + backLineData[i].c[j+1]
          );
        }
        j+=2;
      }
      if (backLineData[i].t == 0){
        this.backLine.push(
          <Shape key={i} d={line} strokeWidth={backLineData[i].w/PixelRatio.get()} stroke={'#4C8D93'}/>
        );  
      }else{
        this.backLine.push(
          <Shape key={i} d={line} strokeWidth={backLineData[i].w/PixelRatio.get()} stroke={'#4C8D93'} strokeDash={[7,3]}/>
        );
      }
    }
  }
  resetBaseData(){
    this.drawIdx = -1;
    this.minDisStart = Number.MAX_VALUE;
    this.minDisEnd = Number.MAX_VALUE;
    this.startIdx = -1;
    this.endIdx = -1;
    this.max_Step = 0;
    this.now_Step = 0;
    this.tempDrawData = {};
    this.tempDrawLine = null;
    this.showPoints = [];
    this.showArrow = [];
    this.blinkLine = null;
    this.setUpdate();
  }
  InitWord(data){
    if (this.props.curWidth != 400){
      var scaleWidth = this.props.curWidth*0.9 / 400;//变成原来的0.8倍
      var offsetXY = this.props.curWidth*0.1 / 2;
      var jsonStr = JSON.stringify(data);
      data = JSON.parse(jsonStr);
      for(var i=0;i<data.length;i++){
        var points = data[i].points;
        for(var k=0;k<points.length;k++){
          points[k].x = points[k].x * scaleWidth + offsetXY;
          points[k].y = points[k].y * scaleWidth + offsetXY;
        }
      }
    }
    this.data = data;
    this.resetBaseData();
    this.loadWord();
  }
  loadWord(){
    this.drawIdx = -1;
    var character = this.data;
    console.log(character.length);
    this.arrLine = [];
    for(var i=0;i<character.length;i++){
      var points = character[i].points;
      for(var k=0;k<points.length;k++){
        if (points[k].pos == 1){
          this.startPoint = points[k];
        }else if (points[k].pos == 2){
          this.endPoint = points[k];
        }
      }
      this.minDisStart = Number.MAX_VALUE;
      this.minDisEnd = Number.MAX_VALUE;
      this.startIdx = -1;
      this.endIdx = -1;
      var smoothBSPArr = [];
      var loc1 = 2;
      var len = points.length;
      while(loc1 < len - 1){
        this.BSPLineSmooth(smoothBSPArr, points[loc1-2], points[loc1-1], points[loc1], points[loc1+1]);
        ++loc1;
      }
      if (len >= 4){
        this.BSPLineSmooth(smoothBSPArr, points[len-3], points[len-2], points[len-1], points[0]);
        this.BSPLineSmooth(smoothBSPArr, points[len-2], points[len-1], points[0], points[1]);
        this.BSPLineSmooth(smoothBSPArr, points[len-1], points[0], points[1], points[2]);
      }else{
        smoothBSPArr.push(points[1]);
        smoothBSPArr.push(points[2]);
      }
      smoothBSPArr[this.startIdx].pos = 1;
      smoothBSPArr[this.endIdx].pos = 2;
      character[i].bspArr = smoothBSPArr;
      character[i].color = this.props.backColor;

      var loc2 = -1;
      var loc3 = -1;
      var loc4 = smoothBSPArr;
      var upPoints = [];
      var downPoints = [];
      loc1 = 0;
      while (loc1 < loc4.length) {
        if (loc4[loc1].pos != 1) {
          if (loc4[loc1].pos == 2)
            loc3 = loc1;
        }
        else
          loc2 = loc1;
        ++loc1;
      }
      if (loc2 != -1 && loc3 != -1) {
        var loc5 = 0;
        loc1 = loc2;
        while (loc5 < loc4.length) {
          upPoints.push(loc4[loc1]);
          if (loc1 == loc3) {
            break;
          }
          if (loc1 == loc4.length - 1)
            loc1 = -1;
          ++loc1;
          ++loc5;
        }
        loc5 = 0;
        loc1 = loc3;
        while (loc5 < loc4.length) {
          downPoints.unshift(loc4[loc1]);
          if (loc1 == loc2) {
            break;
          }
          if (loc1 == loc4.length - 1)
            loc1 = -1;
          ++loc5;
          ++loc1;
        }
      }
      character[i].upPoints = upPoints;
      character[i].downPoints = downPoints;

      var m_step = Math.min(upPoints.length, downPoints.length);
      var dot_step = 0;
      var up_step = 0;
      var down_step = 0;
      dot_step++;
      var orgPoints = [];
      var x = (upPoints[0].x + downPoints[0].x) / 2;
      var y = (upPoints[0].y + downPoints[0].y) / 2;
      orgPoints.push({'x':x, 'y':y});
      while (dot_step < m_step) {
        up_step = parseInt(dot_step * upPoints.length / m_step);
        down_step = parseInt(dot_step * downPoints.length / m_step);
        if (dot_step % 10 == 0) {
          x = (upPoints[up_step].x + downPoints[down_step].x) / 2;
          y = (upPoints[up_step].y + downPoints[down_step].y) / 2;
          orgPoints.push({'x':x, 'y':y});
        }
        ++dot_step;
      }
      x = (upPoints[up_step - 1].x + downPoints[down_step - 1].x) / 2;
      y = (upPoints[up_step - 1].y + downPoints[down_step - 1].y) / 2;
      orgPoints.push({'x': x, 'y': y});
      character[i].orgPoints = orgPoints;
      character[i].dashPoints = Utils.ResampleByLen(orgPoints, 8);
      if (character[i].dashPoints.length>=4){
        var line = new Path();
        for(var k=1;k<character[i].dashPoints.length-1;k++){
          if (k == 1){
            line.moveTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
          }else{
            line.lineTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
          }
          if (k==character[i].dashPoints.length-2){
            var p1 = Utils.PRotP(character[i].dashPoints[k], character[i].dashPoints[k-1], 30);
            var p2 = Utils.PRotP(character[i].dashPoints[k], character[i].dashPoints[k-1], -30);
            line.lineTo(p1.x, p1.y);
            line.lineTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
            line.lineTo(p2.x, p2.y);
          }
        }
        this.showArrow.push(
          <Shape key={i} d={line} stroke={'red'} strokeWidth={1} />
        );
      }else{
        var line = new Path();
        for(var k=0;k<character[i].dashPoints.length;k++){
          if (k == 0){
            line.moveTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
          }else{
            line.lineTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
          }
          if (k==character[i].dashPoints.length-1){
            var p1 = Utils.PRotP(character[i].dashPoints[k], character[i].dashPoints[k-1], 30);
            var p2 = Utils.PRotP(character[i].dashPoints[k], character[i].dashPoints[k-1], -30);
            line.lineTo(p1.x, p1.y);
            line.lineTo(character[i].dashPoints[k].x, character[i].dashPoints[k].y);
            line.lineTo(p2.x, p2.y);
          }
        }
        this.showArrow.push(
          <Shape key={i} d={line} stroke={'red'} strokeWidth={1} />
        );
      }
      
      // for(var k=0;k<character[i].orgPoints.length;k++){
      //   this.showPoints.push(
      //     <View key={`${i}_${k}`} style={{
      //       position: 'absolute',
      //       left: character[i].dashPoints[k].x - 3,
      //       top: character[i].dashPoints[k].y - 3,
      //       width: 6,
      //       height: 6,
      //       borderRadius: 3,
      //       backgroundColor: 'blue'
      //     }}/>
      //   );
      // }

      var line = Path();
      for(var j=0;j<character[i].bspArr.length;j++){
        var point = character[i].bspArr[j];
        if (j==0){
          line.moveTo(point.x, point.y);
        }else{
          line.lineTo(point.x, point.y);
        }
      }
      character[i].line = line;

      this.arrLine.push(
        <Shape key={i} d={line} fill={character[i].color}/>
      );
    }
  }
  BSPLineSmooth(arg1, arg2, arg3, arg4, arg5)
  {
    var loc5 = {};
    var loc8 = 0;
    var loc1 = [];
    var loc2 = [];
    loc1.push((-arg2.x + 3 * arg3.x - 3 * arg4.x + arg5.x) / 6);
    loc1.push((3 * arg2.x - 6 * arg3.x + 3 * arg4.x) / 6);
    loc1.push((-3 * arg2.x + 3 * arg4.x) / 6);
    loc1.push((arg2.x + 4 * arg3.x + arg4.x) / 6);
    loc2.push((-arg2.y + 3 * arg3.y - 3 * arg4.y + arg5.y) / 6);
    loc2.push((3 * arg2.y - 6 * arg3.y + 3 * arg4.y) / 6);
    loc2.push((-3 * arg2.y + 3 * arg4.y) / 6);
    loc2.push((arg2.y + 4 * arg3.y + arg4.y) / 6);
    var loc3 = [];
    var loc4 = [];
    loc3.push(loc1[3]);
    loc4.push(loc2[3]);
    loc5 = {};
    loc5.x = loc1[3];
    loc5.y = loc2[3];
    loc5.pos = arg3.pos;
    loc5.org = arg3.org;
    arg1.push(loc5);
    var num = arg3.num;
    if (num && num>0){
      for(var i=0;i<num;i++){
        arg1.push(loc5);
      }
    }

    var dis = Utils.DisP(loc5, this.startPoint);
    if (dis < this.minDisStart) {
      this.minDisStart = dis;
      this.startIdx = arg1.length - 1;
    }
    dis = Utils.DisP(loc5, this.endPoint);
    if (dis < this.minDisEnd) {
      this.minDisEnd = dis;
      this.endIdx = arg1.length - 1;
    }

    var loc6 = parseInt(Utils.CountDistance(arg3, arg4));
    var loc7 = 1;
    while (loc7 < loc6) {
      loc8 = loc7 / loc6;
      loc3.push(loc1[3] + loc8 * (loc1[2] + loc8 * (loc1[1] + loc8 * loc1[0])));
      loc4.push(loc2[3] + loc8 * (loc2[2] + loc8 * (loc2[1] + loc8 * loc2[0])));
      loc5 = {};
      loc5.x = loc3[loc7];
      loc5.y = loc4[loc7];
      loc5.pos = 0;
      if (arg3.pos == 3){
        loc5.org = 2;
      }
      arg1.push(loc5);
      ++loc7;

      dis = Utils.DisP(loc5, this.startPoint);
      if (dis < this.minDisStart) {
        this.minDisStart = dis;
        this.startIdx = arg1.length - 1;
      }
      dis = Utils.DisP(loc5, this.endPoint);
      if (dis < this.minDisEnd) {
        this.minDisEnd = dis;
        this.endIdx = arg1.length - 1;
      }
    }
  }
  setBeginDraw(){
    if (this.blnDownload || !this.isData){
      return;
    }
    this.wrongCount = 0;
    var bh = this.data[this.drawIdx];
    this.max_Step = Math.min(bh.upPoints.length, bh.downPoints.length);
    this.now_Step = 0;
  }
  DrawingPecent(per){
    var bh = this.data[this.drawIdx];
    this.now_Step = per;
    var up_step = parseInt(per * bh.upPoints.length);
    var down_step = parseInt(per * bh.downPoints.length);
    up_step = Math.min(up_step, bh.upPoints.length-1);
    down_step = Math.min(down_step, bh.downPoints.length-1);
    this.tempDrawData.points = [];
    for(var i=0;i<up_step;i++){
      this.tempDrawData.points.push(bh.upPoints[i]);
    }
    for(var i=down_step;i>=0;i--){
      this.tempDrawData.points.push(bh.downPoints[i]);
    }
    var line = Path();
    for(var j=0;j<this.tempDrawData.points.length;j++){
      var point = this.tempDrawData.points[j];
      if (j==0){
        line.moveTo(point.x, point.y);
      }else{
        line.lineTo(point.x, point.y);
      }
    }
    var tColor = this.props.fillColor;
    if (this.props.fillArray != null){
      tColor = this.tempColor[bh.bushou % (this.tempColor.length-1) + 1];
    }
    this.tempDrawData.color = tColor;
    this.tempDrawLine = (
      <Shape d={line} fill={this.tempDrawData.color}/>
    );
    this.setUpdate();
  }
  setEndDraw(){
    if (this.blnDownload || !this.isData){
      return;
    }
    var character = this.data;
    this.arrLine[this.drawIdx] = (
      <Shape key={this.drawIdx} d={character[this.drawIdx].line} fill={this.tempDrawData.color}/>
    );
    this.setUpdate();
  }
  setRestart(){
    if (this.blnDownload || !this.isData){
      return;
    }
    var character = this.data;
    for(var i=0;i<character.length;i++){
      this.arrLine[i] = (
        <Shape key={i} d={character[i].line} fill={character[i].color}/>
      );
    }
    this.tempDrawLine = null;
    this.drawIdx = 0;
    this.nowPos = 0;
    this.setBeginDraw();
    
    if (this.blnBlink){
      this.stopBlink();
    }else{
      this.setUpdate();
    }
  }
  stopBlink(){
    if (this.blnDownload || !this.isData){
      return;
    }
    this.blnBlink = false;
    var character = this.data;
    var color = character[this.blinkIdx].color;
    this.blinkLine = null;
    this._blinkTime && clearTimeout(this._blinkTime);
    this.setUpdate();
  }
  setStrokeBlink(){
    if (this.blnDownload || !this.isData){
      return;
    }
    if (!this.blnBlink){
      this.blnBlink = true;
      this.blinkIdx = this.drawIdx;
      this.blinkFrame = 0;
      this.blinkUpdate();
    }
  }
  blinkUpdate(){
    if (this.blnBlink){
      this.blinkFrame++;
      var character = this.data;
      var color =  this.blinkFrame % 2 == 0 ? 'rgb(155,0,0)' : 'rgb(255,0,0)';
      this.blinkLine = (
        <Shape d={character[this.blinkIdx].line} fill={color}/>
      );
      this.setUpdate();
    
      if (this.blinkFrame <= 6){
        this._blinkTime = setTimeout(this.blinkUpdate.bind(this), 100);
      }else{
        this.stopBlink();
      }
    }
  }
  setAutoWrite(){
    if (this.blnDownload || !this.isData){
      return;
    }
    this.tempDrawLine = null;
    this.setRestart();
    this.stopAutoWrite();
    this._autoWrite = setInterval(this.autoWrite.bind(this), 1000/60);
    this.blnAutoWrite = true;
  }
  stopAutoWrite(){
    if (this.blnDownload || !this.isData){
      return;
    }
    this.blnAutoWrite = false;
    this._autoWrite && clearInterval(this._autoWrite);
    this._autoWrite = null;
    this.nowPos = 0;
    this.drawIdx = 0;
    this.setBeginDraw();
  }
  autoWrite(){
    if (this.delayPlay >0){
      this.delayPlay--;
      // console.log(this.delayPlay);
      return;
    }
    if (this.drawIdx >= 0 && this.delayPlay == 0){
      var points = this.data[this.drawIdx].orgPoints;
      if (this.nowPos >= points.length + 5 + this.props.autoSpeed){
        if (this.drawIdx < this.data.length){
          this.setEndDraw();
          this.drawIdx++;
          this.nowPos = 0;
          if (this.drawIdx == this.data.length){
            if (this.props.writeOver){
              this.props.writeOver();
            }
            this.blnAutoWrite = false;
            this._autoWrite && clearInterval(this._autoWrite);
            this._autoWrite = null;
            this.setUpdate();
          }else{
            this.setBeginDraw();
          }
        }
      }else {
        this.nowPos += 0.2 * this.props.autoSpeed;
        this.DrawingPecent(this.nowPos / points.length);
      }
    }
  }
  setHandWrite(){
    this.setRestart();
  }
  setAllDraw(){
    var character = this.data;
    for(var i=0;i<character.length;i++){
      var tColor = this.props.fillColor;
      if (this.props.fillArray != null){
        tColor = this.tempColor[character[i].bushou % (this.tempColor.length-1) + 1];
      }
      this.arrLine[i] = (
        <Shape key={i} d={character[i].line} fill={tColor}/>
      );
    }
    this.drawIdx = character.length;
    this.setUpdate();
  }
  onStartShouldSetPanResponder(e, g){
    if (this.blnDownload || !this.isData || this.drawIdx >= this.data.length || this.blnAutoWrite){
      return false;
    }
    return this.props.blnTouch;
  }
  onMoveShouldSetPanResponder(e, g){
    if (this.blnDownload || !this.isData || this.drawIdx >= this.data.length || this.blnAutoWrite){
      return false;
    }
    return this.props.blnTouch;
  }
  onPanResponderGrant(e, g){
    if (g.numberActiveTouches == 1){
      var tp = {
        x: e.nativeEvent.locationX,
        y: e.nativeEvent.locationY
      };
      this.touchLastPoint = tp;
      var idx = this.drawIdx;
      if (idx >= 0){
        var points = this.data[idx].orgPoints;
        var dis = Utils.DisP(tp, this.data[idx].orgPoints[Math.min(this.nowPos, points.length-1)]);
        if (dis < this.unitDisSt){
          this.nowPos++;
          this.DrawingPecent(this.nowPos / points.length);
        }
      }
    }
  }
  onPanResponderMove(e, g){
    if (g.numberActiveTouches == 1){
      var tp = {
        x: e.nativeEvent.locationX,
        y: e.nativeEvent.locationY
      };
      var idx = this.drawIdx; 
      if (idx >= 0){
        var points = this.data[idx].orgPoints;
        if (this.nowPos - 1 < points.length){
          var tempD = Utils.DisP(tp, this.touchLastPoint);
          if (tempD >= 1){
            var count = Math.max(1, parseInt(tempD / 4));
            var oldPos = this.nowPos;
            for(var i=0;i<count;i++){
              var sp = Utils.LerpP(this.touchLastPoint, tp, (i+1) / count);
              if (i==tempD-1){
                sp = tp;
              }
              var dis = Utils.DisP(tp, points[Math.min(this.nowPos, points.length-1)]);
              if (dis < this.unitDisMv){
                this.nowPos++;
              }
            }
            if (this.nowPos != oldPos){
              this.DrawingPecent(this.nowPos / points.length);
            }
          }
          this.touchLastPoint = tp;
        }
      }
    }
  }
  onPanResponderRelease(e, g){
    this.endPanResponder(e, g);
  }
  onPanResponderTerminate(e, g){
    this.endPanResponder(e, g);
  }
  endPanResponder(e, g){
    var idx = this.drawIdx; 
    if (idx >= 0){
      var points = this.data[idx].orgPoints;
      if (this.nowPos >= points.length){
        if (this.drawIdx < this.data.length - 1){
          console.log('学习下一笔');
          this.setEndDraw();
          this.drawIdx++;
          this.nowPos = 0;
          this.wrongCount = 0;
          this.setBeginDraw();
        }else{
          if (this.props.writeOver){
            this.props.writeOver();
          }
          this.drawIdx++;
          this.setUpdate();
          console.log('书写完毕!');
        }
      }else if (this.props.errorTip > 0){ //设置描红错误提示
        this.wrongCount ++;
        if (this.wrongCount == this.props.errorTip){
          this.setStrokeBlink();
          this.wrongCount = 0;
        }
      }
    }
  }
  setArrowShow(bln){
    this.blnShowArrow = bln;
    this.setUpdate(); 
  }
  setBackShow(bln){
    this.blnShowBack = bln;
    this.setUpdate();
  }
  render() {
    // console.log('render DrawWord '+this.props.data.name);
    var arrayArrow = null;
    if (this.blnShowArrow && this.showArrow){
      for(var i=0;i<this.showArrow.length;i++){
        if (i == this.drawIdx){
          arrayArrow = this.showArrow[i];
          break;
        }
      }
    }
    var arrayLine = [];
    if (this.blnShowBack){
      arrayLine = this.arrLine;
    }else{
      for(var i=0;i<this.arrLine.length;i++){
        if (i < this.drawIdx){
          arrayLine.push(this.arrLine[i]);
        }
      }
    }
    return (
      <View style={[styles.container, this.props.style? this.props.style : {}]} {...this._panResponder.panHandlers}>
        <Surface ref={'lineView'} width={this.props.curWidth} height={this.props.curWidth}>
          {this.backLine}
          {arrayLine}
          {this.blinkLine}
          {this.tempDrawLine}
          {arrayArrow}
        </Surface>
        {this.showPoints}
        <Waiting style={{width: this.props.curWidth, height: this.props.curWidth, backgroundColor: 'rgba(0,0,0,0)'}} 
          text=''
          textStyle={{fontSize: MinUnit * 3, color:'white'}}
          show={this.blnDownload}
          icon={{
            type: Waiting.SYSTEM,
            style: {transform:[{scale: 2}]},
            anim: true,
            param: {
              color: 'red',
              size: 'large',
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
  },
});
