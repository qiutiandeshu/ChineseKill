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
  Slider,
  Switch,
} from 'react-native';

import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView.js'
import Icon from 'react-native-vector-icons/FontAwesome'
import PopupBox from '../Common/PopupBox.js'
import DrawWord from '../Common/DrawWord.js'
import FBLogin from '../Utils/FBLogin.js';
import TWLogin from '../Utils/TWLogin.js';
import GGLogin from '../Utils/GGLogin.js';
import* as Progress from 'react-native-progress'
import PushNotification from './PushNotification.js'

import webData from '../Utils/GetWebData.js';
var pyUrl = 'http://192.169.1.19:8080/ChineseSkill/audio/';
var pyPath = webData.CACHES + '/pyAudio';

const DAY_TIME = 86400000;
class Box extends Component {
  blnPlayAudio = false;
  blnSleep = false;
	show() {
    this.blnSleep = false;
		this.refs.PopupBox.show();
	}
	hidden() {
    this.blnSleep = true;
		this.refs.PopupBox.hidden();
	}
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState != this.state) return true;
    return false;
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
  playAudio(name, callback) {
    if (name == null) {
      callback('fail');
      return;
    }
    console.log(webData.DOCUMENT+"/Sound");
    var param = {
      name: name,
      path: webData.DOCUMENT+"/Sound", //文件路径
      uri: pyUrl+name,
      type: "none",
      over: false,
    };
    webData.Instance().getWebFile(param, (result)=>{
      if (result.code == webData.CODE_ERROR){
        callback('fail');
        this.blnPlayAudio = false;
      } else if (result.code == webData.CODE_DOWNLOAD){
        app.onPlaySound('pyAudio/'+name, (result)=>{
          callback(result);
          if (result.type == 'firstPlay'){
            this.blnPlayAudio = true;
          }else if (result.type == 'cTime'){
            this.blnPlayAudio = true;
          }else if (result.type == 'stop'){
          }else if (result.type == 'playEnd'){
          }else if (result.type == 'initError'){
          }
        }, 'play', {mainPath: 'CACHES'});
      }
    });
  }
}

