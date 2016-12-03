/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet, 
  View, 
  Text,
  ListView,
  LayoutAnimation,
  NativeModules,
  Animated,
  TextInput,
  Image,
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
  IconSize,
} from '../AppStyles';
var {
  UIManager,
} = NativeModules;

var sectionData = [
  {'name': '丶', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '一', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '人', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '八', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '厶', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '儿', 'number': parseInt(Math.random() * 10) + 1, show: false},
  {'name': '几', 'number': parseInt(Math.random() * 10) + 1, show: false}
];

var rowData = [
  require('../../data/characters/一.json'),
  require('../../data/characters/二.json'),
  require('../../data/characters/三.json'),
  require('../../data/characters/四.json'),
  require('../../data/characters/人.json'),
  require('../../data/characters/他.json'),
  require('../../data/characters/她.json'),
  require('../../data/characters/你.json'),
  require('../../data/characters/几.json'),
  require('../../data/characters/只.json'),
  require('../../data/characters/天.json'),
  require('../../data/characters/岁.json'),
  require('../../data/characters/我.json'),
  require('../../data/characters/猫.json'),
  require('../../data/characters/狗.json')
];
// var rowData = {
// 	"hz": "永",
// 	"py": "yong",
// };

var itemHeight = MinUnit * 7;

import InputBoard from '../Common/InputBoard.js';

