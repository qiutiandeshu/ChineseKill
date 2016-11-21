'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  Animated,
  Text,
  Modal,
} from 'react-native';
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * 弹出框组件 <PupupBox />可直接使用，有默认props值
 * 要显示时调用 show()
 * 要隐藏时调用 hidden()
 **/
const size = MinUnit*4;
class PopupBox extends Component {
	static propTypes = {
	  blnShow: React.PropTypes.bool,	//默认初始值（隐藏/显示）
	  width: React.PropTypes.number,	//弹出框 宽
	  height: React.PropTypes.number,	//弹出框 高
	  tipStyle: React.PropTypes.object,	//上方标题样式
	  name: React.PropTypes.string,	//上方标题显示名称
	  leftIconName: React.PropTypes.string,	//左按钮名称（FontAwesome， http://fontawesome.io/icons/）
	  onLeftPress: React.PropTypes.func,	//左按钮点击触发
	  rightIconName: React.PropTypes.string,	//右按钮名称（FontAwesome， http://fontawesome.io/icons/）
	  onRightPress: React.PropTypes.func,	//右按钮触发
	};
	static defaultProps = {
	  blnShow: false,
	  width: ScreenHeight*0.8,
	  height: ScreenHeight*0.86,
	  tipStyle: {},
	  name: 'NAME',
	  onLeftPress: ()=>{console.log('onPress left')},
	  onRightPress: ()=>{console.log('onPress right')},
	};
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	blnShow: this.props.blnShow,
	  	top: new Animated.Value(0),
	  };
	  if (this.props.blnShow) {
	  	this.state.top.setValue((ScreenHeight - this.props.height)/2);
	  } else {
		  this.state.top.setValue(ScreenHeight);
		}
	}
  render() {
  	if (this.state.blnShow == false) {
  		return null;
  	}
    return (
      <Modal
        animationType={"none"}
        transparent={true}
        supportedOrientations={['landscape']}
        visible={true}>
        <PanView name={this.props.name} style={styles.container}>
        	<Animated.View style={[styles.frame, {width:this.props.width, height: this.props.height, top: this.state.top}]}>
        		<PanView name="PopupTop" style={[styles.top]}>
        			{this.renderLeftIcon()}
        			<Text style={styles.name}>
        				{this.props.name}
        			</Text>
        			{this.renderRightIcon()}
        		</PanView>
  	      	{this.props.children}
        	</Animated.View>
        </PanView>
      </Modal>
    );
  }
  renderLeftIcon() {
  	if (this.props.leftIconName) {
  		return (
  			<PanButton name="PopupLeftI" onPress={this.props.onLeftPress} >
  				<Icon name={this.props.leftIconName} size={size}/>
  			</PanButton>
			);
  	} else {
  		return (<View/>);
  	}
  }
  renderRightIcon() {
  	if (this.props.rightIconName) {
  		return (
  			<PanButton name="PopupRightI" onPress={this.props.onRightPress} >
  				<Icon name={this.props.rightIconName} size={size}/>
  			</PanButton>
			)
  	} else {
  		return (<View/>);
  	}
  }
  show() {
  	this.changeState(true);
  	Animated.timing(
  		this.state.top,
      {
      	toValue: (ScreenHeight - this.props.height)/2,
      	duration: 300,
      },
    ).start();
  }
  hidden() {
  	Animated.timing(
  		this.state.top,
      {
      	toValue: ScreenHeight,
      	duration: 300,
      },
    ).start(this.changeState.bind(this, false));
  }
  changeState(bln) {
  	this.setState({
  		blnShow: bln
  	});
  }
}

const styles = StyleSheet.create({
	container: {
    flex: 1,
		backgroundColor: '#00000078',
		alignItems: 'center',
	},
	frame: {
		top: ScreenHeight,
		backgroundColor: '#FFFFFF',
		borderRadius: MinUnit,
		overflow: 'hidden',
	},
	top: {
		height: MinUnit*5,
		borderBottomWidth: MinWidth,
		borderColor: '#CBCBCB',
		backgroundColor: '#EEEEEE',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: MinUnit*1.5,
	},
	name: {
		fontSize: MinUnit*3,
	}
});


export default PopupBox;