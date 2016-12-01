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
  TextInput,
} from 'react-native';
import PanView from '../UserInfo/PanView';
import PanButton from '../UserInfo/PanButton';
import PanListView from '../UserInfo/PanListView';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize } from '../AppStyles';
import WebViewBridge from 'react-native-webview-bridge';
export default class S_TreeZ extends Component {
  SearchWord = '';
  webview = null;
  constructor(props) {
    super(props);

    this.state = {
      blnRefresh: false,
    };
  }
  Refresh() {
    this.setState({
      blnRefresh: !this.state.blnRefresh,
    });
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
        <View style={{flex: 1,}}>
          <WebViewBridge
            source={{uri: 'http://192.168.1.110:8811/hzsvg'}}
            scalesPageToFit={true}
            style={styles.webview}
            onBridgeMessage={this.onMessage.bind(this)}
            ref={(webview)=>{this.webview = webview;}}>
          </WebViewBridge>
          <View style={styles.inputView}>
            <TextInput
              ref={'Input'}
              style={[styles.input, ]}
              returnKeyType={'search'}
              onChangeText={ text => this.SearchWord = text }
              onFocus={()=>{this.refs.Input.clear(); this.SearchWord="";}}
              onEndEditing={this.search.bind(this)}
              placeholder={'输入要查询的汉字'}/>
          </View>
          <View style={[styles.msg, ]}>
            <YxPoint text={"表音"} color={"#D1E575"}/>
            <YxPoint text={"表义"} color={"#7FE570"}/>
            <YxPoint text={"记号"} color={"#E5ADB2"}/>
            <YxPoint text={"其他"} color={"#B1E5E0"}/>
          </View>
        </View>
      </View>
    );
  }
  search() {
    if (this.SearchWord.length != 0) {
      this.postMessage(this.SearchWord);
    }
  }
  postMessage(message) {
    var json = {
      kind: 'search',
      word: message
    };
    this.webview.sendToBridge(JSON.stringify(json));
  }
  onMessage(message) {
    var json = JSON.parse(message);
    if (json.kind == 'style') {
    } else if (json.kind == 'yxmsg') {
    } else if (json.kind = 'log') {
      console.log(json.str);
    }
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

class YxPoint extends Component {
  static defaultProps = {
    text: 'hello',
    color: '#E81515',
  };
  render() {
    return (
      <View style={[styles.yxPoint,{backgroundColor: this.props.color}]}>
        <Text style={styles.yxText}>
          {this.props.text}
        </Text>
      </View>
    );
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
  webShow: {
    flex: 1,
    margin: MinUnit*2,
    borderRadius: MinUnit,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  inputView: {
    position: "absolute",
    left: MinUnit,
    top: MinUnit,
    width: MinUnit*20,
    height: MinUnit*3,
    borderRadius: MinUnit*0.5,
    backgroundColor: '#00000041', 
    borderColor: '#CDCDCD',
    borderWidth: MinWidth,
  },
  input: {
    flex: 1,
    paddingHorizontal: MinUnit*0.5,
    fontSize: MinUnit*1.6,
  },
  msg: {
    position: 'absolute',
    left: MinUnit,
    bottom: MinUnit,
    flexDirection: 'row',
  },
  yxPoint: {
    width: MinUnit*5,
    height: MinUnit*2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MinUnit*2.5,
    marginRight: MinUnit,
    borderWidth: 1,
    borderColor: '#3F4745',
  },
  yxText: {
    fontSize: MinUnit*1.5,
  },
});