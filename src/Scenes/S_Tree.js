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
  WebView,
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
export default class S_Tree extends Component {
  webview = null;
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
      <View style={styles.container}>
        {this.renderTop()}
        <View style={{flex: 1,margin: MinUnit, borderColor: '#FF0300', borderWidth: MinWidth}}>
          <WebView
            source={{uri: 'http://192.168.1.110:8811/hzsvg'}}
            scalesPageToFit={true}
            style={{flex: 1, borderColor: '#FF0300', borderWidth: MinWidth}} />
        </View>
      </View>
    );
  }

  renderTop() {
    return (
      <PanView name={'v_tree_top'} style={[styles.topView, UtilStyles.bottomLine, UtilStyles.grayBackColor]}>
        <PanButton name={'b_tree_back'} onPress={this.onBackPress.bind(this)} >
          <Icon name="times" size={IconSize}/>
        </PanButton>
        <Text style={UtilStyles.fontNormal}>关系网</Text>
        <View style={{width: IconSize, height: IconSize}} />
      </PanView>
    );
  }
  onBackPress() {
    this.props.navigator.pop();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topView: {
    flexDirection: 'row',
    height: MinUnit * 6,
    paddingHorizontal: MinUnit * 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});