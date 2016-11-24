'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ListView,
} from 'react-native';

import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView.js'
import Icon from 'react-native-vector-icons/FontAwesome'
import PopupBox from '../Common/PopupBox.js'

class Box extends Component {
	show() {
		this.refs.PopupBox.show();
	}
	hidden() {
		this.refs.PopupBox.hidden();
	}
  // 判断是否为邮箱
  blnEmail(_str) {
    var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if(reg.test(_str) == false) {
      Alert.alert(
        '警告',
        '邮箱格式不正确',
      );
      return false;
    }
    return true;
  }

  renderWait(bln) {
    if (bln == false) return null;
    return (
      <View style={styles.wait}>
        <View style={styles.waitFrame}>
          <ActivityIndicator color={'#FFFFFF'}/>
        </View>
      </View>
    );
  }
}

// 设置界面
class SettingBox extends Box {
	render() {
		return (
			<PopupBox ref={'PopupBox'} name={'Setting'} leftIconName={'close'} onLeftPress={this.hidden.bind(this, "Setting")}>
			</PopupBox>
		);
	}
}
// 登陆界面
class LoginBox extends Box {
  constructor(props) {
    super(props);
  
    this.state = {
      blnWait: false,
    };
    this.email = '';
    this.password = '';
  }
	render() {
		return (
			<PopupBox ref={'PopupBox'} name={'Sign In / Sign Up'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
				<PanView name={'v_login'} style={styles.Login}>
	        <IconInput name={'p_login_email'} iconName={'envelope'} placeholder={'Email'} clearButtonMode={"unless-editing"} onChangeText={this.onEmailChange.bind(this)} />
	        <IconInput name={'p_login_password'} iconName={'lock'} placeholder={'You password'} secureTextEntry={true} onChangeText={this.onPasswordChange.bind(this)} />
          <PanButton name={'b_signin'} style={styles.button} onPress={this.onSignIn.bind(this)} >
            <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Sign In</Text>
          </PanButton>
          <View style={[styles.thirdView, ]}>
            <CircleIcon backStyle={[styles.circle, {borderColor: '#3A58F3'}]} name={'facebook'} color={'#3A58F3'} onPress={this.onFacebookLogin.bind(this)} />
            <CircleIcon backStyle={[styles.circle, {borderColor: '#1AB2F3'}]} name={'twitter'} color={'#1AB2F3'} onPress={this.onTwitterLogin.bind(this)} />
            <CircleIcon backStyle={[styles.circle, {borderColor: '#CC0000'}]} name={'google'} color={'#CC0000'} onPress={this.onGoogleLogin.bind(this)} />
          </View>
          <PanButton name={'b_text_forget'} style={{marginTop: MinUnit*3}} onPress={this.onForgetPassword.bind(this)}>
            <Text style={styles.bword}>Forget Password?</Text>
          </PanButton>
          <PanButton name={'b_text_signup'} style={{marginTop: MinUnit*2}} onPress={this.onSignUp.bind(this)}>
            <Text style={styles.bword}>Sign Up</Text>
          </PanButton>
	        <Text style={styles.msg}>
	          Login or Create a free account to save your learning progress and sync it across multidevives
	        </Text>
	      </PanView>
        <ForgetBox ref={'forget'}/>
        <SignUpBox ref={'signup'} parent={this} />
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
		);
	}
  onFacebookLogin() {
  }
  onTwitterLogin() {
  }
  onGoogleLogin() {
  }
  onEmailChange(text) {
    this.email = text;
  }
  onPasswordChange(text) {
    this.password = text;
  }
  onSignIn() {
    if (this.email == '') {
      Alert.alert(
        '警告',
        '请输入账号',
      );
      return;
    }
    if (this.password == '') {
      Alert.alert(
        '警告',
        '请输入密码',
      );
      return;
    }
    socket.userSignIn(this.email, this.password, function(msg) {
      if (msg == 'fail') {
        Alert.alert(
          '失败',
          '服务器连接失败，请稍后再试'
        );
      } else {
        this.setState({
          blnWait: true,
        });
      }
    }, this.getMsgFromServer.bind(this));
  }
  //发送注册信息后，处理从服务器返回的数据
  getMsgFromServer(json) {
    this.setState({
      blnWait: false,
    });
    if (json.msg == '失败') {
      Alert.alert(
        '失败',
        json.data
      );
    } else {
      // 注册成功，保存user信息，隐藏弹出框
      var initUser = {
        key: 'login',
        id:'1',
        rawData: {
            userid: json.data.userid,
            password: json.data.password,
            blnLogout: false,
            age: '00',
            name: json.data.username,
            love: ['抽烟', '喝酒', '烫头'],
        },
        expires: 1000 * 3600 * 24,//如果不指定过期时间，则会使用defaultExpires参数,null用不过期
      }
      app.saveStorageData(initUser);
      this.hidden();
    }
  }
  onForgetPassword() {
    Home._onPopupBoxShow('Forget');
  }
  onSignUp() {
    Home._onPopupBoxShow('SignUp');
  }
}
// 密码忘记
class ForgetBox extends Box {
  email = null;
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'Forget Password'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
        <PanView name={'v_login'} style={styles.Login}>
          <IconInput name={'p_forget_password'} iconName={'envelope'} placeholder={'Email'}  clearButtonMode={"unless-editing"} />
          <PanButton name={'b_confirm'} style={styles.button} onPress={this.onConfirm.bind(this)} >
            <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Confirm</Text>
          </PanButton>
        </PanView>
      </PopupBox>
    );
  }
  onEmailChange(text) {
    this.email = text;
  }
  onConfirm() {
    if (this.blnEmail(this.email) == false) return;
  }
}
// 注册
class SignUpBox extends Box {
  email = null;
  password1 = null;
  password2 = null;
  constructor(props) {
    super(props);
  
    this.state = {
      blnWait: false,
    };
  }
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'Sign Up'} leftIconName={'close'} onLeftPress={this.closeBox.bind(this)}>
        <PanView name={'v_login'} style={styles.Login}>
          <IconInput name={'p_signup_email'} iconName={'envelope'} placeholder={'Email'} onChangeText={this.onEmailChange.bind(this)} clearButtonMode={"unless-editing"} />
          <IconInput name={'p_signup_lock1'} iconName={'lock'} placeholder={'At least six characters required'} secureTextEntry={true} onChangeText={this.onPassword1.bind(this)} />
          <IconInput name={'p_signup_lock2'} iconName={'lock'} placeholder={'Confirm New Password'} secureTextEntry={true} onChangeText={this.onPassword2.bind(this)} />
          <PanButton name={'b_signup'} style={styles.button} onPress={this.onSignUp.bind(this)}>
            <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Create free account</Text>
          </PanButton>
          <Text style={styles.msg}>
            Login or Create a free account to save your learning progress and sync it across multidevives
          </Text>
        </PanView>
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
    );
  }
  closeBox() {
    this.hidden();
  }
  onEmailChange(text) {
    this.email = text;
  }
  onPassword1(text) {
    this.password1 = text;
  }
  onPassword2(text) {
    this.password2 = text;
  }
  // 注册
  onSignUp() {
    if (this.blnEmail(this.email) == false) return;
    if (this.password1 != this.password2) {
      Alert.alert(
        '警告',
        "两次输入密码不一样",
      );
      return;
    }
    socket.userSignUp(this.email, this.password1, function(msg) {
      if (msg == 'fail') {
        Alert.alert(
          '失败',
          '服务器连接失败，请稍后再试'
        );
      } else {
        this.setState({
          blnWait: true,
        });
      }
    }, this.getMsgFromServer.bind(this));
  }
  //发送注册信息后，处理从服务器返回的数据
  getMsgFromServer(json) {
    this.setState({
      blnWait: false,
    });
    if (json.msg == '失败') {
      Alert.alert(
        '失败',
        json.data
      );
    } else {
      // 注册成功，保存user信息，隐藏弹出框
      var initUser = {
        key: 'login',
        id:'1',
        rawData: {
            userid: json.data.userid,
            password: json.data.password,
            blnLogout: false,
            age: '00',
            name: json.data.username,
            love: ['抽烟', '喝酒', '烫头'],
        },
        expires: 1000 * 3600 * 24,//如果不指定过期时间，则会使用defaultExpires参数,null用不过期
      }
      app.saveStorageData(initUser);
      this.hidden();
      Home._onPopupBoxHidden('Login');
    }
  }
}
// 记忆卡（记忆曲线）
class FlashCardBox extends Box {
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'FlashCard Review'} leftIconName={'close'} onLeftPress={this.hidden.bind(this, "FlashCard")}>
      </PopupBox>
    );
  }
}

