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
  Animated,
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
// 取消登陆
class LogoutBox extends Box {
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'Account'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
        <View style={{flex: 1, backgroundColor: '#E2E2E2',}}>
          <PanView name={"v_logout_userinfo"} style={[styles.userInfoView, styles.center]}>
            <IconButton panName={'b_logout_userImage'} name={'user-circle'} size={MinUnit*12} />
            <Text style={styles.userInfoT}>{app.storageUserInfo?app.storageUserInfo.userid:''}</Text>
          </PanView>
          <PanButton name={'b_logout_cp'} style={styles.userInfoB} onPress={this.onChangePassword.bind(this)} >
            <IconText text={'Change Password'} />
          </PanButton>
          <PanButton name={'b_logout_cp'} style={styles.userInfoB}>
            <IconText name={'cloud-upload'} text={'Upload Progress'} />
            {<Text>SUCCESS</Text>}
          </PanButton>
          <PanButton name={'b_logout_cp'} style={styles.userInfoB}>
            <IconText name={'trash-o'} text={'Reset Progress'} />
          </PanButton>
          <View style={{alignItems: 'center',}}>
            <PanButton name={'b_logout'} style={styles.button} onPress={this.onLogoutPress.bind(this)} >
              <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Logout</Text>
            </PanButton>
          </View>
          <Text style={styles.msg}>
            When you login, your learning progerss will be uploaded and synced automatically
          </Text>
        </View>
      </PopupBox>
    );
  }
  onLogoutPress() {
    app.storageUserInfo.blnSign = false;
    app.saveUserInfo(app.storageUserInfo);
    this.hidden();
    HomeMenuLeft.userLogout();
  }
  onChangePassword() {
    Home._onPopupBoxShow('ChangePassword');
  }
}
// 密码修改界面
class ChangePasswordBox extends Box {
  oldP = '';
  newP = '';
  confirmP = '';
  constructor(props) {
    super(props);
  
    this.state = {
      blnWait: false,
    };
  }
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'Change Password'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
        <PanView name={"v_cp"} style={{flex: 1, alignItems: 'center',}}>
          <IconInput name={'p_cp_lock1'} iconName={'lock'} placeholder={'Old Password'} secureTextEntry={true} onChangeText={this.onOldPassword.bind(this)} />
          <IconInput name={'p_cp_lock2'} iconName={'lock'} placeholder={'New Password'} secureTextEntry={true} onChangeText={this.onNewPassword.bind(this)} />
          <IconInput name={'p_cp_lock3'} iconName={'lock'} placeholder={'Confirm New Password'} secureTextEntry={true} onChangeText={this.onConfirmPassword.bind(this)} />
          <PanButton name={'b_signup'} style={styles.button} onPress={this.onConfirm.bind(this)}>
            <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Confirm</Text>
          </PanButton>
        </PanView>
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
    );
  }
  onOldPassword(text) {
    this.oldP = text;
  }
  onNewPassword(text) {
    this.newP = text;
  }
  onConfirmPassword(text) {
    this.confirmP = text;
  }
  onConfirm() {
    if (this.oldP != app.storageUserInfo.password) {
      Alert.alert(
        '警告',
        '输入旧密码错误',
      )
      return;
    }
    if (this.newP == '') {
      Alert.alert(
        '警告',
        '请输入新密码'
      );
      return;
    }
    if (this.confirmP == '') {
      Alert.alert(
        '警告',
        '请输入新密码确定'
      );
      return;
    }
    if (this.newP != this.confirmP) {
      Alert.alert(
        '警告',
        '两次输入新密码不一样'
      );
      return;
    }
    socket.userChangePassword(this.newP, this.result.bind(this), this.getMsgFromServer.bind(this));
  }
  result(msg) {
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
      // 修改成功，保存user信息，隐藏弹出框
      app.storageUserInfo.password = json.data.password;
      app.saveUserInfo(app.storageUserInfo);
      this.hidden();
    }
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
			<PopupBox ref={'PopupBox'} name={'Sign In / Sign Up'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)} hiddenAnimatedEnd={this.hiddenAnimatedEnd.bind(this)}>
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
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
		);
	}
  hiddenAnimatedEnd(bln) {
    this.setState({
      blnWait: false,
    });
  }
  onFacebookLogin() {
    app.onLoginFB();
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
    socket.userSignIn(this.email, this.password, this.result.bind(this), this.getMsgFromServer.bind(this));
  }
  result(msg) {
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
      // 登陆成功，保存user信息，隐藏弹出框
      app.storageUserInfo = json.data;
      app.storageUserInfo.blnSign = true;
      app.saveUserInfo(app.storageUserInfo);
      this.hidden();
      HomeMenuLeft.userLogin();
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
    if (this.password1 == '') {
      Alert.alert(
        '警告',
        "请输入密码",
      );
      return;
    }
    if (this.password1 != this.password2) {
      Alert.alert(
        '警告',
        "两次输入密码不一样",
      );
      return;
    }
    socket.userSignUp(this.email, this.password1, this.result.bind(this), this.getMsgFromServer.bind(this));
  }
  result(msg) {
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
      app.storageUserInfo = json.data;
      app.storageUserInfo.blnSign = true;
      app.saveUserInfo(app.storageUserInfo);
      this.hidden();
      HomeMenuLeft.userLogin();
      Home._onPopupBoxHidden('Login');
    }
  }
}
// 记忆卡（记忆曲线）
const FlashWidth = ScreenWidth*0.54;
class FlashCardBox extends Box {
  constructor(props) {
    super(props);
  
    this.state = {
      moveX: new Animated.Value(0),
      status: 'menu',
      showKind: 1,
      isSetting: false,
      height: new Animated.Value(0),
    };
    this.state.height.setValue(0);
  }
  render() {
    var _name = 'close';
    if (this.state.status == 'test') {
      _name = 'angle-left';
    }
    return (
      <PopupBox
        ref={'PopupBox'}
        name={'FlashCard'}
        leftIconName={_name} onLeftPress={this.onLeftPress.bind(this)}
        rightIconName={this.state.status=='test'?'':'ellipsis-h'} onRightPressMeasure={this.onRightPress.bind(this)}
        backPress={this.hidden.bind(this)} >
        <View style={{flex: 1,}} ref={'view'}>
         {this.renderMenu()}
         {this.renderTest()}
        </View>
        {this.renderFlashSetting()}
      </PopupBox>
    );
  }
  renderFlashSetting() {
    if (this.state.isSetting == false) return null;
    return (
      <View style={styles.flashSettingBack}>
        <PanButton name={'b_flashcard_setting'} style={{flex: 1,}} onPress={this.onHiddenSetting.bind(this)} />
        <Animated.View name={'v_flashcard_setting'} style={[styles.flashSetting, {height: this.state.height}]}>
          <PanView style={[styles.setDisplay, styles.bottomLine]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Display in</Text>
          </PanView>
          <PanView style={[styles.setDisplay, styles.bottomLine]} name={'v_flahs_set'} >
              <Text style={styles.setFont}>Default number: 35</Text>
          </PanView>
          <PanView style={[styles.setAudio, styles.bottomLine]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Audio auto play</Text>
          </PanView>
          <PanView style={[styles.setFocuse, ]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Focused on</Text>
          </PanView>
        </Animated.View>
      </View>
    );
  }
  onHiddenSetting() {
    Animated.timing(
      this.state.height,
      {
        toValue: 0,
        duration: 300,
      },
    ).start(()=>{
      this.setState({
        isSetting: false,
      });
    });
  }
  onLeftPress() {
    if (this.state.status == 'menu') {
      this.hidden("FlashCard");
    } else {
      Animated.timing(
        this.state.moveX,
        {
          toValue: 0,
          duration: 300,
        }
      ).start(this.changeStatus.bind(this, 'menu'));
    }
  }
  onRightPress(ox, oy, width, height, px, py) {
    // console.log(ox, oy, width, height, px, py);
    this.setState({
      isSetting: true
    });
    Animated.timing(
      this.state.height,
      {
        toValue: MinUnit*30,
        duration: 300,
      },
    ).start();
  }
  renderMenu() {
    var left = this.state.moveX.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -MinUnit*15]
    });
    return (
      <Animated.View style={[styles.flashMenu, {left}]}>
        <PanView name={'v_flashcard_m_SRS'} style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
          <PanButton name={'b_flashcard_menu'} style={styles.fmButton} onPress={this.showTest.bind(this)}>
            <Text style={styles.fmSRS}>SRS</Text>
          </PanButton>
        </PanView>
        <PanView name={'v_flashcard_m_msg'} style={[styles.fmList, ]}>
          <DoubleText />
          {this.renderPlus()}
          <DoubleText name={"Word"} num={20} color={'#CDECBE'} />
          {this.renderPlus()}
          <DoubleText name={"Character"} num={15} color={'#F9DFBB'} />
        </PanView>
        <PanView name={'v_flashcard_m_chart'} style={[styles.fmChart, ]}>
        </PanView>
      </Animated.View>
    );
  }
  renderPlus() {
    return (
      <View style={styles.fmPlus}>
        <Text style={styles.fmPlusText}>+</Text>
      </View>
    );
  }
  showTest() {
    Animated.timing(
      this.state.moveX,
      {
        toValue: 1,
        duration: 300,
      }
    ).start(this.changeStatus.bind(this, 'test'));
  }
  changeStatus(_str) {
    if (_str == 'menu') {
      this.setState({
        showKind: 1
      });
    }
    this.setState({
      status: _str,
    });
  }
  renderTest() {
    var left = this.state.moveX.interpolate({
      inputRange: [0, 1],
      outputRange: [FlashWidth, 0]
    });
    return (
      <Animated.View style={[styles.flashTest, {left}]}>
        <PanView name={'v_flashcard_test_question'} style={styles.fTQuestion} >
          <View style={[{height: MinUnit*5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: MinUnit}, ]}>
            <View style={{width: MinUnit*5}} />
            <Text style={{fontSize: MinUnit*3, color: '#FFFFFF'}} >1/3</Text>
            <IconButton name={'volume-up'} size={MinUnit*4} color={'#FFFFFF'} />
          </View>
        </PanView>
        <PanView name={'v_flashcard_test_answer'} style={styles.fTAnswer} >
        </PanView>
        {this.renderButtonShow()}
        {this.renderButtonYesOrNo()}
        {this.renderButtonRight()}
        {this.renderButtonWrong()}
      </Animated.View>
    );
  }
  renderButtonShow() {
    if (this.state.showKind != 1) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onChangeLeft.bind(this)} />
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onChangeRight.bind(this)} />
      </PanView>
    );
  }
  renderButtonYesOrNo() {
    if (this.state.showKind != 2) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onChangeLeft.bind(this)}>
          <Text>Right</Text>
        </PanButton>
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onChangeRight.bind(this)}>
          <Text>Wrong</Text>
        </PanButton>
      </PanView>
    );
  }
  renderButtonRight() {
    if (this.state.showKind != 3) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV1} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} />
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} />
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} />
      </PanView>
    );
  }
  renderButtonWrong() {
    if (this.state.showKind != 4) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} />
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} />
      </PanView>
    );
  }
  onChangeLeft() {
    if (this.state.showKind == 1) {
      this.setState({
        showKind: 2 
      });
    } else if (this.state.showKind == 2) {
      this.setState({
        showKind: 3 
      });
    }
  }
  onChangeRight() {
    if (this.state.showKind == 1) {
      this.setState({
        showKind: 2
      });
    } else if (this.state.showKind == 2) {
      this.setState({
        showKind: 4 
      });
    }
  }
}

