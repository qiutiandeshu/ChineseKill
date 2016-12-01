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
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
var itemHeight = MinUnit * 7;//top的高度

export default class S_PinyinChart extends Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
  }
  static defaultProps = {
  }
  componentWillMount() { 
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <PanView name='MyComponent' style={styles.container}>
        {this.renderTop()}
      </PanView>
    );
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  renderTop(){
    return (//注意修改name。。。。
      <PanView name='MyComponentTopView' style={[styles.topViewBack, {}]}>
        <PanButton name="btnMyComponentBack" onPress={this.onBackScene.bind(this)}>
          <Icon name="remove" size={MinUnit*3} style={{color: 'white'}}/>
        </PanButton>
        <Text style={{fontSize: MinUnit*2.5, textAlign: 'center', color: 'white'}}>
          我的组件
        </Text>
        <View style={{width: MinUnit*3}} />
      </PanView>
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
    paddingHorizontal: MinUnit*3,
    width: ScreenWidth, 
    height: itemHeight,
  },
});