export default class StrokersOrder extends Component {
  constructor(props) {
    super(props);
    this.dataBlob = [];
    this.sectionIDs = [];
    this.rowIDs = [];
    this.rowCount = 0;
    this.firstRenderCount = 0;
    var tempCount = (ScreenHeight - itemHeight) / itemHeight + 1;//剩余高度可显示的条数
    for(var i=0;i<sectionData.length;i++){
      var sectionName = i.toString();
      this.sectionIDs.push(sectionName);
      this.dataBlob[sectionName] = sectionData[i];
      this.dataBlob[sectionName].child = [];
      this.rowIDs[i] = [];
      for(var j=0;j<sectionData[i].number;j++){
        var rowName = j.toString();
        this.rowIDs[i].push(rowName);
        this.dataBlob[sectionName].child[rowName] = {
          rowIndex: this.rowCount,
          show: false,
          data: rowData[this.rowCount % rowData.length]
        };
        this.rowCount++;
        if (i < tempCount){//最开始是关闭的，所以不管子项有多少都要增加
          this.firstRenderCount++;
        }
      }
    }
    this.state={
      dataSource: new ListView.DataSource({
        getRowData: this.getRowData.bind(this),
        getSectionHeaderData: this.getSectionData.bind(this),
        rowHasChanged: (r1,r2)=>{
          return r1!==r2;
        },
        sectionHeaderHasChanged: (s1,s2)=>{
          return s1!==s2;
        }
      })
    };
  }
  getSectionData(dataBlob, sectionID){
    return dataBlob[sectionID];
  }
  getRowData(dataBlob, sectionID, rowID){
    // console.log(dataBlob, sectionID, rowID);
    return dataBlob[sectionID].child[rowID];
  }
  componentDidMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(this.dataBlob, this.sectionIDs, this.rowIDs)
    });
  }
  componentWillMount() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  componentWillUnmount() {
  }
  onPressChivox(){
    app.onPressChivox();
  }
  onPressPlay(){
    app.onPressPlay();
  }
  render() {
    // <TextInput style={styles.textInput}/>
    // <Image source={{uri: 'http://imgsrc.baidu.com/forum/w%3D580/sign=3dc7b5df35fae6cd0cb4ab693fb10f9e/b4ae8226cffc1e17206ed8d94a90f603728de909.jpg'}}
    //      style={{width: 200, height: 150, backgroundColor: '#AAA'}}
    //      resizeMode={'stretch'} />

    // <PanButton name="btnTestChivox" 
    //       onPress={this.onPressChivox.bind(this)} 
    //       style={{justifyContent:'center', alignItems: 'center', marginTop:MinUnit*2}}>
    //       <Icon name="microphone" size={MinUnit*10} style={{color: '#AAF'}} />
    //     </PanButton>
    //     <PanButton name="btnTestChivox" 
    //       onPress={this.onPressPlay.bind(this)} 
    //       style={{justifyContent:'center', alignItems: 'center', marginTop:MinUnit*2}}>
    //       <Icon name="volume-up" size={MinUnit*10} style={{color: '#AAF'}} />
    //     </PanButton>

    // <TextInput style={styles.textInput} />
    //     <View style={{width: ScreenWidth, height: 200, backgroundColor: '#111'}} />
    //     <InputBoard spaceHeight={44-200}/>
    return (
      <PanView name='StrokersOrderBack' style={styles.container}>
        {this.renderTop()}
        {this.renderBody()}
      </PanView>
    );
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  onPressSetting(){
  }
  onItemPress(sectionID){//小项打开或关闭
    var newBlob = this.dataBlob.slice();
    var key = sectionID.toString();
    var show = !newBlob[key].show;
    for(var i=newBlob[key].child.length - 1; i>=0; i--){
      newBlob[key].child[i.toString()].show = show;
    }
    newBlob[key].show = show;
    
    var dataString = JSON.stringify(newBlob[key]);
    newBlob[key] = JSON.parse(dataString);
    this.dataBlob = newBlob;
    var config = {
      duration: Math.min(Math.max(10 * this.dataBlob[key].child.length, 100), 300),
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      }
    };
    LayoutAnimation.configureNext(config);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(this.dataBlob, this.sectionIDs, this.rowIDs)
    });
  }
  onItemPressWrite(rowData){//点击进入练习写字
    app.setNextRouteProps({rowCount: this.rowCount, rowData: rowData});
    this.props.navigator.push(app.getRoute('StrokersWrite'));
  }
  renderTop(){
    return (
      <PanView name='StrokersOrderTopView' style={[styles.topViewBack, {}]}>
        <PanButton name="btnStrokersOrderBack" onPress={this.onBackScene.bind(this)}>
          <Icon name="times" size={MinUnit*3}/>
        </PanButton>
        <Text style={{fontSize: MinUnit*2.5, textAlign: 'center'}}>
          笔画顺序
        </Text>
        <PanButton name="btnStrokersOrderSetting" onPress={this.onPressSetting.bind(this)}>
          <Icon name="ellipsis-h" size={MinUnit*3}/>
        </PanButton>
      </PanView>
    );
  }
  renderBody(){
    return (
      <PanView name='StrokersOrderBodyView' style={styles.bodyViewBack}>
        <PanListView 
          name='StrokersOrderListView'
          style={styles.bodyListView}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderSectionHeader={this.renderSectionHeader.bind(this)}
          initialListSize={this.firstRenderCount}
          scrollRenderAheadDistance={500}
        />
      </PanView>
    );
  }
  renderSectionHeader(sectionData, sectionID){
    var name = 'btnStrokersOrderItem' + sectionID.toString();
    console.log('section name: ' + name);
    return (
      <PanButton name={name} style={styles.itemView} onPress={this.onItemPress.bind(this, sectionID)}>
        <View style={styles.itemFrontView}>
          <View style={[styles.itemFrontIconView, {
            transform: [{rotateZ: sectionData.show ? '180deg' : '0deg'}]
          }]}>
            <Icon name="angle-down" size={MinUnit*2} style={{color: 'white'}}/>
          </View>
          <Text style={styles.itemFrontText}>
            {sectionData.name}
          </Text>
        </View>
        <Text style={styles.itemNumberText}>
          {sectionData.number}
        </Text>
      </PanButton>
    )
  }
  renderRow(rowData, sectionID, rowID){
    if (!rowData.show) return null;
    var name = 'btnStrokersOrderItem' + sectionID.toString() + '_' + rowID.toString();
    console.log('row name : ' + name);
    return (
      <PanButton name={name} style={[styles.itemView, styles.itemViewChild]} onPress={this.onItemPressWrite.bind(this, rowData)}>
        <View style={styles.itemFrontView}>
          <View style={[styles.itemFrontIconView, styles.itemFrontNumberView]}>
            <Text style={styles.itemIndexNumber}>
              {rowData.rowIndex + 1}
            </Text>
          </View>
          <Text style={[styles.itemFrontText, {marginLeft: MinUnit*2.5}]}>
            {rowData.data.hz}
          </Text>
        </View>
        <Icon name="pencil-square-o" size={MinUnit*3}/>
        {
          this.dataBlob[sectionID.toString()].child.length - 1 == rowID ? null :
          <View style={styles.itemSeparatorView}/>
        }
      </PanButton>
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
    backgroundColor: '#F7F7F7',
    alignItems: 'center', 
    // marginHorizontal: MinUnit*2,
    paddingHorizontal: MinUnit*3,
    width: ScreenWidth, 
    height: itemHeight,
    borderBottomWidth: 1, 
    borderBottomColor: '#ACACAC'
  },
  bodyViewBack:{
    flex: 1, 
    justifyContent: 'center', 
    alignItems:'center'
  },
  bodyListView:{
    width: ScreenWidth,
    // height: ScreenHeight - itemHeight,
    // backgroundColor: 'yellow'
  },
  itemView:{
    width: ScreenWidth, 
    height: parseInt(itemHeight), 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MinUnit * 5,
    backgroundColor: '#F7F7F7'
  },
  itemViewChild:{
    backgroundColor: '#FFF',
  },
  itemFrontView:{
    height: MinUnit*6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemFrontText:{
    marginLeft: MinUnit, 
    fontSize: MinUnit*2.5, 
    textAlign: 'center'
  },
  itemNumberText:{
    fontSize: MinUnit*1.5, 
    textAlign:'center',
    color: '#CECECE'
  },
  itemFrontIconView:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#04B7D1', 
    width:MinUnit*4,
    height:MinUnit*4,
    borderRadius:MinUnit*2,
  },
  itemFrontNumberView:{
    backgroundColor: '#D2D2D2',
  },
  itemIndexNumber:{
    fontSize: MinUnit*1.2, 
    color:'white'
  },
  itemSeparatorView:{
    position:'absolute', 
    width: ScreenWidth - MinUnit * 3,
    height: 1,
    left: MinUnit*3,
    bottom: 0,
    backgroundColor: '#C8C7CC'
  },
  textInput: {
    borderRadius: 5,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 10,
  },
});

var animations = {
  layout: {
    linear: {
      duration: 50,
      create: {
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeIn,
      },
    },
    spring: {
      duration: 750,
      create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.4,
      },
    },
    easeInEaseOut: {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        delay: 100,
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    },
  },
};

var layoutAnimationConfigs = [
  animations.layout.linear,
  animations.layout.spring,
  animations.layout.easeInEaseOut,
];