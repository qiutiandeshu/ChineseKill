/**
 * Sample React Native S_PinyinChart
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import {
  StyleSheet, 
  View,
  Text, 
  PanResponder,
  findNodeHandle,
  Image,
  Alert,
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize ,SyllableData} from '../AppStyles';
var itemHeight = MinUnit * 7;//top的高度
import Utils from '../Utils/Utils.js';
import* as Progress from 'react-native-progress';
import webData from '../Utils/GetWebData.js';

let py_sm = [
  ['-'],
  ['b','p','m','f'],
  ['d','t','n','l'],
  ['g','k','h'],
  ['j','q','x'],
  ['zh','ch','sh','r'],
  ['z','c','s']
];
let py_ym = [
  ['a','ai','an','ang','ao'],
  ['i','ia','ian','iang','iao','ie','iong','iou','in','ing'],
  ['u','ua','uai','uan','uang','uei','uen','ueng','uo'],
  ['e','ei','en','eng','er'],
  ['o','ou','ong'],
  ['ü','üe'],
  ['üan'],
  ['ün'],
];

let iw = parseInt(MinUnit*6);//单个格子宽度
let ih = parseInt(MinUnit*6);//单个格子高度
let fw = parseInt(MinUnit*4);//第一个格子的宽高
let pd = 2;//格子之间的间隙
let bodyp = {//整个body的位置和宽高
  marginLeft: MinUnit*3,
  marginTop: 9,
  width: ScreenWidth - MinUnit*6,
  height: ScreenHeight - itemHeight - MinUnit*3, 
};
let smp = {//声母条的位置和宽高
  left: 0,
  top: fw+pd,
  width: fw,
  height: bodyp.height - fw - pd
};
let ymp = {//韵母条的位置和宽高
  left: fw+pd, 
  top: 0, 
  width: bodyp.width - fw - pd,
  height: fw
};
let pyp = {//中间拼音的位置和宽高
  left: fw+pd, 
  top: fw+pd, 
  width: bodyp.width - fw - pd,
  height: bodyp.height - fw - pd
};

var pyUrl = 'http://192.169.1.19:8080/ChineseSkill/audio/';
var pyPath = webData.CACHES + '/pyAudio';

export default class S_PinyinChart extends Component {
  constructor(props) {
    super(props);
    this._panResponder = {};
    this.state = {
      blnUpdate: false,
    };
    this.chartData = SyllableData;
    this.moveOffset = { x: 0, y: 0};
    this._deltaMove = null;
    this.deltaSpeed = { x: 0, y: 0};
    this.blnLoading = true;
    this.showData = [];
    this.blnDialog = false;
    this.blnRecord = false;
    this.volume = 0;
    this.selectGrid = null;
    this.dialogWaiting = false;
  }
  static propTypes = {
  }
  static defaultProps = {
  }
  setUpdate(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  componentWillMount() { 
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
    });
  }
  componentDidMount() {
    this.initChart();
    this._deltaUpdate = setTimeout(this.deltaUpdate.bind(this), 500); 
  }
  componentWillUnmount() {
    this.clearDeltaMove();
    this._deltaUpdate && clearTimeout(this._deltaUpdate);
  }
  deltaUpdate(){
    if (this.blnLoading){
      this.blnLoading = false;
      this.setUpdate();
    }
  }
  initChart(){
    this.renderData = [];
    this.renderSM = [];
    this.renderYM = [];
    this.showData = [];
    this.renderOrg = null;
    var top = 0;
    var left = 0;
    this.renderOrg = (
      <View style={styles.orgGrid}/>
    );
    for(var j=0;j<py_ym.length;j++){
      var w = iw * py_ym[j].length + (py_ym[j].length - 1)*pd;
      top = 0;
      for(var i=0;i<py_sm.length;i++){
        var h = ih * py_sm[i].length + (py_sm[i].length - 1)*pd;
        var color = (i+j)%2 == 0 ? '#CBE2E3' : '#F4F4F4';
        if (j == 0){
          this.renderSM.push(
            <View key={i} style={{
              position: 'absolute',
              top: top,
              left: 0,
              width: fw,
              height: h,
              overflow: 'hidden',
            }}>
              {this.initSMChildren(py_sm[i], fw, ih, pd, (i)%2 == 0 ? '#A3D9DB' : '#85CFD0')}
            </View>
          );
        }
        if (i == 0){
          this.renderYM.push(
            <View key={j} style={{
              position: 'absolute',
              top: 0,
              left: left,
              width: w,
              height: fw,
              overflow: 'hidden',
            }} >
              {this.initYMChildren(py_ym[j], iw, fw, pd, (j)%2 == 0 ? '#A3D9DB' : '#85CFD0')}
            </View>
          );
        }
        var tempShow = {
          py_sm_i: i,
          py_ym_j: j,
          top: top,
          left: left,
          width: w,
          height: h,
          child: [], 
        };
        this.renderData.push(
          <View key={`${i}_${j}`} style={{
            position: 'absolute',
            top: top,
            left: left,
            width: w,
            height: h, 
            overflow: 'hidden',
          }}>
            {this.initChildren(py_sm[i], py_ym[j], iw, ih, pd, color, tempShow)}
          </View>
        );
        top += (h+pd);
        this.showData.push(tempShow);
      }
      left += (w+pd);
    }
    this.maxWidth = left - pd;
    this.maxHeight = top - pd;
  }
  initChildren(smArr, ymArr, width, height, pd, color, tempShow){
    var childShow = [];
    var arr = [];
    var top = 0;
    var left = 0;
    for(var j=0;j<ymArr.length; j++){
      top = 0;
      for(var i=0;i<smArr.length;i++){
        var data = this.getPYString(smArr[i], ymArr[j]);
        var child = null;
        childShow.push({
          sm_i: i,
          ym_j: j,
          data: data,//包含charyData的index 和 当前的拼音
          top: top,
          left: left,
          width: width,
          height: height,
        });
        if (data != null){
          child = (
            <Text style={{fontSize: width/4, textAlign: 'center', color: '#222'}}>
              {data.py}
            </Text>
          );
        }
        arr.push(
          <View key={`${i}_${j}`} style={[styles.pyChildren, { top: top, left: left, width: width, height: height, backgroundColor: color}]}>
            {child}
          </View>
        );
        top += (height + pd);
      }
      left += (width + pd);
    }
    tempShow.child = childShow;
    return arr;
  }
  initSMChildren(smArr, width, height, pd, color){
    var arr = [];
    var top = 0;
    for(var i=0;i<smArr.length;i++){
      arr.push(
        <View key={i} style={[styles.smChildren, {top: top, width: width, height: height, backgroundColor: color}]}>
          <Text style={{fontSize: height/4, textAlign: 'center', color: '#222'}}>
            {smArr[i]}
          </Text>
        </View>
      );
      top += (height + pd);
    }
    return arr;
  }
  initYMChildren(ymArr, width, height, pd, color){
    var arr = [];
    var left = 0;
    for(var i=0;i<ymArr.length;i++){
      arr.push(
        <View key={i} style={[styles.ymChildren, {left: left, width: width, height: height, backgroundColor: color}]}>
          <Text style={{fontSize: width/4, textAlign: 'center', color: '#222'}}>
            {ymArr[i]}
          </Text>
        </View>
      );
      left += (width + pd);
    }
    return arr;
  }
  getPYString(sm, ym){
    if (sm == '-'){
      var tmp = ym;
      if (ym[0] == 'i'){
        if (ym == 'i' || ym == 'in' || ym == 'ing') {
          tmp = 'y' + ym;
        }else{
          tmp = ym.replace('i','y');
        }
      }else if (ym[0] == 'u'){
        if (ym == 'u'){
          tmp = 'w' + ym;
        }else{
          tmp = ym.replace('u', 'w');
        }
      }else if (ym[0] == 'ü'){
        tmp = ym.replace('ü', 'yu');
      }
      var i = this.getPYData(tmp);
      if (i == null) return null;
      else {
        return {
          idx: i,
          py: this.chartData[i].py,
          isDown: false,
        };
      }
    }else {
      var i = this.getPYData(sm+ym);
      if (i == null) return null;
      else {
        return {
          idx: i,
          py: this.chartData[i].py,
          isDown: false,
        };
      }
    }
  }
  getPYData(py, tone){
    for(var i=0;i<this.chartData.length;i++){
      if (this.chartData[i].type == '正常字音'){
        if (py == this.chartData[i].py){
          if (tone){
            if (tone == this.chartData[i].sd) return i;
          }else{
            return i;
          }
        }
      }
    }
    return null;
  }
  onStartShouldSetPanResponder(e, g){
    if (e.nativeEvent.target == findNodeHandle(this.touchView)){
      return true; 
    }
    return false;
  }
  onMoveShouldSetPanResponder(e, g){
    if (e.nativeEvent.target == findNodeHandle(this.touchView)){
      return true;
    }
    return false;
  }
  onPanResponderGrant(e, g){
    if (g.numberActiveTouches == 1){
      var tp = {
        x: e.nativeEvent.locationX,
        y: e.nativeEvent.locationY
      };
      this.lastPosition = tp;
      this.deltaSpeed.x = 0;
      this.deltaSpeed.y = 0;
      this.clearDeltaMove();
      this.blnInTouch = true;
    }
    this.toucTime = new Date();
  }
  onPanResponderMove(e, g){
    if (this.blnInTouch){
      if (g.numberActiveTouches == 1){
        var tp = {
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY
        };
        var delta = Utils.PSubP(tp, this.lastPosition);
        this.moveOffset.x = this.moveOffset.x + delta.x;
        this.moveOffset.y = this.moveOffset.y + delta.y;
        this.moveNativeProps();
        this.lastPosition = tp;
        this.deltaSpeed = delta;
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
    var pressTime = (new Date()).getTime() - this.toucTime.getTime();
    if (pressTime < 100 || (this.deltaSpeed.x == 0 && this.deltaSpeed.y == 0)){
      if (this.checkMove()){
        // console.log('still move');
        this._deltaMove = setInterval(this.deltaMove.bind(this), 1/60);
      }else{
        this.clickGrid({
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY
        });
      }
    }else{
      if (this.blnInTouch){
        // this.deltaSpeed = Utils.PMulV(this.deltaSpeed, 2);
        // console.log('deltaSpeed', this.deltaSpeed);
        this._deltaMove = setInterval(this.deltaMove.bind(this), 1/60);
      }
    }
    this.blnInTouch = false;
  }
  clickGrid(pos){
    // console.log('clicked x:' + pos.x + ', y:' + pos.y);
    var tx = pos.x - this.moveOffset.x;
    var ty = pos.y - this.moveOffset.y;
    var sel = this.findGrid(tx, ty);
    if (sel != -1){
      this.selectGrid = this.showData[sel];
      if (this.selectGrid.select != -1 && this.selectGrid.child[this.selectGrid.select].data){
        this.onOpenDialog();
      }
    }
  }
  findGrid(x, y){
    for(var i=0;i<this.showData.length;i++){
      var d = this.showData[i];
      d.select = -1;
      if (x >= d.left && x <= d.left + d.width && y >= d.top && y <= d.top + d.height){
        x = x - d.left;
        y = y - d.top;
        for(var j=0;j<d.child.length;j++){
          var c = d.child[j];
          if (x >= c.left && x <= c.left + c.width && y >= c.top && y <= c.top + c.height){
            this.showData[i].select = j;
            break;
          }
        }
        return i;
      }
    }
    return -1;
  }
  moveNativeProps(){
    if (this.refPY){
      this.refPY.setNativeProps({
        style: {
          left: this.moveOffset.x,
          top: this.moveOffset.y
        }
      });
    }
    if (this.refSM){
      this.refSM.setNativeProps({
        style: {
          top: this.moveOffset.y,
        }
      });
    }
    if (this.refYM){
      this.refYM.setNativeProps({
        style:{
          left: this.moveOffset.x,
        }
      });
    }
  }
  clearDeltaMove(){
    this._deltaMove && clearInterval(this._deltaMove);
    this._deltaMove = null;
  }
  deltaMove(){
    if (Math.abs(this.deltaSpeed.x * 10) < 1 && Math.abs(this.deltaSpeed.y * 10) < 1){
      if (!this.checkMove()){
        // console.log('stop move');
        this.clearDeltaMove();
      }else{
        this.checkDeltaMove();
        this.moveNativeProps();
      }
    }else{
      this.moveOffset.x = this.moveOffset.x + this.deltaSpeed.x;
      this.moveOffset.y = this.moveOffset.y + this.deltaSpeed.y;
      this.deltaSpeed.x *= 0.9;
      this.deltaSpeed.y *= 0.9;
      this.checkDeltaMove();
      this.moveNativeProps();
    }
  }
  checkDeltaMove(){
    var s = 0.3;
    if (this.moveOffset.x > 0){
      if (!this.blnInTouch){
        this.moveOffset.x = Utils.Lerp(this.moveOffset.x, 0, s);
        if (Math.abs(this.moveOffset.x) < 1){
          this.moveOffset.x = 0;
        }
      }
    }else if (this.moveOffset.x < pyp.width - this.maxWidth){
      if (!this.blnInTouch){
        this.moveOffset.x = Utils.Lerp(this.moveOffset.x, pyp.width - this.maxWidth, s);
        if (Math.abs(this.moveOffset.x - pyp.width + this.maxWidth) < 1){
          this.moveOffset.x = pyp.width - this.maxWidth;
        }
      }
    }
    if (this.moveOffset.y > 0){
      if (!this.blnInTouch){
        this.moveOffset.y = Utils.Lerp(this.moveOffset.y, 0, s);
        if (Math.abs(this.moveOffset.y) < 1){
          this.moveOffset.y = 0
        }
      }
    }else if (this.moveOffset.y < pyp.height - this.maxHeight){
      if (!this.blnInTouch){
        this.moveOffset.y = Utils.Lerp(this.moveOffset.y, pyp.height - this.maxHeight, s);
        if (Math.abs(this.moveOffset.y - pyp.height + this.maxHeight) < 1){
          this.moveOffset.y = pyp.height - this.maxHeight;
        }
      }
    }
  }
  checkMove(){
    var s = 0;
    if (this.moveOffset.x > s || this.moveOffset.x < pyp.width - this.maxWidth - s || this.moveOffset.y > s || this.moveOffset.y < pyp.height - this.maxHeight - s){
      return true;
    }
    return false;
  }
  render() {
    return (
      <View name={'S_PinyinChart'} style={styles.container}>
        {this.renderTop()}
        {this.rendeLoading()}
      </View>
    );
  }
  rendeLoading(){
    if (this.blnLoading){
      return (
        <View style={{position: 'absolute', left: 0, top: 0, width: ScreenWidth, height: ScreenHeight, opacity: 0.5, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center'}} >
          <Text style={{fontSize: MinUnit*10, color: '#FFF', textAlign: 'center'}}>
            Loading...
          </Text>
        </View>
      );
    }else{
      return [
        this.renderBody(), this.renderDialog()
      ];
    }
  }
  onOpenDialog(){
    var data = this.selectGrid.child[this.selectGrid.select].data;
    // console.log(data);
    if (data.arrTone == null || data.arrTone == undefined){
      data.arrTone = [];
      for(var i=0;i<5;i++){//得到五个音调的音频
        var idx = this.getPYData(data.py, '' + i);
        if (idx != null){
          data.arrTone.push({
            tone: i,
            pyIdx: idx,
            name: data.py + i + '.mp3',
            pcResult: null,
            volume: 0,
          });
        }
      }
      // console.log(data.arrTone);
    }
    for(var i=0;i<data.arrTone.length;i++){
      data.arrTone[i].pcResult = null;
      data.arrTone[i].volume = 0;
    }
    this.blnDialog = true;
    if (!data.isDown){
      this.dialogWaiting = true;
      this.checkPinyinAudio(pyPath, pyUrl, 0);
    }
    this.setUpdate();
  }
  onCloseDialog(){
    this.blnDialog = false;
    app.onCancelChivox();
    app.onStopRecord();
    this.setUpdate();
  }
  checkPinyinAudio(path, uri, index){
    var data = this.selectGrid.child[this.selectGrid.select].data;
    if (index < data.arrTone.length){
      webData.Instance().getWebFile(data.arrTone[index].name, path, uri+data.arrTone[index].name, 'none', (result)=>{
        if (result.error){
          Alert.alert(
            '提示',
            '错误：' + result.error,
            [
              {text: 'OK', onPress: () => {this.onCloseDialog()}},
            ]
          );
        }else{
          this.checkPinyinAudio(path, uri, ++index);
        }
      });
    }else{
      data.isDown = true;
      this.dialogWaiting = false;
      this.setUpdate();
    }
  }
  renderDialog(){
    if (this.blnDialog){
      var w = MinUnit*66;
      var h = MinUnit*36;
      return (
        <View key={'dialog'} style={{position: 'absolute', left: 0, top: 0, width: ScreenWidth, height: ScreenHeight, justifyContent: 'center', alignItems: 'center'}} >
          <PanButton name='btnPinyinChartCloseDialog' 
            onPress={this.onCloseDialog.bind(this)} 
            btnType={'none'}>
            <View style={{position: 'absolute', left: 0, top: 0, width: ScreenWidth, height: ScreenHeight, opacity: 0.5, backgroundColor: '#111'}} />
          </PanButton>
          <View style={{
            width: w, 
            height: h,
            borderRadius: MinUnit,
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: '#FCFCFC',
            flexDirection: 'row',
          }}>
            {this.renderDialogItem(w, h)}
          </View>
        </View>
      );
    }else {
      return null;
    }
  }
  readPinyin(index){

  }
  onPressChivox(index){
    if (this.blnRecord) {
      this.stopRecord();
      return;
    }
    var tempData = this.selectGrid.child[this.selectGrid.select].data;
    var tone = tempData.arrTone[index];
    let param = {
      gategory: 'word',
      text: tempData.py + tone.tone,
      audioName: tempData.py + tone.tone,
    };
    app.onStartChivox(param, (data)=>{
      switch (data.type) {
        case 'volume':
          console.log("获得音量回调:",data.volume);
          if (this.blnRecord == false) {
            this.blnRecord = true;
          }
          tone.volume = data.volume;
          tone.pcResult = null;
          this.setUpdate();
          break;
        case 'result':
          console.log("得到评测结果:", data.result)
          var result = data.result.details;
          tone.volume = 0;
          result.forEach((_data)=>{
            let toneStr = ["轻声","一声","二声","三声","四声"]
            var str = '声母：' + _data.phoneScores.sm;
            str += '\n韵母：' + _data.phoneScores.ym;
            if(_data.originalTone != _data.recordTone){
              str += "\n声调读的不准 (将"+toneStr[_data.originalTone]+"读成"+toneStr[_data.recordTone]+")"
            } else {
              str += '\n声调：100';
            }
            tone.pcResult = str;
          });
          // this.initPlayRecord();
          this.stopRecord();
          break;
        case 'error':
          // console.log("评测出错:", data.error)
          tone.volume = 0;
          this.stopRecord();
          break;
        case 'working':
          // console.log("工作ing:", data.working)
          break;
      }
    });
  }
  stopRecord() {
    if (this.blnRecord){
      app.onStopRecord();
      app.onStopChivox();
      this.blnRecord = false;
    }
    this.volume = 0;
    this.setUpdate();
  }
  onPressPlay(index){
    app.initPlayRecord('flash',(data)=>{
      this.blnFlashVoice = false;
      switch (data.type) {
        case 'audioTime':
            // console.log("获取到录音时长:", data.audioTime)
            app.onPlayRecord();
            break;
        case 'working':
            break;
      }
    });
  }
  renderDialogItem(w, h){
    if (this.dialogWaiting){
      return (
        <Waiting
          show={this.dialogWaiting}
          style={{width: w, height: h}} 
          text={'Loading'} 
          textStyle={{fontSize: MinUnit*5, color: '#6699CC', textAlign: 'center'}}
        />
      );
    }else{
      var data = this.selectGrid.child[this.selectGrid.select].data;
      var arr = [];//`声母:读的很好\n韵母:读的不好\n声调:读的一般`
      for(var i=0;i<data.arrTone.length;i++){
        var pyStr = this.chartData[data.arrTone[i].pyIdx].pyd;//`${data.py}${data.arrTone[i].tone}`
        arr.push(
          <View key={i} style={{
            width: MinUnit*12, 
            height: ScreenHeight/2 - MinUnit*2, 
            // backgroundColor:'#ccc',
            alignItems: 'center'
          }}>
            <PanButton name={'btnPCRead'+i} onPress={this.readPinyin.bind(this, i)} style={{justifyContent:'center', alignItems: 'center', height: MinUnit*8, width: MinUnit*8, marginTop: MinUnit*2}}>
              <Text style={{fontSize: MinUnit*2.2, textAlign: 'center', color: '#333'}}>
                {pyStr}
              </Text>
            </PanButton>
            <Text style={{fontSize: MinUnit*1.5, textAlign: 'center', color: '#AAA', height: MinUnit*8 , marginTop: MinUnit}}>
              {data.arrTone[i].pcResult ? data.arrTone[i].pcResult : ''}
            </Text>
            <CircleIcon
              name='btnPCChivox'
              onPress={this.onPressChivox.bind(this, i)}
              style={[styles.btnBackView, {borderColor: '#8BCBED', marginTop: MinUnit*2}]}
              iconName={'microphone'}
              iconSize={4} 
              iconStyle={{color: '#8BCBED'}}>
              {
                <Progress.Circle 
                  thickness={MinUnit*0.3} 
                  borderWidth={0} 
                  style={{position:'absolute',left:0,top:0}}
                  progress={Number(data.arrTone[i].volume)} 
                  size={MinUnit*5.4} 
                  color="#1BA2FF"
                />
              }
            </CircleIcon>
            <CircleIcon
              name='btnPCPlay'
              onPress={this.onPressPlay.bind(this, i)}
              style={[styles.btnBackView, {borderColor: '#8BCBED', marginTop: MinUnit}]}
              iconName={'volume-up'}
              iconSize={4} 
              iconStyle={{color: '#8BCBED'}} />
          </View>
        );
      }
      return arr;
    }
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  renderTop(){
    return (
      <PanView name='PinyinChartTopView' style={[styles.topViewBack, {}]}>
        <PanButton name="btnPinyinChartBack" onPress={this.onBackScene.bind(this)}>
          <Icon name="remove" size={MinUnit*3} style={{color: 'white'}}/>
        </PanButton>
        <Text style={{fontSize: MinUnit*2.5, textAlign: 'center', color: 'white'}}>
          拼音表
        </Text>
        <View style={{width: MinUnit*3}} />
      </PanView>
    );
  }
  renderBody(){
    return (
      <PanView name='PingyinChartBodyView' key={'body'} style={styles.bodyViewBack} removeClippedSubviews={true}>
        {this.renderOrg}
        <View style={styles.bodySMGrid}>
          <View ref={(r)=>{this.refSM = r}} style={styles.bodyGridView}>
            {this.renderSM}
          </View>
        </View>
        <View style={styles.bodyYMGrid}>
          <View ref={(r)=>{this.refYM = r}} style={styles.bodyGridView}>
            {this.renderYM}
          </View>
        </View>
        <View style={styles.bodyPYGrid} {...this._panResponder.panHandlers} 
          ref={(r)=>{this.touchView = r}} pointerEvents={'box-only'}>
          <View ref={(r)=>{this.refPY = r}} style={styles.bodyGridView}>
            {this.renderData}
          </View>
        </View>
      </PanView> 
    )
  }
}
class Waiting extends Component{
  static ICON = 0;
  static IMAGE = 1;
  constructor(props) {
    super(props);
    this.defaultStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: ScreenWidth,
      height: ScreenHeight,
      backgroundColor: '#333',
      opacity: 0.5,
      justifyContent: 'center',
      alignItems: 'center'
    };
  }
  static propTypes = {
    show: PropTypes.bool.isRequired,//显示
    text: PropTypes.string,//显示内容
    textStyle: PropTypes.object,//显示内容的样式
    icon: PropTypes.object,//显示
    // icon: {
    //   type: Waiting.ICON,//ICON：表示使用Icon，IMAGE：表示使用Image组件
    //   name: null,//ICON：表示名字，IMAGE：表示Image组件是source
    //   size: MinUnit*2,//组件大小
    //   style: {...}//样式
    //   param: {}//其他参数，主要是Image使用的参数
    // }
  }
  static defaultProps = {
    show: true,
    text: '',
    textStyle: {
      fontSize: MinUnit*3, 
      color: '#000', 
      textAlign: 'center'
    },
    icon: null,
  }
  render(){
    if (this.props.show){
      var icon = this.props.icon
      var child = null;
      if (icon){
        if (icon.type == Waiting.ICON){
          child = (
            <Icon 
              name={icon.name} 
              size={icon.size} 
              style={icon.style}
            />
          );
        }else if (icon.type == Waiting.IMAGE){
          child = (
            <Image
              source={icon.name}
              resizeMode={icon.param.resizeMode} 
              style={icon.style}
            />
          );
        }
      }
      return (
        <View style={[this.defaultStyle, this.props.style]}>
          {
            this.props.text && this.props.text != '' ?
            <Text style={this.props.textStyle} >
              {this.props.text}
            </Text> :
            null 
          }
          {child}
          {this.props.children}
        </View>
      );
    }else{
      return <View style={[this.defaultStyle, {opacity:0}]}/>
    }
  }
}
class CircleIcon extends Component {
  constructor(props) {
    super(props);
     this.state={
      blnUpdate: false,
    };
    this.iconIdx = 0;
    var w = (this.props.iconSize + 1.4) * MinUnit;
    this.selfStyle={
      width: w, 
      height: w, 
      borderRadius: w / 2, 
      borderWidth: MinWidth, 
      borderColor: '#CDCFA7', 
      alignItems: 'center', 
      justifyContent: 'center'
    };
    this.selectStyle = [
      {backgroundColor: this.props.style.backgroundColor},
      {color: this.props.iconStyle.color},
      {backgroundColor: this.props.iconStyle.color},
      {color: '#FFFFFF'},
    ];
  }
  static propTypes = {
    name: PropTypes.string.isRequired, //PanView 或者 PanButton的名字
    iconName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired, //icon的名字
    iconSize: PropTypes.number, //icon的大小
    iconStyle: PropTypes.object,  //icon的样式
    onPress: PropTypes.func, //可以按，说明就是button
  }
  static defaultProps = {
    onPress: null,
    iconStyle: {color: '#000'},
    iconSize: 2,
  }
  setIconIndex(idx){
    this.iconIdx = idx % 2;
    this.setUpdate();
  }
  setUpdate(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  render(){
    var iname = '';
    var tempBack = {};
    var tempIcon = {};
    if (typeof(this.props.iconName) == 'string'){
      iname = this.props.iconName;
    }else {
      iname = this.props.iconName[this.iconIdx];
      tempBack = this.selectStyle[this.iconIdx*2+0];
      tempIcon = this.selectStyle[this.iconIdx*2+1];
    }
    var child = (
      <Icon 
        name={iname} 
        size={this.props.iconSize * MinUnit} 
        style={[this.props.iconStyle, tempIcon, {backgroundColor: 'rgba(0,0,0,0)'}]}
      />
    );
    var ret = null;
    if (this.props.onPress){
      ret = (
        <PanButton 
          name={this.props.name} 
          onPress={this.props.onPress} 
          style={[this.selfStyle, this.props.style, tempBack]}
        >
          {child}
          {this.props.children}
        </PanButton>
      );
    }else{
      ret = (
        <PanView 
          name={this.props.name} 
          style={[this.selfStyle, this.props.style, tempBack]}
        >
          {child}
          {this.props.children}
        </PanView>
      );
    }
    return ret;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06BCD5'
  },
  topViewBack:{
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MinUnit*3,
    width: ScreenWidth, 
    height: itemHeight,
  },
  bodyViewBack:{
    marginLeft: bodyp.marginLeft,
    marginTop: bodyp.marginTop,
    width: bodyp.width,
    height: bodyp.height,
    // backgroundColor:'grey',
    overflow: 'hidden'
  },
  bodySMGrid:{
    position: 'absolute', 
    left: smp.left, 
    top: smp.top, 
    width: smp.width,
    height: smp.height,
    // backgroundColor: 'blue',
    overflow: 'hidden',
  },
  bodyGridView:{
    position: 'absolute', 
    left: 0, 
    top: 0,
  },
  bodyYMGrid:{
    position: 'absolute', 
    left: ymp.left, 
    top: ymp.top, 
    width: ymp.width,
    height: ymp.height,
    // backgroundColor: 'green',
    overflow: 'hidden',
  },
  bodyPYGrid:{
    position: 'absolute', 
    left: pyp.left, 
    top: pyp.top, 
    width: pyp.width,
    height: pyp.height,
    // backgroundColor: 'red',
    overflow: 'hidden',
  },
  ymChildren:{
    position: 'absolute',
    top: 0,
    left: 0,
    width: ymp.width,
    height: ymp.height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  },
  smChildren:{
    position: 'absolute',
    top: 0,
    left: 0,
    width: smp.width,
    height: smp.height,
    overflow: 'hidden',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pyChildren:{
    position: 'absolute',
    top: 0,
    left: 0,
    width: pyp.width,
    height: pyp.height,
    overflow: 'hidden',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgGrid:{
    position: 'absolute',
    left: 0,
    top: 0,
    width: fw,
    height: fw,
    overflow: 'hidden',
    backgroundColor: '#88CDD2'
  },
  btnBackView:{
    alignItems: 'center', 
    justifyContent: 'center'
  },
});