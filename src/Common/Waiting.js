/**
 * Sample React Native S_PinyinChart
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import {
  View,
  Text, 
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
var itemHeight = MinUnit * 7;//top的高度

export default class Waiting extends Component {
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
        <PanView name='customWaiting' style={[this.defaultStyle, this.props.style]}>
          {
            this.props.text && this.props.text != '' ?
            <Text style={this.props.textStyle} >
              {this.props.text}
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