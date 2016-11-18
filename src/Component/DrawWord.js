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

import Utils from '../Utils';

export default class DrawWord extends Component {
  constructor(props){
    super(props);
    this.InitWord(props.data);
    this.state = {
      blnUpdate: false
    };
  }
  static propTypes = {
    curWidth: PropTypes.number.isRequired,
  }
  static defaultProps = {
  }
  setUpdate(){
    this.setState({
      blnUpdate: !this.blnUpdate,
    });
  }
  InitWord(data){
    this.data = data;
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
    this.loadWord();
  }
  loadWord(){
    this.drawIdx = -1;
    var character = this.data.character;
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
      character[i].color = 'rgb(255,0,0)';

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
      // character[i].dashPoints = ResampleByLen(orgPoints, 10);
      
      // for(var k=0;k<character[i].dashPoints.length;k++){
      //   this.showPoints.push(
      //     <View style={{
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
    var bh = this.data.character[this.drawIdx];
    this.max_Step = Math.min(bh.upPoints.length, bh.downPoints.length);
    this.now_Step = 0;
  }
  DrawingPecent(per){
    var bh = this.data.character[this.drawIdx];
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
    this.tempDrawData.color = 'rgb(0,0,0)';
    this.tempDrawLine = (
      <Shape d={line} fill={this.tempDrawData.color}/>
    );
    this.setUpdate();
  }
  setEndDraw(){
    var character = this.data.character;
    this.arrLine[this.drawIdx] = (
      <Shape key={this.drawIdx} d={character[this.drawIdx].line} fill={this.tempDrawData.color}/>
    );
    this.tempDrawLine = null;
    this.setUpdate();
  }
  setRestart(){
    var character = this.data.character;
    for(var i=0;i<character.length;i++){
      this.arrLine[i] = (
        <Shape key={i} d={character[i].line} fill={character[i].color}/>
      );
    }
    this.tempDrawLine = null;
    this.drawIdx = 0;
    this.setBeginDraw();
    
    if (this.blnBlink){
      this.stopBlink();
    }else{
      this.setUpdate();
    }
  }
  stopBlink(){
    this.blnBlink = false;
    var character = this.data.character;
    var color = character[this.blinkIdx].color;
    this.arrLine[this.blinkIdx] = (
      <Shape key={this.blinkIdx} d={character[this.blinkIdx].line} fill={color}/>
    );
    this._blinkTime && clearTimeout(this._blinkTime);
    this.setUpdate();
  }
  setStrokeBlink(){
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
      var character = this.data.character;
      var color =  this.blinkFrame % 2 == 0 ? 'rgb(155,0,0)' : 'rgb(255,0,0)';
      this.arrLine[this.blinkIdx] = (
        <Shape key={this.blinkIdx} d={character[this.blinkIdx].line} fill={color}/>
      );
      this.setUpdate();
    
      if (this.blinkFrame <= 6){
        this._blinkTime = setTimeout(this.blinkUpdate.bind(this), 100);
      }else{
        this.stopBlink();
      }
    }
  }
  componentDidMount() {
    this.drawIdx = 0;
    this.setBeginDraw();
  }
  componentWillUnmount() {
    this._blinkTime && clearTimeout(this._blinkTime);
  }
  
  render() {
    return (
      <View style={[styles.container, this.props.style? this.props.style : {}]}>
        <Surface ref={'lineView'} width={this.props.curWidth} height={this.props.curWidth}>
          {this.arrLine}
          {this.tempDrawLine}
        </Surface>
        {this.showPoints}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