// 带有声音处理的Box
class SoundBox extends Box {
  blnRecord = false;
  constructor(props) {
    super(props);
  
    this.state = {
      blnShowLoop: false,
    };
  }
  release() {
    this.blnRecord = false;
    this.setState({
      blnShowLoop: false,
    });
  }
  renderButton() {
    var width = MinUnit*7;
    return (
      <View style={[{flexDirection: 'row', justifyContent: 'space-between',}, ]} >
        <View style={{width}} />
        <CircleIcon name={'microphone'} size={MinUnit*5} color={'#F6F6F6'} backStyle={styles.microphone} onPress={this.onRecordKey.bind(this)} />
        {this.state.blnShowLoop && <CircleIcon name={'rotate-left'} size={MinUnit*5} color={'#F6F6F6'} backStyle={styles.microphone} onPress={this.onLoopKey.bind(this)} />}
        {this.state.blnShowLoop==false && <View style={{width}} />}
      </View>
    );
  }
  // 录音按钮
  onRecordKey() {
    this.blnRecord = !this.blnRecord;
    if (this.state.blnShowLoop==false && this.blnRecord==false) {
      this.setState({
        blnShowLoop: true,
      });
    }
  }
  // 循环按钮
  onLoopKey() {
    this.blnLoop = !this.blnLoop;
  }
  // 播放功能
  playSound() {

  }
}
var yxMsg = require('../../data/hz/6字义项表x.json');
const CharacterList = [4,9,20,26,27,40,41,54,71,86,141,190,203,234,248,258,277,403,437,464,474];
// 字
class CardBox extends SoundBox {
  static propTypes = {
    kind: React.PropTypes.string,
  };
  static defaultProps = {
    kind: 'Character',
  }
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      blnWait: true,
      selectData: null,
      blnShowLoop: false,
    };
  }
  init() {
    this.num = 0;
    this.setState({
      blnWait: true,
      selectData: null,
      dataSource: this.state.dataSource.cloneWithRows([]),
    });
    this.release();
  }
  render() {
    var _name = this.props.kind + ' Review';
    return (
      <PopupBox ref={'PopupBox'} name={_name}
        leftIconName={'close'} onLeftPress={this.hidden.bind(this, "Character")} 
        rightIconName={'pencil-square-o'} 
        showAnimatedEnd={this.showEnd.bind(this)} hiddenAnimatedEnd={this.hiddenEnd.bind(this)} >
        <PanListView
          name={'l_characterBox'}
          style={styles.listView}
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}/>
        {this.renderMsg()}
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
    );
  }
  renderMsg() {
    if (this.props.kind == 'Character') {
      return this.renderCharacter();
    } else if (this.props.kind == 'Word') {
      return this.renderSentence();
    } else if (this.props.kind == 'Sentence') {
      return this.renderSentence();
    }
  }
  renderCharacter() {
    return (
      <PanView name={'v_characterBox'} style={styles.character}>
        <PanView name={'v_characterBox_c'} style={[styles.c_view, styles.border]}>
        </PanView>
        <View style={[styles.cMsg_view, ]}>
          <View style={{height: MinUnit*5, alignItems: 'center',}}>
            <Text style={{fontSize:MinUnit*4}}>{this.state.selectData?this.state.selectData.pyin:''}</Text>
          </View>
          <View style={[{height: MinUnit*4, marginVertical:MinUnit*2, alignItems: 'center',}, ]}>
            <Text style={{fontSize:MinUnit*1.5, color: '#747474'}}>{this.state.selectData?this.state.selectData.yxstr:''}</Text>
          </View>
          {this.renderButton()}
        </View>
      </PanView>
    );
  }
  renderSentence() {
    return (
      <PanView name={'v_characterBox'} style={styles.word}>
        <View style={{height: MinUnit*4, marginVertical:MinUnit, alignItems: 'center',}}>
          <Text style={{fontSize:MinUnit*2}}>{this.state.selectData?this.state.selectData.pyin:''}</Text>
        </View>
        <View style={{height: MinUnit*4, marginVertical:MinUnit*0.5, alignItems: 'center',}}>
          <Text style={{fontSize:MinUnit*3, color: '#00B8D2'}}>{this.state.selectData?this.state.selectData.character:''}</Text>
        </View>
        <View style={[{height: MinUnit*4, marginVertical:MinUnit, alignItems: 'center',}, ]}>
          <Text style={{fontSize:MinUnit*1.5, color: '#747474'}}>{this.state.selectData?this.state.selectData.yxstr:''}</Text>
        </View>
        {this.renderButton()}
      </PanView>
    );
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }
  renderRow(data, s_id, r_id) {
    return (
      <ListItem name={this.props.kind} kind={this.props.kind} rowId={parseInt(r_id)} data={data} onPress={this.changeItem.bind(this, data)} />
    );
  }
  changeItem(data) {
    this.setState({
      selectData: data,
    });
  }
  showEnd(bln) {
    this.timer = setTimeout(this.getCharacterMsg.bind(this), 500);
  }
  hiddenEnd(bln) {
    this.init();
  }
  getCharacterMsg() {
    var array = [];
    for (var i=0;i<CharacterList.length;i++) {
      var _key = CharacterList[i];
      var _data = yxMsg[_key-1];
      var obj = {
        character: _data['汉字内容'],
        pyin: _data['拼音内容'],
      };
      if (_data['义项翻译']) {
        obj['yxstr'] = _data['义项翻译'];
      } else {
        obj['yxstr'] = 'HelloWorld, this is a hz from china, learn it very easy use this tool';
      }
      array.push(obj);
    }
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(array),
    });
    this.setState({
      blnWait: false,
    });
    if (array[0] != null) {
      this.setState({
        selectData: array[0],
      });
    }
  }
}

