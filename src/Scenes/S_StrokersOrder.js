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
  require('../../data/characters/不.json'),
  require('../../data/characters/八.json'),
  require('../../data/characters/口.json'),
  require('../../data/characters/吞.json'),
  require('../../data/characters/哀.json'),
  require('../../data/characters/器.json'),
  require('../../data/characters/天.json'),
  require('../../data/characters/拥.json'),
  require('../../data/characters/永.json'),
  require('../../data/characters/波.json'),
  require('../../data/characters/盲.json'),
  require('../../data/characters/睁.json'),
  require('../../data/characters/秋.json'),
  require('../../data/characters/问.json')
];
// var rowData = {
// 	"hz": "永",
// 	"py": "yong",
// };

var itemHeight = MinUnit * 7;

import InputBoard from '../Common/InputBoard.js';
// import {Chivox, cv, chivoxErr} from '../Utils/Chivox.js';

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
    // console.log(dataBlob, sectionID, rowID);
    return dataBlob[sectionID].child[rowID];
  }
  componentDidMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(this.dataBlob, this.sectionIDs, this.rowIDs)
    });
  }
  
  componentWillMount() {
    // this.chivox = Chivox.Instance();
    // this.chivox.setCallback(this.iseCallback.bind(this), this.volCallback.bind(this), this.pcmCallback.bind(this));
    // console.log('chivox', this.chivox);
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  componentWillUnmount() {
    // Chivox.Remove();
  }
  // onPressChivox(){
  //   this.chivox.startISE({
  //     VOLUME_TS: 0.7,//音量超过多少则表示检测到说话了，最大值为1
  //     VAD_BOS: 3600,//静音超时时间，即用户多长时间不说话则当做超时处理vad_bos 毫秒 ms
  //     VAD_EOS: 1800,//后端点静音检测时间，即用户停止说话多长时间内即认为不再输入，自动停止录音 毫秒 ms
  //     ISE_CATEGORY: 'word',//评测模式：word 字词, sent 句子
  //     SPEECH_TIMEOUT: '10000',//录音超时，录音达到时限时自动触发vad，停止录音，默认-1（无超时）
  //     TEXT: 'jin1 tian1',//需要评测的内容，带后标声调的拼音数据
  //     ISE_AUDIO_PATH: 'pcm',//录音文件的名称，不带后缀，默认为wav
  //     SAMPLE_RATE: '16000',//采样率，16000即可，不需要调整
  //     USER_ID: 'jld-9527',//userID
  //     index: 0,
  //     //WAV_PATH: ''//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
  //   });
  // }
  // iseCallback(data){
  //   if (data.code == cv.CB_CODE_RESULT) {
  //     console.log('have result!');
  //     this.chivox.initPcm({
  //       FILE_PATH:'pcm',
  //       SAMPLE_RATE: '16000'
  //     }, (data)=>{
  //       if (data.error){
  //         console.log(data.err_msg);
  //       }else{
  //         console.log('pcm time: ' + data.audioTime);
  //       }
  //     });
  //     this.resultParse(data.result);
  //   }
  //   else if (data.code == cv.CB_CODE_ERROR) {
  //     if (data.result.match("-20161015_")){
  //       var r = data.result.split('_');
  //       var ret = JSON.parse(r[1]);
  //       console.log(ret);//里面包含errorid 和 error的描述
  //       if (chivoxErr[ret.errId]){
  //         console.log(chivoxErr[ret.errId]);
  //       }else{
  //         console.log(`${ret.errId}，未知错误！`);
  //       }
  //       // ret.errId;//id
  //       // ret.error;//描述
  //     }else{
  //       console.log('error', data.result);
  //     }
  //   }
  //   else if (data.code == chivoxErr.CB_CODE_STATUS) {//正在录音
  //     console.log('status', data.result);
  //     if (data.result == chivoxErr.SPEECH_START) {//已经开始
  //       //
  //     } else if (data.result == chivoxErr.SPEECH_WORK) {//工作中...
  //       //
  //     } else if (data.result == chivoxErr.SPEECH_STOP) {//手动停止
  //       //
  //     } else if (data.result == chivoxErr.SPEECH_RECOG) {//识别中...
  //       //
  //     } else if (data.result == chivoxErr.SPEECH_PRESTART) {//启动前...
  //       //整个时候还不能说话
  //     }
  //   }
  //   else {//..真的是未知的错误
  //     console.log('传回其他参数', data.result);
  //   }
  // }
  // resultParse(result){
  //   var obj = eval('(' + result + ')');
  //   console.log(obj);
  //   if (obj.error){
  //     // console.log('评测错误', obj.errId, obj.error);
  //     //已经在原生端处理了，这里只是加个保险。
  //   }else{
  //     var result = obj.result;
  //     console.log('总分：' + result.overall);
  //     console.log('无调分：' + result.phn);
  //     console.log('带调分：' + result.pron);
  //     console.log('声调分：' + result.tone);
  //     console.log('详情：', result.details);
  //   }
  // }
  // volCallback(data){
  //   console.log(data);
  // }
  // pcmCallback(data){
  //   if (data.status == cv.PCM_TOTALTIME) {
  //     //
  //   } else if (data.status == cv.PCM_PLAYOVER) {
  //     console.log('play over! ' + data.msg);
  //   } else if (data.status == cv.PCM_CURRENTTIME) {
  //     //
  //   } else if (data.status == cv.PCM_ERROR) {
  //     //
  //   }
  // }
  // onPressPlay(){
  //   this.chivox.playPcm();
  // }
  render() {
    // <TextInput style={styles.textInput}/>
    //     <PanButton name="btnTestChivox" 
    //       onPress={this.onPressChivox.bind(this)} 
    //       style={{justifyContent:'center', alignItems: 'center', marginTop:MinUnit*2}}>
    //       <Icon name="microphone" size={MinUnit*10} style={{color: '#AAF'}} />
    //     </PanButton>
    //     <PanButton name="btnTestChivox" 
    //       onPress={this.onPressPlay.bind(this)} 
    //       style={{justifyContent:'center', alignItems: 'center', marginTop:MinUnit*2}}>
    //       <Icon name="volume-up" size={MinUnit*10} style={{color: '#AAF'}} />
    //     </PanButton>

    // <Image source={{uri: 'http://192.169.1.19:8080/ChineseSkill/Pics/5.jpg'}}
    //      style={{width: 200, height: 150, backgroundColor: '#AAA'}}
    //      resizeMode={'stretch'} />
    return (
      <View name='StrokersOrderBack' style={styles.container}>
        {this.renderTop()}
        {this.renderBody()}
        <TextInput style={styles.textInput} />
        <View style={{width: ScreenWidth, height: 200, backgroundColor: '#111'}} />
        <InputBoard spaceHeight={44-200}/>
      </View>
    );
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  onPressSetting(){
    // app.setTest('nnn');
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
      <View name='StrokersOrderBodyView' style={styles.bodyViewBack}>
        <PanListView 
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