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
import DrawWord from '../Common/DrawWord.js';
var curWidth = parseInt(ScreenHeight * 0.48);

export default class StrokersWrite extends Component {
  constructor(props) {
    super(props);
    this.blnAutoWrite = false;
    this.blnHandWrite = false;
    this.blnSeeBack = true;
    this.blnSeeLine = true;
    this.drawWord = null;
    this.character = props.rowData.data.character;
  }
  static propTypes = {
    rowData: PropTypes.object.isRequired, //数据
    rowCount: PropTypes.number.isRequired, //列表里面的总数
  }
  static defaultProps = {
  }
  componentDidMount() {
    if (this.blnSeeBack){
      this.setSeeBack(this.blnSeeBack);
    } 
    if (this.blnSeeLine){
      this.setSeeLine(this.blnSeeLine);
    }
    this.onPressAutoWrite();
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
      <PanView name='StrokersWriteTopView' style={styles.topViewBack}>
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
      </PanView>
    );
  }
  onPressRemember(){

  }
  onPressForget(){

  }
  renderBody(){
    return (
      <PanView name='StrokersWriteBodyView' style={styles.bodyView}>
        <View style={[styles.textView, {width: ScreenWidth*0.5, height: itemHeight}]}>
          <Text style={styles.greyText}>
            {this.props.rowData.data.en}
          </Text>
        </View>
        {this.renderBodyMiddle()}
        <View style={styles.bodyBottomView}>
          <CircleIcon
            name='btnStrokersWriteRemember'
            onPress={this.onPressRemember.bind(this)}
            style={[styles.btnBackView, {borderColor: '#CDCFA7', marginRight: MinUnit*4}]}
            iconName={'check'}
            iconSize={5} 
            iconStyle={{color: '#CDCFA7'}} />
          <CircleIcon
            name='btnStrokersWriteForget'
            onPress={this.onPressForget.bind(this)}
            style={[styles.btnBackView, {borderColor: '#D0B5BC', marginLeft: MinUnit*4}]}
            iconName={'remove'}
            iconSize={5} 
            iconStyle={{color: '#D0B5BC'}} />
        </View>
      </PanView>
    );
  }
  onPressPlay(){//播放语音

  }
  onPressPop(){
    
  }
  onPressAutoWrite(){//自动描红
    if (this.blnHandWrite){
      this.blnHandWrite = false;
      if (this.refHandWrite){
        this.refHandWrite.setIconIndex(0);
      }
    }
    if (!this.blnAutoWrite){
      this.blnAutoWrite = true;
      if (this.drawWord){
        this.drawWord.setArrowShow(false);
        this.drawWord.setAutoWrite();
      }
      if (this.refAutoWrite){
        this.refAutoWrite.setIconIndex(1);
      }
    }
  }
  onPressHandWrite(){//手写描红
    if (this.blnAutoWrite){
      this.blnAutoWrite = false;
      if (this.drawWord){
        this.drawWord.stopAutoWrite();
      }
      if (this.refAutoWrite){
        this.refAutoWrite.setIconIndex(0);
      }
    }
    this.blnHandWrite = true;
    if (this.drawWord){
      this.drawWord.setArrowShow(this.blnSeeLine);
      this.drawWord.setHandWrite();
    }
    if (this.refHandWrite){
      this.refHandWrite.setIconIndex(1);
    }
  }
  setSeeLine(bln){
    if (this.refSeeLine){
      this.refSeeLine.setIconIndex(bln ? 1 : 0);
    }
    if (this.drawWord){
      if (this.blnHandWrite){
        this.drawWord.setArrowShow(bln);
      }else if (this.blnAutoWrite){
        this.drawWord.setArrowShow(false);
      }
    }
  }
  setSeeBack(bln){
    if (this.refSeeBack){
      this.refSeeBack.setIconIndex(bln ? 1 : 0);
    }
    if (this.drawWord){
      this.drawWord.setBackShow(bln);
    }
  }
  onPressSeeBack(){//是否看见汉字背影
    this.blnSeeBack = !this.blnSeeBack;
    this.setSeeBack(this.blnSeeBack);
  }
  onPressSeeLine(){//是否看见笔画提示
    this.blnSeeLine = !this.blnSeeLine;
    this.setSeeLine(this.blnSeeLine);
  }
  writeOver(){
    if (this.blnAutoWrite){
      this.blnAutoWrite = false;
      if (this.refAutoWrite){
        this.refAutoWrite.setIconIndex(0);
      }
    }
  }
  renderBodyMiddle(){
    return (
      <View style={styles.bodyCenterView}>
        <View style={styles.bodyMiddleLeftView}>
          <CircleIcon
            name='btnStrokersWritePaly'
            onPress={this.onPressPlay.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}
            iconName={'volume-up'}
            iconSize={3} 
            iconStyle={{color: '#4C8D93'}} />
          <CircleIcon
            name='btnStrokersWritePop'
            onPress={this.onPressPop.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}
            iconName={'leaf'}
            iconSize={3} 
            iconStyle={{color: '#4C8D93'}} />
        </View>
        <DrawWord ref={(r)=>{this.drawWord = r}}
          style={styles.bodyMiddleCenterView} 
          data={this.character}
          curWidth={curWidth}
          blnTouch={true}
          writeOver={this.writeOver.bind(this)}
        />
        <View style={styles.bodyMiddleRightView}>
          <ButtonIcon ref={(r)=>{this.refAutoWrite = r}}
            name='btnStrokersWriteAutoWrite'
            onPress={this.onPressAutoWrite.bind(this)}
            style={{marginTop: MinUnit*2}}
            iconName={["play-circle-o", "pause-circle-o"]}
            iconSize={3.5} 
            iconStyle={{color: '#4C8D93'}} />
          <CircleIcon ref={(r)=>{this.refHandWrite = r}}
            name='btnStrokersWriteHandWrite'
            onPress={this.onPressHandWrite.bind(this)}
            style={[styles.btnBackView2, {borderColor: '#4C8D93', marginTop: MinUnit*4}]}
            iconName={["paint-brush", "paint-brush"]}
            iconSize={3} 
            iconStyle={{color: '#4C8D93'}} />
          <View style={{marginBottom: MinUnit*2}}>
            <CircleIcon ref={(r)=>{this.refSeeBack = r}}
              name='btnStrokersWriteSeeBack'
              onPress={this.onPressSeeBack.bind(this)}
              style={[styles.btnBackView3, {borderColor: '#4C8D93'}]}
              iconName={["eye","eye"]}
              iconSize={2} 
              iconStyle={{color: '#4C8D93'}} />
            <CircleIcon ref={(r)=>{this.refSeeLine = r}}
              name='btnStrokersWriteSeeLine'
              onPress={this.onPressSeeLine.bind(this)}
              style={[styles.btnBackView3, {borderColor: '#4C8D93', marginTop: MinUnit*2}]}
              iconName={["fire","fire"]}
              iconSize={2} 
              iconStyle={{color: '#4C8D93'}} />
          </View>
        </View>
      </View>
    );
  }
}
class ButtonIcon extends Component {
  constructor(props) {
    super(props);
    this.state={
      blnUpdate: false,
    };
    this.iconIdx = 0;
    this.selfStyle={
      width: (this.props.iconSize) * MinUnit, 
      height: (this.props.iconSize) * MinUnit, 
      borderColor: '#CDCFA7', 
      alignItems: 'center', 
      justifyContent: 'center'
    };
  }
  static propTypes = {
    name: PropTypes.string.isRequired, //PanView 或者 PanButton的名字
    iconName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired, //icon的名字
    iconSize: PropTypes.number, //icon的大小
    iconStyle: PropTypes.object,  //icon的样式
    onPress: PropTypes.func.isRequired, //可以按，说明就是button
  }
  static defaultProps = {
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
    if (typeof(this.props.iconName) == 'string'){
      iname = this.props.iconName;
    }else {
      iname = this.props.iconName[this.iconIdx];
    }
    return (
      <PanButton 
        name={this.props.name} 
        onPress={this.props.onPress} 
        style={[this.selfStyle, this.props.style]}
      >
        <Icon 
          name={iname} 
          size={this.props.iconSize * MinUnit} 
          style={[this.props.iconStyle, ]}
        />
      </PanButton>
    );
  }
}
class CircleIcon extends Component {
  constructor(props) {
    super(props);
     this.state={
      blnUpdate: false,
    };
    this.iconIdx = 0;
    this.selfStyle={
      width: (this.props.iconSize + 1.4) * MinUnit, 
      height: (this.props.iconSize + 1.4) * MinUnit, 
      borderRadius: (this.props.iconSize + 1.4) * MinUnit / 2, 
      borderWidth: 1, 
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
        style={[this.props.iconStyle, tempIcon]}
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
        </PanButton>
      );
    }else{
      ret = (
        <PanView 
          name={this.props.name} 
          style={[this.selfStyle, this.props.style, tempBack]}
        >
          {child}
        </PanView>
      );
    }
    return ret;
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
    // backgroundColor: '#EEE',
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