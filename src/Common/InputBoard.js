/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet, View, Keyboard,
} from 'react-native';

export default class InputBoard extends Component {
  constructor(props) {
    super(props);
    this.state={
      marginTop: 0,
    };
    this.keyboardShow = false;//当前键盘的状态，显示与否
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  _keyboardDidShow(e) {//当键盘弹起来
    this.keyboardShow = true;
    console.log("did show", e);
  }
  _keyboardDidHide(e) {//当键盘收起后
    this.keyboardShow = false;
    console.log("did hide", e);
  }
  setLog(log){
    console.log(log);
  }
  onLayout(event){
    console.log(event);
    console.log(event.nativeEvent);
    console.log(event.nativeEvent.layout);
  }
  render() {
    // return (
    //   <View ref={(r)=>{this.root = r}} 
    //   style={[styles.container, this.props.style, {marginTop: this.state.marginTop}]}
    //   onLayout={this.onLayout.bind(this)}>
    //     {this.props.child}
    //   </View>
    // );
    return (null);
  }
}

const styles = StyleSheet.create({
    container:{
      justifyContent: 'center', 
      alignItems: 'center'
    }
});