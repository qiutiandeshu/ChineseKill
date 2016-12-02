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
  ScrollView,
  InteractionManager,
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
  yxPointStyle = null;
  yxMsgList = [];
  pointList = [];
  blnChange = false;
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
    InteractionManager.runAfterInteractions(()=>{
      this.postMessage(Home.searchWord);
    });
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <View style={styles.container}>
        {this.renderTop()}
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={[styles.yxMsg, styles.border]}>
            <ScrollView
              ref={'scroll'}
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}>
              {this.yxMsgList}
            </ScrollView>
          </View>
          <PanView name={'v_treec_web'} style={[styles.webview, styles.border]} >
            <WebViewBridge
              source={{uri: 'http://192.168.1.110:8811/chsvg'}}
              scalesPageToFit={true}
              style={{flex: 1,}}
              onBridgeMessage={this.onMessage.bind(this)}
              ref={(webview)=>{this.webview = webview;}}>
            </WebViewBridge>
          </PanView>
          {/*<View style={styles.inputView}>
            <TextInput
              ref={'Input'}
              style={[styles.input, ]}
              returnKeyType={'search'}
              onChangeText={ text => this.SearchWord = text }
              onFocus={()=>{this.refs.Input.clear(); this.SearchWord="";}}
              onEndEditing={this.search.bind(this)}
              placeholder={'输入要查询的词汇'}/>
          </View>*/}
        </View>
      </View>
    );
  }
  componentDidUpdate(prevProps, prevState) {
    this.blnChange = false;
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
  yxTouch(key) {
    var json = {
      kind: 'yxSelect',
      key: key
    };
    this.webview.sendToBridge(JSON.stringify(json));  
  }
  onMessage(message) {
    var json = JSON.parse(message);
    if (json.kind == 'style') {
      this.yxPointStyle = json.style;
    } else if (json.kind == 'yxmsg') {
      this.blnChange = true;
      this.yxMsgList = [];
      var yxList = json.yxList;
      var yxstr = json.yxstr;
      this.pointList = [];
      for (var i=0;i<yxList.length;i++) {
        if (!json.blnNull && i==0) continue;
        var msg = '义项不明';
        if (i > 0) {
          var _key = yxList[i];
          if (yxstr[_key]) {
            msg = yxstr[_key];
          } else {
            msg = _key;
          }
        }
        this.yxMsgList.push(
          <YxPoint
            color={this.yxPointStyle.fillStyle[i]}
            text={msg}
            yxkey={yxList[i]}
            selectYx={(key)=>{
              this.yxTouch(key);
              this.pointList.forEach(function(point) {
                if (point) {
                  if (point.props.yxkey == key) {
                    point.textSelect();
                  } else {
                    point.notSelect();
                  }
                }
              });
            }}
            ref={(ref)=>{this.pointList.push(ref);}}
            parent={this}
            key={i}/>
        );
      }
      this.refs.scroll.scrollTo({
        y: 0,
        animated: false,
      });
      this.Refresh();
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
        <Text style={UtilStyles.fontNormal}>词汇关系网</Text>
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
    yxkey: -1,
    selectYx: (key)=>{console.log(key);},
  };
  constructor(props) {
    super(props);
  
    this.state = {
      blnSelect: false,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.parent.blnChange) {
      this.state.blnSelect = false;
    }
    return true;
  }
  render() {
    return (
      <PanButton name={'b_treec_yx'} style={styles.yxNode} onPress={this.selectYx.bind(this)}>
        <View style={[styles.yxPoint,{backgroundColor: this.props.color}]}></View>
        <Text style={[styles.yxText, {color: this.state.blnSelect?"#E90216":"#050000"}]} ref={'text'}>
          {this.props.text}
        </Text>
      </PanButton>
    );
  }
  textSelect() {
    if (this.state.blnSelect == false) {
      this.setState({
        blnSelect: true,
      });
    }
  }
  notSelect() {
    if (this.state.blnSelect) {
      this.setState({
        blnSelect: false,
      });
    }
  }
  selectYx() {
    this.props.selectYx(this.props.yxkey);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  border: {
    borderColor: '#BCBCBC',
    borderWidth: MinWidth,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
    margin: MinUnit*0.5,
  },
  topView: {
    flexDirection: 'row',
    height: MinUnit * 6,
    paddingHorizontal: MinUnit * 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputView: {
    position: "absolute",
    left: MinUnit*0.5,
    top: MinUnit*0.5,
    width: MinUnit*29,
    height: MinUnit*4,
    backgroundColor: '#FFFFFF', 
    borderColor: '#CDCDCD',
    borderWidth: MinWidth,
  },
  input: {
    flex: 1,
    paddingHorizontal: MinUnit*0.5,
    fontSize: MinUnit*3,
  },
  yxMsg: {
    width: MinUnit*29,
    marginLeft: MinUnit*0.5,
    marginTop: MinUnit*5,
    marginBottom: MinUnit*0.5,
    paddingHorizontal: MinUnit,
  },
  scrollView: {
    flex: 1,
  },
  yxNode: {
    flex: 1,
    padding: MinUnit*0.5,
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#E72434'
  },
  yxPoint: {
    width: MinUnit*2,
    height: MinUnit*2,
    borderRadius: MinUnit,
    borderWidth: 1,
    borderColor: '#717171',
    backgroundColor: '#AFD89D',
  },
  yxText: {
    flex: 1,
    fontSize: MinUnit*1.5,
    marginLeft: MinUnit*2,
    color: "#000000",
    // borderColor: '#9DE79E',
    // borderWidth: 1,
  }
});