class DoubleText extends Component {
  static propTypes = {
    name: React.PropTypes.string,
    num: React.PropTypes.number,
    color: React.PropTypes.string,
  };
  static defaultProps = {
    name: 'Sentence',
    num: 10,
    color: '#F7CDD7'
  };
  render() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center',}} >
        <Text style={[styles.fmListNum, {color: this.props.color}]}>{''+this.props.num}</Text>
        <Text style={[styles.fmListName, {color: this.props.color}]}>{this.props.name}</Text>
      </View>
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
// 字，词，句记忆资料卡
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
    this.jsonList = null;
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
    var data = null;
    if (this.props.kind == 'Character') {
      data = app.storageCardInfo.learnCards.ziKey;
    } else if (this.props.kind == 'Word') {
      data = app.storageCardInfo.learnCards.ciKey;
    } else if (this.props.kind == 'Sentence') {
      data = app.storageCardInfo.learnCards.juKey;
    }
    socket.getCardMsg(this.props.kind, data, (msg)=>{
      console.log(msg)
    },(json)=>{
      if (json.data != '失败') {
        this.jsonList = json.data;
        this.timer = setTimeout(this.getCharacterMsg.bind(this), 500);
      }
    });
  }
  hiddenEnd(bln) {
    this.init();
  }
  getCharacterMsg(json) {
    var array = [];
    for (var i=0;i<this.jsonList.length;i++) {
      var obj = this.jsonList[i];
      var _str = obj['yx_c'];
      if (obj['yx_e'] != null) {
        _str = obj['yx_e'];
      }
      var obj = {
        character: obj['zx'],
        pyin: obj['py'],
        yxstr: _str
      };
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
// list列表中每一个
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
        <View style={{width: MinUnit*10, justifyContent: 'center',}}>
          <Text style={styles.listWord1}>{this.props.data.character}</Text>
        </View>
        <View style={{width: MinUnit*10, justifyContent: 'center',}}>
          <Text style={styles.listWord2}>{this.props.data.pyin}</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center',}}>
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
        <View style={{width: MinUnit*22, justifyContent: 'center',}}>
          <Text style={[styles.listWord2, {marginBottom: MinUnit*0.2}]}>{this.props.data.pyin}</Text>
          <Text style={styles.listWord1}>{this.props.data.character}</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center',}}>
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
class IconText extends Component {
  static propTypes = {
    width: React.PropTypes.number,
    name: React.PropTypes.string,
    size: React.PropTypes.number,
    color: React.PropTypes.string,
    text: React.PropTypes.string,
  };
  static defaultProps = {
    width: MinUnit*20,
    name: 'key',
    size: MinUnit*1.4,
    color: '#01BCD4',
    text: 'HelloWorld',
  };
  render() {
    return (
      <View style={{flex: 1, width: this.props.width, flexDirection: 'row', alignItems: 'center'}}>
        <View style={[{width: MinUnit*2, height:MinUnit*2, borderRadius: MinUnit*1, backgroundColor: this.props.color, marginRight: MinUnit*2}, styles.center]}>
          <Icon name={this.props.name} size={this.props.size} color={'#FFFFFF'} />
        </View>
        <Text style={{fontSize: MinUnit*1.5, color: "#3F3F3F"}} >{this.props.text}</Text>
      </View>
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
    fontSize: MinUnit*1.3,
    textAlign: 'center',
    color: '#646464'
  },
  button: {
    backgroundColor: '#35757A',
    height: MinUnit*4,
    width: MinUnit*27,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MinUnit*2,
    marginVertical: MinUnit*4,
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
    alignItems: 'center',
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
  },
  flashMenu: {
    position: 'absolute',
    left: 0,
    width: FlashWidth,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  flashSettingBack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00000078',
  },
  flashSetting: {
    position: 'absolute',
    right: MinUnit,
    top: MinUnit*5,
    width: MinUnit*35,
    height: MinUnit*30,
    backgroundColor: '#FFFFFF',
    borderRadius: MinUnit,
    overflow: 'hidden',
  },
  fmButton: {
    width: MinUnit*16,
    height: MinUnit*16,
    borderRadius: MinUnit*8,
    backgroundColor: '#0494A4',
    borderWidth: MinUnit,
    borderColor: '#04B7CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fmSRS: {
    fontSize: MinUnit*6,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  fmList: {
    height: MinUnit*9,
    borderBottomWidth: MinWidth,
    borderColor: '#A3A3A3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fmListName: {
    fontSize: MinUnit*2,
  },
  fmListNum: {
    fontSize: MinUnit*4,
  },
  fmPlus: {
    margin: MinUnit*2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fmPlusText: {
    fontSize: MinUnit*4,
    color: '#E8E8E8',
  },
  fmChart: {
    height: ScreenHeight*0.35,
  },
  fTQuestion: {
    width: MinUnit*30,
    height: ScreenHeight*0.3,
    backgroundColor: '#1AA0AA',
  },
  fTAnswer: {
    width: MinUnit*30,
    height: ScreenHeight*0.15,
    backgroundColor: '#E9E9E9',
  },
  fTButtonV: {
    width: MinUnit*30,
    height: ScreenHeight*0.15,
    marginVertical: MinUnit*2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fTButtonV1: {
    width: MinUnit*45,
    height: ScreenHeight*0.15,
    marginVertical: MinUnit*2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fTButton: {
    width: MinUnit*12,
    height: ScreenHeight*0.14,
    backgroundColor: '#A8A8A8',
    margin: MinUnit,
    borderRadius: MinUnit*3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashTest: {
    position: 'absolute',
    left: FlashWidth,
    width: FlashWidth,
    top: 0,
    bottom: 0,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 1,
    borderColor: '#DEDEDE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoView: {
    height: ScreenHeight*0.3,
    borderWidth: MinWidth,
    borderColor: '#BEBEBE',
    marginBottom: MinUnit,
    backgroundColor: '#FFFFFF'
  },
  userInfoB: {
    height: MinUnit*5,
    borderTopWidth: MinWidth,
    borderBottomWidth: MinWidth,
    borderColor: '#BEBEBE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: MinUnit*3,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoT: {
    marginTop: MinUnit*2,
    fontSize: MinUnit*2,
    color: '#868686'
  },
  bottomLine: {
    borderBottomWidth: MinWidth,
    borderColor: '#B2B2B2',
  },
  setDisplay: {
    height: MinUnit*9,
    paddingHorizontal: MinUnit,
    justifyContent: 'center',
  },
  setAudio: {
    height: MinUnit*4.5,
    paddingHorizontal: MinUnit,
    justifyContent: 'center',
  },
  setFocuse: {
    height: MinUnit*7.5,
    paddingHorizontal: MinUnit,
    justifyContent: 'center',
  },
  setFont: {
    fontSize: MinUnit*1.5,
    color: '#424242',
  }
});

module.exports = {
	LoginBox,
  LogoutBox,
  ChangePasswordBox,
  SignUpBox,
  ForgetBox,
  SettingBox,
  FlashCardBox,
  CardBox,
};