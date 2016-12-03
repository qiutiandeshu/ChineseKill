/**
 * Sample React Native S_PinyinChart
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import {
  View,
  Text, 
  Image,
  ActivityIndicator,
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';

export default class Waiting extends Component {
  static ICON = 0;
  static IMAGE = 1;
  static SYSTEM = 2;
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
    this.refIcon = null;
    this.refText = null;
    this._animate = null;
    this.textFrame = 0;
    this.iconFrame = 0;
    this.state = {
      text: this.props.text,
    };
  }
  static propTypes = {
    show: PropTypes.bool.isRequired,//显示
    text: PropTypes.string,//显示内容
    textStyle: PropTypes.object,//显示内容的样式
    textAnim: PropTypes.bool, //文字的动画
    icon: PropTypes.object,//显示
    // icon={
    //   type: Waiting.ICON,//ICON：表示使用Icon，IMAGE：表示使用Image组件，SYSTEM：使用ActivityIndicator组件
    //   name: null,//ICON：表示名字，IMAGE：表示Image组件是source，SYSTEM不起作用
    //   size: MinUnit*2,//组件大小，IMAGE 和 SYSTEM 不起作用
    //   style: {...},//样式
    //   anim: true,//
    //   param: {}//其他参数，主要是Image 和 ActivityIndicator 使用的参数
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
    textAnim: false,
    icon: null,
  }
  componentWillMount() {
    this.setAnimation();
  }
  componentDidMount() {
  }
  componentWillUnmount() {
    this.clearAnimation();
  }
  setAnimation(){
    if (!this._animate){
      if ((this.props.text && this.props.text != '' && this.props.textAnim) || (this.props.icon && this.props.icon.anim)){
        this.textFrame = 0;
        this.iconFrame = 0;
        this._animate = setInterval(this.animateControl.bind(this), 1000/60);
      }
    }
  }
  clearAnimation(){
    this._animate && clearInterval(this._animate);
    this._animate = null;
  }
  animateControl(){
    if (this.props.text && this.props.text != '' && this.props.textAnim){
      this.setState({
        text: this.props.text + this.getAnimateStr(),
      });
    }
    if (this.props.icon && this.props.icon.anim){
      if (this.refIcon && this.props.icon.type != Waiting.SYSTEM){
        this.refIcon.setNativeProps({
          transform: [{rotateZ: `${this.iconFrame%180 * 2}deg`}]
        });
      }
    }
    this.textFrame = (this.textFrame + 1) % 300;
    this.iconFrame = (this.iconFrame + 1) % 360;
  }
  getAnimateStr(){
    var str = '';
    for(var i=0;i<this.textFrame % 60 / 20; i++){
      str += '.';
    }
    return str;
  }
  render(){
    if (this.props.show){
      var icon = this.props.icon
      var child = null;
      if (icon){
        if (icon.type == Waiting.ICON){
          child = (
            <Icon ref={(r)=>{this.refIcon = r}}
              name={icon.name} 
              size={icon.size} 
              style={icon.style}
            />
          );
        }else if (icon.type == Waiting.IMAGE){
          child = (
            <Image ref={(r)=>{this.refIcon = r}}
              source={icon.name}
              resizeMode={icon.param.resizeMode} 
              style={icon.style}
            />
          );
        }else if (icon.type == Waiting.SYSTEM){
          child = (
            <ActivityIndicator ref={(r)=>{this.refIcon = r}}
              color={icon.param.color}
              style={icon.style}
              size={icon.param.size}
              animating={icon.anim}
            />
          );
        }
      }
      return (
        <PanView name='customWaiting' style={[this.defaultStyle, this.props.style]}>
          {
            this.props.text && this.props.text != '' ?
            <Text ref={(r)=>{this.refText = r}} style={this.props.textStyle} >
              {this.state.text}
            </Text> :
            null 
          }
          {child}
          {this.props.children}
        </PanView>
      );
    }else{
      return <View style={[this.defaultStyle, {opacity:0}]}/>
    }
  }
}