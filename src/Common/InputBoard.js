/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes} from 'react';
import {
  StyleSheet, View, Keyboard, LayoutAnimation
} from 'react-native';

export default class InputBoard extends Component {
  constructor(props) {
    super(props);
    this.state={
      marginTop: 0,
    };
    this.keyboardShow = false;//当前键盘的状态，显示与否
    this.baseLayout = null;
    this.config = {
      duration: 150,
      create: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      }
    };
    this.basePos = null;
  }
  static propTypes = {
    spaceHeight: PropTypes.number, //固定增加高度
  }
  static defaultProps = {
    spaceHeight: 0,
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }
  componentDidMount() {
    if (this.root){
      this.root.measure((ox, oy, width, height, px, py)=>{
        this.basePos = {
          ox: ox,
          oy: oy,
          width: width,
          height: height,
          px: px,
          py: py
        };
        console.log(this.basePos);
      });
    } 
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  _keyboardDidShow(e) {//当键盘弹起来
    this.keyboardShow = true;
    // let moveY = -(e.startCoordinates.height-this.baseLayout.y-this.baseLayout.height-this.props.spaceHeight);
    // if (moveY > 0){
    //   console.log("did show", e, 'move y: ' + moveY);
    //   LayoutAnimation.configureNext(this.config);
    //   this.setState({
    //     marginTop: moveY 
    //   });
    // }

    this.root.measure((ox, oy, width, height, px, py)=>{
      if (this.basePos)
      this.basePos = {
        ox: ox,
        oy: oy,
        width: width,
        height: height,
        px: px,
        py: py
      };
      let moveY = -(e.startCoordinates.height-this.basePos.py-this.props.spaceHeight);
      if (moveY > 0){
        console.log("did show", e, 'move y: ' + moveY);
        LayoutAnimation.configureNext(this.config);
        this.setState({
          marginTop: moveY 
        });
      }
    });
  }
  _keyboardDidHide(e) {//当键盘收起后
    this.keyboardShow = false;
    if (this.state.marginTop != 0){
      LayoutAnimation.configureNext(this.config);
      console.log("did hide", e);
      this.setState({
        marginTop: 0,
      });
    }
  }
  onLayout(event){
    // if (event.nativeEvent.target == ReactNative.findNodeHandle(this.root))
    if (this.baseLayout == null){
      this.baseLayout = event.nativeEvent.layout;
    }
  }
  render() {
    console.log('render board');
    return (
      <View ref={(r)=>{this.root = r}} 
        style={[styles.container, this.props.style, {marginTop: this.state.marginTop}]}
        onLayout={this.onLayout.bind(this)} />
    );
  }
}

const styles = StyleSheet.create({
    container:{
    }
});