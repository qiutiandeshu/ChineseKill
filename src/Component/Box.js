'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';

import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import Icon from 'react-native-vector-icons/FontAwesome'
import PopupBox from '../Common/PopupBox.js'

class Box extends Component {
	show() {
		this.refs.PopupBox.show();
	}
	hidden() {
		this.refs.PopupBox.hidden();
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
	render() {
		return (
			<PopupBox ref={'PopupBox'} name={'Sign In / Sign Up'} leftIconName={'close'} onLeftPress={this.hidden.bind(this)}>
				<PanView name={'v_login'} style={styles.Login}>
	        <IconInput iconName={'envelope'} placeholder={'Email'} />
	        <IconInput iconName={'lock'} placeholder={'You password'} secureTextEntry={true} />
	        <View style={[{flex: 1,}, styles.border]}>
            <PanButton name={'b_signin'} style={styles.button}>
              <Text style={[styles.buttonWord, {color: '#FFFFFF'}]}>Sign In</Text>
            </PanButton>
	        </View>
	        <Text style={styles.msg}>
	          Login or Create a free account to save your learning progress and sync it across multidevives
	        </Text>
	      </PanView>
      </PopupBox>
		);
	}
}

// 带有图标的输入框
class IconInput extends Component {
  static propTypes = {
    iconName: React.PropTypes.string,
    iconSize: React.PropTypes.number,
  };
  static defaultProps = {
    iconName: 'envelope-o',
    iconSize: MinUnit*3,
  };
  render() {
    return (
      <View style={[styles.iconInput, ]}>
        <View style={{width: this.props.iconSize, alignItems: 'center',}}>
          <Icon name={this.props.iconName} size={this.props.iconSize} />
        </View>
        <TextInput style={styles.input} {...this.props} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    fontSize: MinUnit*1.5,
    textAlign: 'center',
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
    fontSize: MinUnit*2.5,
  },
  thirdView: {

  },
});

module.exports = {
	LoginBox,
	SettingBox,
};