class ListItem extends Component {
  static propTypes = {
    name: React.PropTypes.string,
    rowId: React.PropTypes.number,
    onPress: React.PropTypes.func,
    kind: React.PropTypes.string,
  };
  static defaultProps = {
    name: 'character',
    rowId: 2,
    onPress: ()=>{},
    kind: "Character",
  };
  render() {
    if (this.props.kind == 'Sentence') {
      return this.renderSentenceListItem();
    }
    var _str = ''+this.props.rowId;
    var fontSize = MinUnit* (1.4 - _str.length*0.15);
    if (fontSize < MinUnit*0.8) fontSize = MinUnit;
    return (
      <PanButton name={'b_listItem_'+this.props.name+'_'+this.props.rowId} style={styles.listItem} onPress={this.props.onPress} >
        <View style={styles.listIndexView}>
          <Text style={[styles.indexFont, {fontSize: fontSize}]}>{this.props.rowId + 1}</Text>
        </View>
        <View style={[{width: MinUnit*10}, styles.center]}>
          <Text style={styles.listWord1}>{this.props.data.character}</Text>
        </View>
        <View style={[{width: MinUnit*10}, styles.center]}>
          <Text style={styles.listWord2}>{this.props.data.pyin}</Text>
        </View>
        <View style={[{flex: 1,}, styles.center]}>
          <Text style={styles.listWord2}>{this.props.data.yxstr}</Text>
        </View>
      </PanButton>
    );
  }
  renderSentenceListItem() {
    var _str = ''+this.props.rowId;
    var fontSize = MinUnit* (1.4 - _str.length*0.15);
    if (fontSize < MinUnit*0.8) fontSize = MinUnit;
    return (
      <PanButton name={'b_listItem_'+this.props.name+'_'+this.props.rowId} style={styles.listItem} onPress={this.props.onPress} >
        <View style={styles.listIndexView}>
          <Text style={[styles.indexFont, {fontSize: fontSize}]}>{this.props.rowId + 1}</Text>
        </View>
        <View style={[{width: MinUnit*22}, styles.center]}>
          <Text style={[styles.listWord2, {marginBottom: MinUnit*0.2}]}>{this.props.data.pyin}</Text>
          <Text style={styles.listWord1}>{this.props.data.character}</Text>
        </View>
        <View style={[{flex: 1,}, styles.center]}>
          <Text style={styles.listWord2}>{this.props.data.yxstr}</Text>
        </View>
      </PanButton>
    );  
  }
}
//带图标的按钮
class IconButton extends Component {
  static propTypes = {
    panName: React.PropTypes.string,
    onPress: React.PropTypes.func,
    name: React.PropTypes.string,
    size: React.PropTypes.number,
    color: React.PropTypes.string,
  };
  static defaultProps = {
    panName: 'hello',
    onPress: ()=>{},
    size: 20,
    color: "#000000",

    backStyle: {},
    iconStyle: {},
  }
  render() {
    return (
      <PanButton name={this.props.panName} onPress={this.props.onPress} style={this.props.backStyle} >
        <Icon name={this.props.name} size={this.props.size} color={this.props.color} style={this.props.iconStyle} />
      </PanButton>
    );
  }
}
// 圆形图标
class CircleIcon extends Component {
  static propTypes = {
    name: React.PropTypes.string,
    color: React.PropTypes.string,
    onPress: React.PropTypes.func,
  };
  static defaultProps = {
    name: 'user-circle',
    color: '#000000',
    onPress: ()=>{},
    backStyle: {}
  };
  render() {
    return (
      <IconButton
        panName={'b_circle_' + this.props.name}
        backStyle={this.props.backStyle}
        onPress={this.props.onPress}
        name={this.props.name}
        size={MinUnit*4}
        color={this.props.color} />
    );
  }
}
// 带有图标的输入框
class IconInput extends Component {
  static propTypes = {
    pan_name: React.PropTypes.string,
    iconName: React.PropTypes.string,
    iconSize: React.PropTypes.number,
  };
  static defaultProps = {
    pan_name: 'p_icon',
    iconName: 'envelope-o',
    iconSize: MinUnit*3,
  };
  render() {
    return (
      <PanView name={this.props.pan_name} style={[styles.iconInput, ]}>
        <View style={{width: this.props.iconSize, alignItems: 'center',}}>
          <Icon name={this.props.iconName} size={this.props.iconSize} />
        </View>
        <TextInput style={styles.input} {...this.props} />
      </PanView>
    );
  }
}

