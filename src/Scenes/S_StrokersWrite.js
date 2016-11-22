/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes} from 'react';
import {
  StyleSheet, 
  View, 
  Text, 
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  ScreenWidth, 
  ScreenHeight, 
  MinWidth, 
  MinUnit, 
  UtilStyles, 
  IconSize
} from '../AppStyles';
var itemHeight = MinUnit * 7;
import DrawWord from '../Component/DrawWord.js';
var curWidth = parseInt(ScreenHeight * 0.48);
var scaleWidth = curWidth / 400;

export default class StrokersWrite extends Component {
  constructor(props) {
    super(props);
    this.drawWord = null;
    this.character = props.rowData.data.character.slice();
    for(var i=0;i<this.character.length;i++){
      var points = this.character[i].points;
      for(var k=0;k<points.length;k++){
        points[k].x = points[k].x * scaleWidth;
        points[k].y = points[k].y * scaleWidth;
      }
    }
  }
  static propTypes = {
    rowData: PropTypes.object.isRequired, //数据
    rowCount: PropTypes.number.isRequired, //列表里面的总数
  }
  static defaultProps = {
  } 
  render() {
    return (
      <View style={styles.container}>
        {this.renderTop()}
        {this.renderBody()}
      </View>
    );
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  renderTop(){
    var indexString = `${this.props.rowData.rowIndex + 1}/${this.props.rowCount}`;
    return (
      <View name='StrokersWriteTopView' style={styles.topViewBack}>
        <View style={styles.textView}>
          <PanButton name="btnStrokersWriteBack" onPress={this.onBackScene.bind(this)}>
            <Icon name="times" size={MinUnit*3}/>
          </PanButton>
        </View>
        <View style={styles.textView}>
          <Text style={styles.pyText}>
            {this.props.rowData.data.py}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.greyText}>
            {indexString}
          </Text>
        </View>
      </View>
    );
  }
  onPressRemember(){

  }
  onPressForget(){

  }
  renderBody(){
    return (
      <View name='StrokersWriteBodyView' style={styles.bodyView}>
        <View style={[styles.textView, {width: ScreenWidth*0.5, height: itemHeight}]}>
          <Text style={styles.greyText}>
            {this.props.rowData.data.en}
          </Text>
        </View>
        {this.renderBodyMiddle()}
        <View style={styles.bodyBottomView}>
          <PanButton name='btnStrokersWriteRemember' 
            onPress={this.onPressRemember.bind(this)} 
            style={[styles.btnBackView, {borderColor: '#CDCFA7'}]}>
            <Icon name="check" size={MinUnit*5} style={{color: '#CDCFA7'}}/>
          </PanButton>
          <View style={{width: MinUnit * 8, height: itemHeight}} />
          <PanButton name='btnStrokersWriteForget' 
            onPress={this.onPressForget.bind(this)}
            style={[styles.btnBackView, {borderColor: '#D0B5BC'}]}>
            <Icon name="remove" size={MinUnit*5} style={{color: '#D0B5BC'}}/>
          </PanButton>
        </View>
      </View>
    );
  }
  onPressPlay(){//播放语音

  }
  onPressPop(){
    
  }
  onPressAutoWrite(){//自动描红
    if (this.drawWord){
      this.drawWord.setAutoWrite();
    }
  }
  onPressHandWrite(){//手写描红

  }
  onPressSeeBack(){//是否看见汉字背影

  }
  onPressSeeLine(){//是否看见笔画提示

  }
  renderBodyMiddle(){
    return (
      <View style={styles.bodyCenterView}>
        <View style={styles.bodyMiddleLeftView}>
          <PanButton name='btnStrokersWritePaly' 
            onPress={this.onPressPlay.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}>
            <Icon name="volume-up" size={MinUnit*3} style={{color: '#4C8D93'}}/>
          </PanButton>
          <PanButton name='btnStrokersWritePop' 
            onPress={this.onPressPop.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}>
            <Icon name="leaf" size={MinUnit*3} style={{color: '#4C8D93'}}/>
          </PanButton>
        </View>
        <DrawWord 
          style={styles.bodyMiddleCenterView} 
          ref={(r)=>{this.drawWord = r}} 
          data={this.character}
          curWidth={curWidth}
          blnTouch={true}
        />
        <View style={styles.bodyMiddleRightView}>
          <PanButton name='btnStrokersWriteAutoWrite' 
            onPress={this.onPressAutoWrite.bind(this)}
            style={{marginTop: MinUnit*2}}>
            <Icon name="play-circle-o" size={MinUnit*3.5} style={{color: '#4C8D93'}}/>
          </PanButton>
          <PanButton name='btnStrokersWriteHandWrite' 
            onPress={this.onPressHandWrite.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93', marginTop: MinUnit*4}]}>
            <Icon name="paint-brush" size={MinUnit*3} style={{color: '#4C8D93'}}/>
          </PanButton>
          <View style={{marginBottom: MinUnit*2}}>
            <PanButton name='btnStrokersWriteSeeBack' 
              onPress={this.onPressSeeBack.bind(this)}
              style={[styles.btnBackView3, {borderColor: '#4C8D93'}]}>
              <Icon name="eye" size={MinUnit*2} style={{color: '#4C8D93'}}/>
            </PanButton>
            <PanButton name='btnStrokersWriteSeeLine' 
              onPress={this.onPressSeeLine.bind(this)}
              style={[styles.btnBackView3, {borderColor: '#4C8D93', marginTop: MinUnit*2}]}>
              <Icon name="fire" size={MinUnit*2} style={{color: '#4C8D93'}}/>
            </PanButton>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  topViewBack:{
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ScreenWidth*0.15,
    width: ScreenWidth, 
    height: itemHeight,
    backgroundColor: '#FFF',
  },
  bodyView:{
    width: ScreenWidth,
    height: ScreenHeight - itemHeight,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: MinUnit*8,
    // backgroundColor: 'yellow',
  },
  textView:{
    justifyContent: 'center', 
    alignItems: 'center', 
    width: MinUnit*15
  },
  pyText:{
    fontSize: MinUnit*2.5, 
    textAlign: 'center'
  },
  greyText:{
    fontSize: MinUnit*2, 
    textAlign: 'center', 
    color:'#949494'
  },
  bodyCenterView:{
    flexDirection: 'row',
    paddingHorizontal: ScreenWidth * 0.2 + MinUnit * 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: ScreenHeight * 0.5,
    width: ScreenWidth,
    // backgroundColor: 'blue',
  },
  bodyBottomView:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: ScreenWidth,
    height: MinUnit*10,
    // backgroundColor: 'green',
  },
  btnBackView:{
    width: MinUnit*8, 
    height: MinUnit*8, 
    borderRadius: MinUnit*4, 
    borderWidth: 1, 
    borderColor: '#CDCFA7', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  btnBackView2:{
    width: MinUnit*6, 
    height: MinUnit*6, 
    borderRadius: MinUnit*3, 
    borderWidth: 1, 
    borderColor: '#CDCFA7', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  btnBackView3:{
    width: MinUnit*3, 
    height: MinUnit*3, 
    borderRadius: MinUnit*1.5, 
    borderWidth: 1, 
    borderColor: '#CDCFA7', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  bodyMiddleLeftView:{
    width: MinUnit*8,
    height: ScreenHeight*0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: MinUnit * 2,
    paddingVertical: MinUnit * 5,
    // backgroundColor: '#CCC'
  },
  bodyMiddleCenterView:{
    width: curWidth,
    height: curWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEE',
  },
  bodyMiddleRightView:{
    width: MinUnit*8,
    height: ScreenHeight*0.5,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: MinUnit * 2,
    // backgroundColor: '#DDD'
  }
});