// 设置界面
class SettingBox extends Box {
	render() {
		return (
			<PopupBox ref={'PopupBox'} name={'每日提醒'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)} backPress={this.backPress.bind(this)}>
        <PushNotification />      
			</PopupBox>
		);
	}
  backPress() {
    this.hidden();
  }
}
// 取消登陆
class LogoutBox extends Box {
  constructor(props) {
    super(props);
  
    this.state = {
      blnWait: false,
      blnSuccess: false,
      blnRefresh: false,
    };
  }
  show() {
    this.setState({
      blnRefresh: !this.state.blnRefresh,
    });
    this.refs.PopupBox.show();
  }
  render() {
    return (
      <PopupBox ref={'PopupBox'} name={'Account'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
        <View style={{flex: 1, backgroundColor: '#E2E2E2',}}>
          <PanView name={"v_logout_userinfo"} style={[styles.userInfoView, styles.center]}>
            <IconButton panName={'b_logout_userImage'} name={'user-circle'} size={MinUnit*12} />
            <Text style={styles.userInfoT}>{app.storageUserInfo?app.storageUserInfo.username:''}</Text>
          </PanView>
          <PanButton name={'b_logout_cp'} style={styles.userInfoB} onPress={this.onChangePassword.bind(this)} >
            <IconText text={'Change Password'} />
          </PanButton>
          <PanButton name={'b_logout_cp'} style={styles.userInfoB} onPress={this.onUpdate.bind(this)}>
            <IconText name={'cloud-upload'} text={'Upload Progress'} />
            {this.state.blnSuccess && <Text>SUCCESS</Text>}
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
        {this.renderWait(this.state.blnWait)}
      </PopupBox>
    );
  }
  onUpdate() {
    this.setState({
      blnWait: true,
    });
    socket.userUpdate((msg)=>{
      if (msg == 'fail') {
        this.setState({
          blnWait: false,
        });
        Alert.alert(
          '警告',
          '服务器连接失败，请稍后再试'
        );
      }
    },(json)=>{
      this.setState({
        blnWait: false,
      });
      if (json.msg == '成功') {
        this.setState({
          blnSuccess: true,
        });
      }
    })
  }
  onLogoutPress() {
    app.storageUserInfo.blnSign = false;
    app.saveUserInfo(app.storageUserInfo);
    if (app.storageUserInfo.kind != 'create') {
      app.onLogoutThird(app.storageUserInfo.kind, (date)=>{

      })
    }
    app.storageUserInfo = null;
    app.saveUserInfo(app.storageUserInfo);
    app.storageReview = null;
    app.saveReview(app.storageReview);
    app.noneCardInfoStorage()
    app.saveCardInfoMing()
    app.noneLearningStorage([]);

    this.hidden();
    HomeMenuLeft.userLogout();
    Home.Refresh();
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
			<PopupBox ref={'PopupBox'} name={'Sign In / Sign Up'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)} hiddenAnimatedEnd={this.hiddenAnimatedEnd.bind(this)} hiddenAnimatedEnd={this.hiddenEnd.bind(this)}>
				<PanView name={'v_login'} style={styles.Login}>
	        <IconInput name={'p_login_email'} iconName={'envelope'} placeholder={'Email'} clearButtonMode={"always"} onChangeText={this.onEmailChange.bind(this)} />
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
    this.setState({
      blnWait: true,
    });
    app.onLoginThird('facebook', (json)=>{
      var data = json.data;
      if (parseInt(data.code) == FBLogin.CB_Error){
        this.setState({
          blnWait: false,
        });
      }else if (parseInt(data.code)== FBLogin.CB_Expired){
        this.setState({
          blnWait: false,
        });
      }else if (parseInt(data.code) == FBLogin.CB_GetInfo){
        this.setState({
          blnWait: false,
        });
        this.hidden();
        HomeMenuLeft.userLogin();
      }else if (parseInt(data.code) == FBLogin.CB_Login){
      }else if (parseInt(data.code) == FBLogin.CB_Logout){
      }
    });
  }
  onTwitterLogin() {
    this.setState({
      blnWait: true,
    });
    app.onLoginThird('twitter', (json)=>{
      var data = json.data;
      if (data.code == TWLogin.CB_CODE_ERROR){
            var ret = JSON.parse(data.result);
            if (ret.id == TWLogin.ERROR_LOGIN){
            }else if (ret.id == TWLogin.ERROR_EXPIRED){
            }else if (ret.id == TWLogin.ERROR_GETINFO){
            }else if (ret.id == TWLogin.ERROR_NOTLOGIN){
            }else {
            }
            this.setState({
              blnWait: false,
            });
        }else if (data.code == TWLogin.CB_CODE_LOGIN){
        }else if (data.code == TWLogin.CB_CODE_LOGOUT){
        }else if (data.code == TWLogin.CB_CODE_EXPIRED){
        }else if (data.code == TWLogin.CB_CODE_GETINFO){
          this.setState({
            blnWait: false,
          });
          this.hidden();
          HomeMenuLeft.userLogin();
        }
    });
  }
  onGoogleLogin() {
    this.setState({
      blnWait: true,
    });
    app.onLoginThird('google', (json)=>{
      var data = json.data;
      if (data.code == GGLogin.CB_CODE_ERROR){
        this.setState({
          blnWait: false,
        });
      }else if (data.code == GGLogin.CB_CODE_LOGIN){
          this.setState({
            blnWait: false,
          });
          this.hidden();
          HomeMenuLeft.userLogin();
      }else if (data.code == GGLogin.CB_CODE_LOGOUT){
      }else if (data.code == GGLogin.CB_CODE_EXPIRED){
          if (data.result == GGLogin.EXPIRED_OUT){
          }else {
            this.setState({
              blnWait: false,
            });
            this.hidden();
            HomeMenuLeft.userLogin();
          }
      }else if (data.code == GGLogin.CB_CODE_DISCONNECT){
        this.setState({
          blnWait: false,
        });
      }
    });
  }
  hiddenEnd(bln) {
    this.email = '';
    this.password = '';
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
          <IconInput name={'p_forget_password'} iconName={'envelope'} placeholder={'Email'}  clearButtonMode={"always"} />
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
      <PopupBox ref={'PopupBox'} name={'Sign Up'} leftIconName={'close'} onLeftPress={this.closeBox.bind(this)} hiddenAnimatedEnd={this.hiddenEnd.bind(this)} >
        <PanView name={'v_login'} style={styles.Login}>
          <IconInput name={'p_signup_email'} iconName={'envelope'} placeholder={'Email'} onChangeText={this.onEmailChange.bind(this)} clearButtonMode={"always"} />
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
  hiddenEnd(bln) {
    this.email = '';
    this.password1 = '';
    this.password2 = '';
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
      blnWait: true,
      answerY: new Animated.Value(0),

      blnRefresh: false,
    };

    this.state.height.setValue(0);
    this.reviewList = [];
    this.displayKind = 1;
    this.focusedC = true;
    this.focusedW = true;
    this.focusedS = true;
    this.blnAuto = true;
    this.minNum = 1;
    this.defaultNum = this.minNum;
    this.testIndex = 0;
    this.flashTime = [];

    this.keyNum = [0, 0, 0, 0, 0];
  }
  initSetting() {
    var json = socket.getReviewList(true, true, true);
    console.log(json);
    this.reviewList = json.list;
    this.reviewNum = json.cNum + json.wNum + json.sNum;
    this.getMaxNum();
    this.defaultNum = this.maxNum;
  }
  Refresh() {
    this.setState({
      blnRefresh: !this.state.blnRefresh,
    });
    this.reviewList = this.getReviewList();
    this.state.answerY.setValue(0 - ScreenHeight*0.3);
  }
  getMaxNum() {
    this.maxNum = 0;
    this.maxNum = this.reviewList.length;
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
        showAnimatedEnd={this.showEnd.bind(this)}
        leftIconName={_name} onLeftPress={this.onLeftPress.bind(this)}
        rightIconName={this.state.status=='test'?'':'ellipsis-h'} onRightPressMeasure={this.onRightPress.bind(this)}
        backPress={this.hidden.bind(this)} >
        <View style={{flex: 1,}} ref={'view'}>
         {this.renderMenu()}
         {this.renderTest()}
        </View>
        {this.renderWait(this.state.blnWait)}
        {this.renderFlashSetting()}
      </PopupBox>
    );
  }
  showEnd(bln) {
    var json = {
      ziList: [],
      ciList: [],
      juList: []
    };
    // app.storageReview = null;
    this.jsonList = [];
    for (var i=0;i<3;i++) {
      var data = app.storageCardInfo.learnCards.ziKey;
      var str = 'Character';
      if (i == 1) {
        data = app.storageCardInfo.learnCards.ciKey;
        str = 'Word';
      } else if (i == 2) {
        data = app.storageCardInfo.learnCards.juKey;
        str = 'Sentence';
      }
      this.jsonList = this.jsonList.concat(data);
      data.forEach((key)=>{
        if (app.storageReview == null) {
          if (i == 0) json.ziList.push(key);
          else if (i == 1) json.ciList.push(key);
          else if (i == 2) json.juList.push(key);
        } else {
          if (app.storageReview[str][key] == null) {
            if (i == 0) json.ziList.push(key);
            else if (i == 1) json.ciList.push(key);
            else if (i == 2) json.juList.push(key);
          }
        }
      });
    }
    if (json.ziList.length == 0 && json.ciList.length == 0 && json.juList.length == 0) {
      this.setState({
        blnWait: false,
      });
      this.initSetting();
      return;
    }
    socket.getCardMsg('All', json, (msg)=>{
      if (msg == 'fail') {
        this.setState({
          blnWait: false,
        });
        Alert.alert(
          '警告',
          '连接服务器失败，请稍候重试'
        );
        this.initSetting();
      }
    },(json)=>{
      this.setState({
        blnWait: false,
      });
      if (json.data != '失败') {
        if (app.storageReview == null) {
          app.storageReview = {};
          app.storageReview['Character'] = {};
          app.storageReview['Word'] = {};
          app.storageReview['Sentence'] = {};
        }
        json.data.Character.forEach((obj)=>{
          obj.factor = 2500;
          obj.day = socket.getTime();
          obj.review_t = -1 * DAY_TIME;
          app.storageReview['Character'][obj.key] = obj;
        });
        json.data.Word.forEach((obj)=>{
          obj.factor = 2500;
          obj.day = socket.getTime();
          obj.review_t = -1 * DAY_TIME;
          app.storageReview['Word'][obj.key] = obj;
        });
        app.saveReview(app.storageReview);
        this.initSetting();
      }
    });
  }

  renderFlashSetting() {
    if (this.state.isSetting == false) return null;
    return (
      <View style={styles.flashSettingBack}>
        <PanButton name={'b_flashcard_setting'} style={{flex: 1,}} onPress={this.onHiddenSetting.bind(this)} />
        <Animated.View name={'v_flashcard_setting'} style={[styles.flashSetting, {height: this.state.height}]}>
          <PanView style={[styles.setDisplay, styles.bottomLine]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Display in</Text>
            <View style={[styles.setButtonList, styles.setButtonListRadius]}>
              <PanButton name={'b_flashcard_setting_c'} style={[styles.setButton, {backgroundColor: this.displayKind==1?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeDisplay.bind(this, 1)} >
                <Text style={styles.setFont}>Chinese</Text>
              </PanButton>
              <PanButton name={'b_flashcard_setting_e'} style={[styles.setButton, {backgroundColor: this.displayKind==2?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeDisplay.bind(this, 2)} >
                <Text style={styles.setFont}>English</Text>
              </PanButton>
              <PanButton name={'b_flashcard_setting_py'} style={[styles.setButton, {backgroundColor: this.displayKind==3?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeDisplay.bind(this, 3)} >
                <Text style={styles.setFont}>Pinyin</Text>
              </PanButton>
            </View>
          </PanView>
          <PanView style={[styles.setDisplay, styles.bottomLine]} name={'v_flahs_set'} >
              <Text style={styles.setFont}>Default number: {this.defaultNum}</Text>
              <Slider value={this.defaultNum} onValueChange={this.changeDefaultNum.bind(this)} minimumValue={this.minNum} maximumValue={this.maxNum} step={1} />
          </PanView>
          <PanView style={[styles.setAudio, styles.bottomLine]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Audio auto play</Text>
            <Switch value={this.blnAuto} onValueChange={this.changeAuto.bind(this)}/>
          </PanView>
          <PanView style={[styles.setFocuse, ]} name={'v_flahs_set'} >
            <Text style={styles.setFont}>Focused on</Text>
            <View style={styles.setButtonList}>
              <PanButton name={'b_flashcard_setting_c'} style={[styles.setButton2, {backgroundColor: this.focusedC?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeFocused.bind(this, 1)} >
                <Text style={styles.setFont}>Character</Text>
              </PanButton>
              <PanButton name={'b_flashcard_setting_e'} style={[styles.setButton2, {backgroundColor: this.focusedW?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeFocused.bind(this, 2)} >
                <Text style={styles.setFont}>Word</Text>
              </PanButton>
              <PanButton name={'b_flashcard_setting_py'} style={[styles.setButton2, {backgroundColor: this.focusedS?'#6DCFC9':'#FFFFFF'}]} onPress={this.changeFocused.bind(this, 3)} >
                <Text style={styles.setFont}>Sentence</Text>
              </PanButton>
            </View>
          </PanView>
        </Animated.View>
      </View>
    );
  }
  changeAuto(value) {
    this.blnAuto = value;
    this.Refresh();
  }
  changeDefaultNum(value) {
    this.defaultNum = value
    this.Refresh();
  }
  changeDisplay(kind) {
    this.displayKind = kind,
    this.Refresh();
  }
  changeFocused(kind) {
    var num = 0;
    var list = app.storageCardInfo.learnCards;
    if (this.focusedC && list.ziKey.length > 0) num += 1;
    if (this.focusedW && list.ciKey.length > 0) num += 1;
    if (this.focusedS && list.juKey.length > 0) num += 1;

    if (kind == 1) {
      if (list.ziKey.length == 0) {
        this.focusedC = !this.focusedC;
      } else {
        if (this.focusedC && num == 1) return;
        this.focusedC = !this.focusedC;
      }
    } else if (kind == 2) {
      if (list.ciKey.length == 0) {
        this.focusedW = !this.focusedW;
      } else {
        if (this.focusedW && num == 1) return;
        this.focusedW = !this.focusedW;
      }
    } else if (kind == 3) {
      if (list.juKey.length == 0) {
        this.focusedS = !this.focusedS;
      } else {
        if (this.focusedS && num == 1) return;
        this.focusedS = !this.focusedS;
      }
    }
    this.getMaxNum();
    if (this.defaultNum < this.minNum) {
      this.defaultNum = this.minNum;
    }
    if (this.defaultNum > this.maxNum) {
      this.defaultNum = this.maxNum;
    }
    this.Refresh();
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
      this.hidden();
    } else {
      if (this.testObj && this.blnPlayAudio) {
        app.stopSound('pyAudio/'+this.testObj.play, 'play');
      }
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
    var list = [];
    if (app.storageCardInfo) {
      list = app.storageCardInfo.learnCards;
    }
    return (
      <Animated.View style={[styles.flashMenu, {left}]}>
        <PanView name={'v_flashcard_m_SRS'} style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
          <PanButton name={'b_flashcard_menu'} style={styles.fmButton} onPress={this.showTest.bind(this)}>
            <Text style={styles.fmSRS}>SRS</Text>
          </PanButton>
        </PanView>
        <PanView name={'v_flashcard_m_msg'} style={[styles.fmList, ]}>
          <DoubleText num={list.juKey.length}/>
          {this.renderPlus()}
          <DoubleText name={"Word"} num={list.ciKey.length} color={'#CDECBE'} />
          {this.renderPlus()}
          <DoubleText name={"Character"} num={list.ziKey.length} color={'#F9DFBB'} />
        </PanView>
        <PanView name={'v_flashcard_m_chart'} style={[styles.fmChart, ]}>
          {this.renderKeyNum()}
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
    this.Refresh();
    Animated.timing(
      this.state.moveX,
      {
        toValue: 1,
        duration: 300,
      }
    ).start(()=>{
      this.changeStatus('test');
      this.autoPlaySound();
    });
  }
  autoPlaySound() {
    if (this.blnAuto) {
        if (this.reviewList.length != 0) {
          var obj = this.reviewList[this.testIndex];
          this.playSound(obj.play);
        }
      }
  }
  getReviewList() {
    var _reviewList = [];
    var json = socket.getReviewList(this.focusedC, this.focusedW, this.focusedS);
    var list = json.list;
    if (list.length == this.defaultNum) {
      _reviewList = list;
    } else {
      _reviewList = list.slice(0, this.defaultNum);
    }
    return _reviewList;
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
  renderKeyNum() {
    var max = 0;
    this.keyNum.forEach((num)=>{
      if (max<num) max = num;
    });
    if (max == 0) max = 1;
    var Height = ScreenHeight*0.2;
    return (
      <PanView name='v_flashcard_key_num' style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center',}}>
        <Icon name="smile-o" size={MinUnit*2} color={'#A4CB67'} style={{marginTop: MinUnit*6}} />
        <BarShowNum color={'#C8CB7D'} height={Height*this.keyNum[2]/max} num={this.keyNum[2]}/>
        <BarShowNum color={'#D4CF9C'} height={Height*this.keyNum[3]/max} num={this.keyNum[3]}/>
        <BarShowNum color={'#E3DEC9'} height={Height*this.keyNum[4]/max} num={this.keyNum[4]}/>
        <BarShowNum color={'#EACFC7'} height={Height*this.keyNum[0]/max} num={this.keyNum[0]}/>
        <BarShowNum color={'#DDB0C7'} height={Height*this.keyNum[1]/max} num={this.keyNum[1]}/>
        <Icon name="frown-o" size={MinUnit*2} color={'#CD9FDD'} style={{marginTop: MinUnit*6}} />
      </PanView>
    );
  }
  renderTest() {
    var left = this.state.moveX.interpolate({
      inputRange: [0, 1],
      outputRange: [FlashWidth, 0]
    });
    if (this.reviewList.length == 0) {
      if (this.reviewNum == 0) {
        return (
          <Animated.View style={[styles.flashTest, {left}]}>
            <Text>当前没有可复习的题目</Text>
          </Animated.View>
        );
      }
      return (
        <Animated.View style={[styles.flashTest, {left}]}>
          {this.renderKeyNum()}
        </Animated.View>
      );
    }
    if (this.reviewList.length != 0) {
      var obj = this.reviewList[this.testIndex];
      this.testObj = obj;
      var _question = obj.zx;
      var _answer1 = obj.py;
      var _answer2 = obj.yx_e;
      if (this.displayKind == 2) {
        _question = obj.yx_e;
        _answer1 = obj.zx;
        _answer2 = obj.py;
      } else if (this.displayKind == 3) {
        _question = obj.py;
        _answer1 = obj.zx;
        _answer2 = obj.yx_e;
      }
    }
    return (
      <Animated.View style={[styles.flashTest, {left}]}>
        <PanView name={'v_flashcard_test_question'} style={styles.fTQuestion} >
          <View style={[{height: MinUnit*5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: MinUnit}, ]}>
            <View style={{width: MinUnit*5}} />
            <Text style={{fontSize: MinUnit*2.6, color: '#E1E1E1'}} >{this.testIndex+1}/{this.reviewList.length}</Text>
            <IconButton name={'volume-up'} size={MinUnit*4} color={'#E1E1E1'} onPress={this.playSound.bind(this, obj.play)} />
          </View>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
            <Text style={{fontSize: MinUnit*3, color: '#FFFFFF'}}>{_question}</Text>
          </View>
        </PanView>
        <PanView name={'v_flashcard_test_answer'} style={styles.fTAnswer} >
          <Animated.View style={[styles.fTMoveAnswer, {top: this.state.answerY}]}>
            <Text style={{fontSize: MinUnit*3, color: '#000000'}}>{_answer1}</Text>
            <Text style={{fontSize: MinUnit*3, color: '#000000'}}>{_answer2}</Text>
          </Animated.View>
        </PanView>
        {this.renderButtonShow()}
        {this.renderButtonYesOrNo()}
        {this.renderButtonRight()}
        {this.renderButtonWrong()}
      </Animated.View>
    );
  }
  playSound(name) {
    this.playAudio(name, (msg)=>{
      if (msg == 'fail') {
        Alert.alert('警告','没有声音数据');
      }
    });
  }
  renderButtonShow() {
    if (this.state.showKind != 1) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onShowAnswer.bind(this)} />
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onShowAnswer.bind(this)} />
      </PanView>
    );
  }
  onShowAnswer() {
    Animated.timing(
      this.state.answerY,
      {
        toValue: 0,
        duration: 200,
      }
    ).start(()=>{
      this.setState({
        showKind: 2 
      });
    });
  }
  renderButtonYesOrNo() {
    if (this.state.showKind != 2) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onChangeRightOrWrong.bind(this, 'right')}>
          <Text>Right</Text>
        </PanButton>
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onChangeRightOrWrong.bind(this, 'wrong')}>
          <Text>Wrong</Text>
        </PanButton>
      </PanView>
    );
  }
  onChangeRightOrWrong(str) {
    if (str == 'right') {
      var obj = this.reviewList[this.testIndex];
      this.flashTime = socket.getReviewT(obj.day, obj.factor, obj.review_t);
      this.setState({
        showKind: 3
      });
    } else if (str == 'wrong') {
      this.setState({
        showKind: 4
      });
    }
  }
  renderButtonRight() {
    if (this.state.showKind != 3) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV1} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onRememberPress.bind(this, 2)}>
          <Text>Remembered Perfectly + {this.flashTime[0]}</Text>
        </PanButton>
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onRememberPress.bind(this, 3)}>
          <Text>Remembered + {this.flashTime[1]}</Text>
        </PanButton>
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onRememberPress.bind(this, 4)}>
          <Text>Barely Remembered + {this.flashTime[2]}</Text>
        </PanButton>
      </PanView>
    );
  }
  renderButtonWrong() {
    if (this.state.showKind != 4) return null;
    return (
      <PanView name={'v_flashcard_test_button'} style={styles.fTButtonV} >
        <PanButton name={'v_flashcard_test_left'} style={styles.fTButton} onPress={this.onRememberPress.bind(this, 0)} >
          <Text>Almost Remembered</Text>
        </PanButton>
        <PanButton name={'v_flashcard_test_right'} style={styles.fTButton} onPress={this.onRememberPress.bind(this, 1)} >
          <Text>Don't know</Text>
        </PanButton>
      </PanView>
    );
  }
  onRememberPress(kind) {
    var obj = this.reviewList[this.testIndex];
    if (obj.keyList == null) {
      obj.keyList = [0, 1, 2, 3, 4];
      obj.keyList.forEach((key)=>{
        obj.keyList[key] = 0;
      })
    }
    obj.lastKey = kind;
    obj.keyList[kind] += 1;
    this.keyNum[kind] += 1;
    if (kind == 1) {
      // Again
      if (obj.blnAgain == false) {
        obj.factor -= 200;
        obj.blnAgain = true;
      }
    } else if (kind == 0) {
      // wrong +1
      obj.factor -= 200;
      obj.day = socket.getTime();
      obj.review_t = DAY_TIME;
    } else {
      // 正确的处理
      var list = socket.getReviewT(obj.day, obj.factor, obj.review_t);
      var c_factor = [150, 0, -150]
      obj.factor += c_factor[kind - 2];
      obj.day = socket.getTime();
      obj.review_t = list[kind - 2]*DAY_TIME;
    }
    if (obj.factor < 1300) {
      obj.factor = 1300;
    }
    app.saveReview(app.storageReview);
    if (kind == 1) {
      // Again处理，复习下一个
      this.testIndex += 1;
    } else {
      this.reviewList.splice(this.testIndex, 1);
    }
    if (this.testIndex >= this.reviewList.length) {
      this.testIndex = 0;
    }
    this.state.answerY.setValue(0 - ScreenHeight*0.3);
    this.autoPlaySound();
    this.setState({
      showKind: 1,
    });
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

class MicorphoneVolume extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      volume: 0
    };
  }
  changeVolume(_num) {
    this.setState({
      volume: _num,
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState != this.state) return true;
    return false;
  }
  render() {
    return (
      <Progress.Circle  thickness={MinUnit*0.5} borderWidth={0} style={{position:'absolute',left:0,top:0}}
                                        progress={Number(this.state.volume)} size={MinUnit*7} color="#1BA2FF" />
    );
  }
}
// 字，词，句记忆资料卡
class CardBox extends Box {
  static propTypes = {
    kind: React.PropTypes.string,
    list: React.PropTypes.array,      //key数组[]
    blnRight: React.PropTypes.bool,   //是否右上方按钮
  };
  static defaultProps = {
    kind: 'Character',
    blnRight: true,
  }
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      blnRefresh: true,
      blnWait: true,
    };
    this.initialize();
  }
  Refresh() {
    this.setState({
      blnRefresh: !this.state.blnRefresh,
    });
  }
  changeVolume(_num) {
    if (this.refs.MicorphoneVolume) {
      this.refs.MicorphoneVolume.changeVolume(_num);
    }
  }
  initialize() {
    this.jsonList = null;
    this.selectData = null,
    this.selectId = 0;

    this.blnRecord = false;
    this.pcResult = null;

    this.blnShowPlay = false;
    this.blnPlay = true;
    this.playKind = 0;

    this.num = 0;
    this.changeVolume(0);
  }
  release() {
    this.initialize();
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows([]),
      blnWait: true,
    });
    this.stopPlay();
  }
  render() {
    var _name = this.props.kind + ' Review';
    console.log('blnRecord: '+this.blnRecord);
    return (
      <PopupBox ref={'PopupBox'} name={_name}
        leftIconName={'close'} onLeftPress={()=>{this.hidden();this.stopPlay();app.onStopChivox();}} 
        rightIconName={this.props.blnRight?'pencil-square-o':''} onRightPress={this.onPracticePress.bind(this)}
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
  onShowTree() {
    this.stopPlay();
    if (this.props.kind == 'Character') {
      Home.searchWord = this.selectData.character;
      Home._onPressTreeZ();
    } else if (this.props.kind == 'Word') {
      Home.searchWord = '打';
      Home._onPressTreeC();
    }
  }
  renderButton() {
    var width = MinUnit*7;
    return (
      <View style={[{flexDirection: 'row', justifyContent: 'space-between',}, ]} >
        <CircleIcon
          name={'sitemap'} 
          size={MinUnit*5} 
          color={'#F6F6F6'} 
          backStyle={[styles.microphone, {backgroundColor:"#00BBD5",}]} 
          onPress={this.onShowTree.bind(this)} />
        <CircleIcon
          name={'microphone'} 
          size={MinUnit*5} 
          color={'#F6F6F6'} 
          backStyle={[styles.microphone, {backgroundColor:this.blnRecord?"#CAD500":"#00BBD5",}]} 
          onPress={this.onRecordKey.bind(this)}>
          {this.blnRecord && <MicorphoneVolume ref={'MicorphoneVolume'} />}
        </CircleIcon>
        {this.blnShowPlay && 
          <CircleIcon name={this.blnPlay?'pause-circle':'play-circle'} size={MinUnit*5} color={'#F6F6F6'} backStyle={styles.microphone} onPress={this.onPlayKey.bind(this)} >
          </CircleIcon>}
        {!this.blnShowPlay && <View style={{width}} />}
      </View>
    );
  }
  // 录音按钮
  onRecordKey() {
    if (this.blnRecord == false) {
      this.stopPlay();
      // 开启语音评测
      if (this.selectData.pc == null) {
        Alert.alert(
          '警告',
          '没有评测信息',
        );
        return;
      }
      let param = {
        gategory: 'word',
        text: this.selectData.pc,
        audioName: 'flash',
      }
      app.onStartChivox(param, (data)=>{
        switch (data.type) {
          case 'volume':
            // console.log("获得音量回调:",data.volume)
            this.pcResult = null;
            if (this.blnRecord == false) {
              this.blnRecord = true;
              this.Refresh();
            }
            if (data.volume < 0.01) {
              data.volume = 0.01
            }
            this.changeVolume(data.volume);
            break;
          case 'result':
            // console.log("得到评测结果:", data.result.details);
            var result = data.result.details;
            result.forEach((_data)=>{
              let toneStr = ["轻声","一声","二声","三声","四声"]
              var str = '声母：' + _data.phoneScores.sm;
              str += ' 韵母：' + _data.phoneScores.ym;
              if(_data.originalTone != _data.recordTone){
                str += " 声调读的不准 (将"+toneStr[_data.originalTone]+"读成"+toneStr[_data.recordTone]+")"
              } else {
                str += ' 声调：100';
              }
              this.pcResult = str;
            });
            this.stopRecord();
            break;
          case 'error':
            this.pcResult = '评测出错：'+data.error;
            // console.log("评测出错:", data.error)
            // Alert.alert(
            //   '警告',
            //   '启动失败，请稍后',
            // );
            this.stopRecord(1);
            break;
          case 'working':
            // console.log("工作ing:", data.working)
            break;
        }
      });
    } else {
      // 手动停止评测
      app.onStopChivox();
    }
  }
  stopRecord(kind = 0) {
    this.blnRecord = false;
    this.changeVolume(0);
    if (kind == 0) {
      this.blnShowPlay = true;
      this.blnPlay = true;
      this.playSound(0);
    }
    this.Refresh();
  }
  // 播放按钮
  onPlayKey() {
    this.blnPlay = !this.blnPlay;
    if (this.playKind == 0) {
      this.playSound(0);
    } else if (this.playKind == 1) {
      this.playSound(0);
    } else if (this.playKind == 2) {
      this.playSound(1);
    }
    this.Refresh();
  }
  // 播放功能
  playSound(kind) {
    if (this.blnSleep) return;
    if (kind == 0) {
      this.playKind = 1;
      if (this.selectData && this.selectData.play) {
        this.playAudio(this.selectData.play, (result)=>{
          var bln = false;
          if (result == 'fail') {
            bln = true;
          } else {
            if (result.type == 'playEnd' || result.type == "initError") {
              bln = true;
            } else if (result.type == 'cTime') {
              // this.refs.playProgress.changeVolume(result.message);
            }
          }
          if (bln) {
            this.playSound(1);
          }
        });
      } else {
        this.playSound(1);
      }
    } else {
      this.playKind = 2;
      app.onPlaySound('flash.wav', (result)=>{
        if (result.type == 'playEnd' || result=='initError'){
          this.playKind = 0;
          this.blnPlay = false;
          // this.refs.playProgress.changeVolume(0);
          this.Refresh();
        } else if (result.type == 'cTime') {
          // this.refs.playProgress.changeVolume(result.message);
        }
      }, 'flash', {mainPath: 'CACHES'});
    }
  }
  stopPlay() {
    if (this.playKind == 1) {
      if (this.blnPlayAudio) {
        app.stopSound('pyAudio/'+this.selectData.play, 'play');
        app.releaseSound('pyAudio/'+this.selectData.play);
      }
    } else if (this.playKind == 2) {
      app.stopSound('flash.wav', 'flash');
      app.releaseSound('flash.wav');
    }
    this.playKind = 0;
    this.blnPlay = false;
  }

  onPracticePress() {
    var practiceList = [];
    if (this.props.kind == 'Character') {
      var _ziKey = app.storageCardInfo.learnCards.ziKey[this.selectId];
      var list = app.storageCardInfo.cardQuestion.ziCards[_ziKey];
      practiceList = this.randomList(list);
    } else if (this.props.kind == 'Word') {
      var _ciKey = app.storageCardInfo.learnCards.ciKey[this.selectId];
      var list = app.storageCardInfo.cardQuestion.ciCards[_ciKey];
      practiceList = this.randomList(list);
    } else if (this.props.kind == 'Sentence') {

    }
    var practices = this.getPracticesList(practiceList);

    //开始练习
    app.setNextRouteProps({
      questionData:practices,
    });
    Home.props.navigator.push(app.getRoute("Practice"));
  }

  getPracticesList(_list) {
    var practices = []
    var json = {
      lessonId: -1,
      data: null
    };
    _list.forEach(function(_json) {
      if (_json.lessonId != json.lessonId) {
        json.lessonId = _json.lessonId;
        json.data = app.allLessonData[_json.lessonId];
      }
      var _chapter = json.data['chapters'][_json.chapterId];
      var _practice = _chapter['practices'][_json.practiceId];
      practices.push(_practice);
    });
    return practices;
  }
  randomList(_list) {
    if (_list.length <= 15) return _list;

    var array = _list;
    var list = [];
    for (var i=0;i<15;i++) {
      var index = Math.floor((Math.random()*array.length));
      list.push(array[index]);
      array.splice(index, 1);
    }

    list.sort((a, b)=>{
      if (a.lessonId != b.lessonId) {
        return a.lessonId - b.lessonId;
      }
      if (a.chapterId != b.chapterId) {
        return a.chapterId - b.chapterId;
      }
      if (a.practiceId != b.practiceId) {
        return a.practiceId - b.practiceId;
      }
    });
    return _list;
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
    var _name = null;
    if (this.selectData) {
      _name = this.selectData.character;
    }
    console.log('renderCharacter: '+_name);
    return (
      <PanView name={'v_characterBox'} style={styles.character}>
        <PanView name={'v_characterBox_c'} style={[styles.c_view, ]}>
          <DrawWord 
            curWidth={MinUnit*20} blnTouch={false} fillArray={['#62DC51', '#DC9069', '#8D7ADC']} 
            data={{
            path: webData.CACHES + '/mhJson',
            name: _name,
            uri: 'http://192.169.1.19:8080/ChineseSkill/miaohongSrc/'}}
            showAll={true} />
          <View style={[{height: MinUnit*3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }]} >
            <View style={{flexDirection: 'row'}}>
              <View style={{backgroundColor: '#DC9069', width:MinUnit*1.4, height: MinUnit*1.4, borderRadius: MinUnit*0.7, marginHorizontal: MinUnit*0.5}} />
              <Text>表音</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
            <View style={{backgroundColor: '#62DC51', width:MinUnit*1.4, height: MinUnit*1.4, borderRadius: MinUnit*0.7, marginHorizontal: MinUnit*0.5}} />
            <Text>表意</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
            <View style={{backgroundColor: '#8D7ADC', width:MinUnit*1.4, height: MinUnit*1.4, borderRadius: MinUnit*0.7, marginHorizontal: MinUnit*0.5}} />
            <Text>表记号</Text>
            </View>
          </View>
        </PanView>
        <View style={[styles.cMsg_view, ]}>
          <View style={{height: MinUnit*2, alignItems: 'center',}}>
            <Text style={{fontSize: MinUnit*1.2, color: '#DC915C'}}>{this.pcResult?this.pcResult:''}</Text>
          </View>
          <View style={{height: MinUnit*5, alignItems: 'center',}}>
            <Text style={{fontSize:MinUnit*4}}>{this.selectData?this.selectData.pyin:''}</Text>
          </View>
          <View style={[{height: MinUnit*4, marginVertical:MinUnit*2, alignItems: 'center',}, ]}>
            <Text style={{fontSize:MinUnit*1.5, color: '#747474'}}>{this.selectData?this.selectData.yxstr:''}</Text>
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
          <Text style={{fontSize:MinUnit*2}}>{this.selectData?this.selectData.pyin:''}</Text>
        </View>
        <View style={{height: MinUnit*4, marginVertical:MinUnit*0.5, alignItems: 'center',}}>
          <Text style={{fontSize:MinUnit*3, color: '#00B8D2'}}>{this.selectData?this.selectData.character:''}</Text>
        </View>
        <View style={[{height: MinUnit*4, marginVertical:MinUnit, alignItems: 'center',}, ]}>
          <Text style={{fontSize:MinUnit*1.5, color: '#747474'}}>{this.selectData?this.selectData.yxstr:''}</Text>
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
      <ListItem name={this.props.kind} kind={this.props.kind} rowId={parseInt(r_id)} data={data} onPress={this.changeItem.bind(this, data, r_id)} />
    );
  }
  changeItem(data, id) {
    this.selectData = data;
    this.blnShowPlay = false;
    this.pcResult = '';
    this.selectId = id;
    this.stopPlay();
    this.Refresh();
  }
  showEnd(bln) {
    var data = null;
    if (this.props.list) {
      data = this.props.list;
    } else {
      if (this.props.kind == 'Character') {
        data = app.storageCardInfo.learnCards.ziKey;
      } else if (this.props.kind == 'Word') {
        data = app.storageCardInfo.learnCards.ciKey;
      } else if (this.props.kind == 'Sentence') {
        data = app.storageCardInfo.learnCards.juKey;
      }
    }
    var list = [];
    this.jsonList = data;
    data.forEach((key)=>{
      if (app.storageReview == null) {
        list.push(key);
      } else {
        if (app.storageReview[this.props.kind][key] == null) {
          list.push(key);
        }
      }
    });
    if (list.length == 0) {
      this.timer = setTimeout(this.getCharacterMsg.bind(this), 500);
      return;
    }
    socket.getCardMsg(this.props.kind, list, (msg)=>{
      if (msg == 'fail') {
        this.setState({
          blnWait: false,
        });
        Alert.alert(
          '失败',
          '服务器连接失败，请稍后再试',
        );
        this.timer = setTimeout(this.getCharacterMsg.bind(this), 500);
      }
    },(json)=>{
      if (json.data != '失败') {
        if (app.storageReview == null) {
          app.storageReview = {};
          app.storageReview['Character'] = {};
          app.storageReview['Word'] = {};
          app.storageReview['Sentence'] = {};
        }
        json.data.forEach((obj)=>{
          obj.factor = 2500;
          obj.day = socket.getTime();
          obj.review_t = -1 * DAY_TIME;
          app.storageReview[json.msg][obj.key] = obj;
        });
        app.saveReview(app.storageReview);
        this.timer = setTimeout(this.getCharacterMsg.bind(this), 500);
      }
    });
  }
  hiddenEnd(bln) {
    app.onCancelChivox();
    this.release();
    this.Refresh();
  }
  getCharacterMsg(json) {
    var array = [];
    for (var i=0;i<this.jsonList.length;i++) {
      if (app.storageReview == null) return;
      var obj = app.storageReview[this.props.kind][this.jsonList[i]];
      if (obj == null) continue;
      var _str = obj['yx_c'];
      if (obj['yx_e'] != null) {
        _str = obj['yx_e'];
      }
      var lastKey = -1;
      if (obj.lastKey != null) {
        lastKey = obj.lastKey;
      }
      var _obj = {
        character: obj['zx'],
        pyin: obj['py'],
        yxstr: _str,
        lastKey: lastKey,
        pc: obj['pc'],
        play: obj['play'],
      };
      array.push(_obj);
    }
    if (array[0] != null) {
      this.selectData = array[0];
    }
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(array),
      blnWait: false,
    });
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
  shouldComponentUpdate(nextProps, nextState) {
    var str1 = JSON.stringify(nextProps);
    var str2 = JSON.stringify(this.props);
    if (str1 != str2) return true;
    return false;
  }
  render() {
    console.log('renderListItem');
    if (this.props.kind == 'Sentence') {
      return this.renderSentenceListItem();
    }
    var _str = ''+this.props.rowId;
    var fontSize = MinUnit* (1.4 - _str.length*0.15);
    if (fontSize < MinUnit*0.8) fontSize = MinUnit;
    var backColor = '#000000';
    var lastKey = this.props.data.lastKey;
    if (lastKey==0 || lastKey==1) {
      backColor = '#DF3F44';
    } else if (lastKey >= 2) {
      backColor = '#6EDF70';
    }
    return (
      <PanButton name={'b_listItem_'+this.props.name+'_'+this.props.rowId} style={styles.listItem} onPress={this.props.onPress} >
        <View style={[styles.listIndexView, {backgroundColor: backColor}]}>
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
        {this.props.children}
      </PanButton>
    );
  }
}
class BarShowNum extends Component {
  static defaultProps = {
    height: 5,
    color: '#C4E6D3',
    num: 5
  };
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
  render() {
    return (
      <View style={[styles.barNum, styles.center]}>
        <View style={[styles.bar, {height: this.props.height, backgroundColor: this.props.color,}]} />
        <View style={{flex: 1,}}/>
        <View style={{backgroundColor: this.props.color, width:MinUnit,height:MinUnit,borderRadius:MinUnit*0.5}}/>
        <Text style={{textAlign: 'center', color: '#C7C7C7'}}>{this.props.num}</Text>
      </View>
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
        color={this.props.color}>
        {this.props.children}
      </IconButton>
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
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
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
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
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
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
  },
  fTMoveAnswer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ScreenHeight*0.15,
    top: 0 - ScreenHeight*0.15,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setFocuse: {
    height: MinUnit*7.5,
    paddingHorizontal: MinUnit,
    justifyContent: 'center',
  },
  setFont: {
    fontSize: MinUnit*1.5,
    color: '#424242',
  },
  setButtonList: {
    height: MinUnit*2.8,
    marginTop: MinUnit*0.5,
    overflow: "hidden",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setButtonListRadius: {
    borderWidth: MinWidth,
    borderColor: '#6DCFC9',
    borderRadius: MinUnit*1.4,
  },
  setButton: {
    flex: 1,
    height: MinUnit*3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: MinWidth,
    borderColor: '#6DCFC9',
  },
  setButton2: {
    flex: 1,
    height: MinUnit*3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MinUnit*0.5,
  },
  barNum: {
    width: MinUnit*2.5,
    marginHorizontal: MinUnit*2,
    height: ScreenHeight*0.25,
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: MinUnit*3,
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