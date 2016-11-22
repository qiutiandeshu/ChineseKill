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

var rowData = require('../../data/characters/永.json');

var itemHeight = MinUnit * 7;

export default class StrokersOrder extends Component {
  constructor(props) {
    super(props);
    this.dataBlob = {};
    this.sectionIDs = [];
    this.rowIDs = [];
    this.rowCount = 0;
    this.firstRenderCount = 0;
    var tempCount = (ScreenHeight - itemHeight) / itemHeight + 1;//剩余高度可显示的条数
    for(var i=0;i<sectionData.length;i++){
      var sectionName = i.toString();
      this.sectionIDs.push(sectionName);
      this.dataBlob[sectionName] = sectionData[i];
      this.rowIDs[i] = [];
      for(var j=0;j<sectionData[i].number;j++){
        var rowName = i.toString() + '_' + j.toString();
        this.rowIDs[i].push(rowName);
        this.dataBlob[rowName] = {
          rowIndex: this.rowCount,
          show: false,
          data: rowData
        };
        this.rowCount++;
        if (i < tempCount){//一开是关闭的，所以不管子项有多少都要增加
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
    return dataBlob[rowID];
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
  
  render() {
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
    var key = sectionID.toString();
    var show = !this.dataBlob[key].show;
    for(var i=this.dataBlob[key].number-1;i>=0;i--){
      var itemKey = key + '_' + i.toString();
      this.dataBlob[itemKey].show = show;
    }
    this.dataBlob[key].show = show;
    
    var dataString = JSON.stringify(this.dataBlob);
    this.dataBlob = JSON.parse(dataString);
    var config = {
      duration: Math.min(Math.max(10 * this.dataBlob[key].number, 100), 300),
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
  onItemPressWrite(){//点击进入练习写字

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
      <View name='StrokersOrderBodyView' style={styles.bodyViewBack}>
        <ListView 
          name='StrokersOrderListView'
          style={styles.bodyListView}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderSectionHeader={this.renderSectionHeader.bind(this)}
          initialListSize={this.firstRenderCount}
          scrollRenderAheadDistance={500}
        />
      </View>
    );
  }
  renderSectionHeader(sectionData, sectionID){
    var name = 'btnStrokersOrderItem' + sectionID.toString();
    console.log('section name: ' + name);
    return (
      <PanButton name={name} style={styles.itemView} onPress={this.onItemPress.bind(this, sectionID)}>
        <View style={styles.itemFrontView}>
          <Animated.View style={[styles.itemFrontIconView, {
            transform: [{rotateZ: sectionData.show ? '180deg' : '0deg'}]
          }]}>
            <Icon name="angle-down" size={MinUnit*2} style={{color: 'white'}}/>
          </Animated.View>
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
      <PanButton name={name} style={[styles.itemView, styles.itemViewChild]} onPress={this.onItemPressWrite.bind(this)}>
        <View style={styles.itemFrontView}>
          <View style={[styles.itemFrontIconView, styles.itemFrontNumberView]}>
            <Text style={{fontSize: MinUnit*1.2, color:'white'}}>
              {rowData.rowIndex.toString()+'0'}
            </Text>
          </View>
          <Text style={[styles.itemFrontText, {marginLeft: MinUnit*2.5}]}>
            {rowData.data.hz}
          </Text>
        </View>
        <Icon name="pencil-square-o" size={MinUnit*3}/>
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
    height: ScreenHeight - itemHeight
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