const styles = StyleSheet.create({
  wait: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitFrame: {
    width: MinUnit*5,
    height: MinUnit*5,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MinUnit*0.5,
    transform: [{scale: 1.6}]
  },
  border: {
    borderColor: '#202130',
    borderWidth: MinWidth,
  },
	Login: {
    flex: 1,
    padding: MinUnit*2,
    alignItems: 'center',
  },
	iconInput: {
    height: MinUnit*4,
    padding: MinUnit*0.5,
    margin: MinUnit*0.5,
    borderColor: '#737373',
    borderBottomWidth: MinWidth,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    marginHorizontal: MinUnit*2,
  },
  msg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: MinUnit*4,
    fontSize: MinUnit*1.5,
    textAlign: 'center',
    color: '#646464'
  },
  button: {
    backgroundColor: '#35757A',
    height: MinUnit*5,
    width: MinUnit*25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MinUnit*2.5,
    marginVertical: MinUnit*6,
  },
  buttonWord: {
    fontSize: MinUnit*2,
  },
  thirdView: {
    height: MinUnit*6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: MinUnit*6,
    height: MinUnit*6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: MinWidth*3,
    borderColor: '#5176F3',
    borderRadius: MinUnit*3,
    margin: MinUnit*0.5,
  },
  bword: {
    fontSize: MinUnit*2,
  },
  listView: {
    backgroundColor: '#EEEEEE',
  },
  listItem: {
    height: MinUnit*4.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: MinWidth,
    borderColor: '#CBCBCB',
    backgroundColor: '#FFFFFF',
    padding: MinUnit*2,
  },
  listIndexView: {
    width: MinUnit*2.2,
    height: MinUnit*2.2,
    borderRadius: MinUnit*1.1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MinUnit*3,
    // overflow: "hidden",
  },
  indexFont: {
    fontSize: MinUnit*1.4,
    color: '#FFFFFF'
  },
  listWord1: {
    fontSize: MinUnit*2,
    color: '#151515'
  },
  listWord2: {
    fontSize: MinUnit*1.3,
    color: '#939393'
  },
  c_view: {
    width: MinUnit*20,
    height: MinUnit*20,
    marginLeft: MinUnit*3,
  },
  cMsg_view: {
    flex: 1,
    padding: MinUnit*2,
    justifyContent: 'center',
  },
  center: {
    // alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    borderTopWidth: MinWidth,
    borderColor: '#AFAFAF',
    height: ScreenHeight*0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    borderTopWidth: MinWidth,
    borderColor: '#AFAFAF',
    height: ScreenHeight*0.4,
    justifyContent: 'center',
    paddingHorizontal: MinUnit*5,
  },
  microphone: {
    backgroundColor: "#00BBD5",
    width: MinUnit*7,
    height: MinUnit*7,
    borderRadius: MinUnit*3.5,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

module.exports = {
	LoginBox,
  SignUpBox,
  ForgetBox,
  SettingBox,
  FlashCardBox,
  CardBox,
};