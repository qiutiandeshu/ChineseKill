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
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
var itemHeight = MinUnit * 7;//top的高度
import Utils from '../Utils/Utils.js';

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

export default class S_PinyinChart extends Component {
  constructor(props) {
    super(props);
    this._panResponder = {};
    this.state = {
      blnUpdate: false,
    };
    this.initIndex = 0;
    this.chartData = require('../../data/py/拼音表.json');
    this.initChart();
    this.moveOffset = { x: 0, y: 0};
    this._deltaMove = null;
    this.deltaSpeed = { x: 0, y: 0};
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
  }
  componentWillUnmount() {
    this.clearDeltaMove();
  }
  initChart(){
    this.renderData = [];
    this.renderSM = [];
    this.renderYM = [];
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
        this.renderData.push(
          <View key={`${i}_${j}`} style={{
            position: 'absolute',
            top: top,
            left: left,
            width: w,
            height: h, 
            overflow: 'hidden',
          }}>
            {this.initChildren(py_sm[i], py_ym[j], iw, ih, pd, color)}
          </View>
        );
        top += (h+pd);
      }
      left += (w+pd);
    }
    this.maxWidth = left - pd;
    this.maxHeight = top - pd;
    this.initIndex++;
  }
  initChildren(smArr, ymArr, width, height, pd, color){
    var arr = [];
    var top = 0;
    var left = 0;
    for(var j=0;j<ymArr.length; j++){
      top = 0;
      for(var i=0;i<smArr.length;i++){
        var str = this.getPYString(smArr[i], ymArr[j]);
        var child = null;
        if (str != null){
          child = (
            <Text style={{fontSize: width/4, textAlign: 'center', color: '#222'}}>
              {str}
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
      var i = this.getPYData(ym);
      if (i == null) return null;
      else {
        return this.chartData[i].py;
      }
    }else {
      var i = this.getPYData(sm+ym);
      if (i == null) return null;
      else {
        return this.chartData[i].py;
      }
    }
  }
  getPYData(py){
    for(var i=0;i<this.chartData.length;i++){
      if (py == this.chartData[i].py && this.chartData[i].type == '正常字音'){
        return i;
      }
    }
    return null;
  }
  onStartShouldSetPanResponder(e, g){
    return true;
  }
  onMoveShouldSetPanResponder(e, g){
    return true;
  }
  onPanResponderGrant(e, g){
    if (g.numberActiveTouches == 1){
      var tp = {
        x: e.nativeEvent.locationX,
        y: e.nativeEvent.locationY
      };
      this.lastPosition = tp;
      this.clearDeltaMove();
      this.blnInTouch = true;
    }
  }
  onPanResponderMove(e, g){
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
      if (delta.x !=0 || delta.y != 0){
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
    // var tp = {
    //   x: e.nativeEvent.locationX,
    //   y: e.nativeEvent.locationY
    // };
    if (this.blnInTouch){
      this.deltaSpeed = Utils.PMulV(this.deltaSpeed, 2);
      console.log(this.deltaSpeed);
      this._deltaMove = setInterval(this.deltaMove.bind(this), 1/60);
    }
    this.blnInTouch = false;
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
      this.clearDeltaMove();
    }else{
      this.moveOffset.x = this.moveOffset.x + this.deltaSpeed.x;
      this.moveOffset.y = this.moveOffset.y + this.deltaSpeed.y;
      this.moveNativeProps();
      this.deltaSpeed.x *= 0.9;
      this.deltaSpeed.y *= 0.9;
      this.checkDeltaMove();
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
        {this.renderBody()}
      </View>
    );
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
      <PanView name='PingyinChartBodyView' style={styles.bodyViewBack} removeClippedSubviews={true}>
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
        <View style={styles.bodyPYGrid} {...this._panResponder.panHandlers} pointerEvents={'box-only'}>
          <View ref={(r)=>{this.refPY = r}} style={styles.bodyGridView}>
            {this.renderData}
          </View>
        </View>
      </PanView> 
    )
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
});