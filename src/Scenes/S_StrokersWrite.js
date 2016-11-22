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
var itemHeight = MinUnit * 7;

export default class StrokersWrite extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <View style={styles.container}>
        {this.renderTop()}
        {this.renderBody()}
      </View>
    );
  }
  onBackScene(){
    this.props.navigator.pop();
  }
  renderTop(){
    var indexString = `${this.props.rowData.rowIndex + 1}/${this.props.rowCount}`;
    return (
      <View name='StrokersWriteTopView' style={styles.topViewBack}>
        <PanButton name="btnStrokersWriteBack" onPress={this.onBackScene.bind(this)} style={{width: MinUnit*15}}>
          <Icon name="times" size={MinUnit*3}/>
        </PanButton>
        <View style={styles.textView}>
          <Text style={styles.pyText}>
            {this.props.rowData.data.py}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.greyText}>
            {indexString}
          </Text>
        </View>
      </View>
    );
  }
  onPressRemember(){

  }
  onPressForget(){

  }
  renderBody(){
    return (
      <View name='StrokersWriteBodyView' style={styles.bodyView}>
        <View style={[styles.textView, {width: ScreenWidth*0.5, height: itemHeight}]}>
          <Text style={styles.greyText}>
            {this.props.rowData.data.en}
          </Text>
        </View>
        {this.renderBodyMiddle()}
        <View style={styles.bodyBottomView}>
          <PanButton name='btnStrokersWriteRemember' 
            onPress={this.onPressRemember.bind(this)} 
            style={[styles.btnBackView, {borderColor: '#CDCFA7'}]}>
            <Icon name="hand-peace-o" size={MinUnit*5} style={{color: '#CDCFA7'}}/>
          </PanButton>
          <View style={{width: MinUnit * 8, height: itemHeight}} />
          <PanButton name='btnStrokersWriteForget' 
            onPress={this.onPressForget.bind(this)}
            style={[styles.btnBackView, {borderColor: '#D0B5BC'}]}>
            <Icon name="remove" size={MinUnit*5} style={{color: '#D0B5BC'}}/>
          </PanButton>
        </View>
      </View>
    );
  }
  renderBodyMiddle(){
    return (
      <View style={styles.bodyCenterView}>
      </View>
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
    paddingHorizontal: ScreenWidth*0.15,
    width: ScreenWidth, 
    height: itemHeight,
    backgroundColor: '#FFF',
  },
  bodyView:{
    width: ScreenWidth,
    height: ScreenHeight - itemHeight,
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'yellow',
  },
  textView:{
    justifyContent: 'center', 
    alignItems: 'center', 
    width: MinUnit*15
  },
  pyText:{
    fontSize: MinUnit*2.5, 
    textAlign: 'center'
  },
  greyText:{
    fontSize: MinUnit*2, 
    textAlign: 'center', 
    color:'#949494'
  },
  bodyCenterView:{
    flexDirection: 'row',
    paddingHorizontal: ScreenWidth * 0.2 + MinUnit * 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: ScreenHeight * 0.5,
    width: ScreenWidth,
    backgroundColor: 'blue',
  },
  bodyBottomView:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: ScreenWidth,
    height: ScreenHeight*0.25,
    // backgroundColor: 'green',
  },
  btnBackView:{
    width: MinUnit*8, 
    height: MinUnit*8, 
    borderRadius: MinUnit*4, 
    borderWidth: 1, 
    borderColor: '#CDCFA7', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});