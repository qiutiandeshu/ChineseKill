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
const size = MinUnit*3.5;
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
    showAnimatedEnd: React.PropTypes.func, //进场动画是否结束
    hiddenAnimatedEnd: React.PropTypes.func, //出场动画是否结束
    backPress: React.PropTypes.func, //
	};
	static defaultProps = {
	  blnShow: false,
	  width: ScreenWidth*0.54,
	  height: ScreenHeight*0.86,
	  tipStyle: {},
	  name: 'NAME',
	  onLeftPress: ()=>{},
	  onRightPress: ()=>{},
    onRightPressMeasure: (ox, oy, width, height, px, py)=>{},
    showAnimatedEnd: (bln)=>{},
    hiddenAnimatedEnd: (bln)=>{},
    backPress: ()=>{}
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
      <View name={this.props.name} style={[styles.container, {backgroundColor: '#00000078'}]}>
        <PanButton name={'b_popupBox_back'} style={styles.container} />
      	<Animated.View style={[styles.frame, {width:this.props.width, height: this.props.height, top: this.state.top}]}>
      		<PanView name="v_popupTop" style={[styles.top]}>
      			{this.renderLeftIcon()}
      			<Text style={styles.name}>
      				{this.props.name}
      			</Text>
      			{this.renderRightIcon()}
      		</PanView>
	      	{this.props.children}
      	</Animated.View>
      </View>
    );
  }
  renderLeftIcon() {
  	if (this.props.leftIconName && this.props.leftIconName!='') {
  		return (
  			<PanButton name="PopupLeftI" onPress={this.props.onLeftPress} style={styles.lrIconView} >
  				<Icon name={this.props.leftIconName} size={size}/>
  			</PanButton>
			);
  	} else {
  		return (<View style={styles.lrIconView}/>);
  	}
  }
  renderRightIcon() {
  	if (this.props.rightIconName && this.props.rightIconName!='') {
  		return (
        <View style={styles.lrIconView} ref={'right'} >
    			<PanButton name="PopupRightI" onPress={this.onRightPress.bind(this)} style={styles.lrIconView} >
    				<Icon name={this.props.rightIconName} size={size}/>
    			</PanButton>
        </View>
			)
  	} else {
  		return (<View style={styles.lrIconView}/>);
  	}
  }
  onRightPress() {
    this.refs.right.measure((ox, oy, width, height, px, py)=>{
      this.props.onRightPress();
      this.props.onRightPressMeasure(ox, oy, width, height, px, py);
    });
  }
  show() {
  	this.changeState(true);
  	Animated.timing(
  		this.state.top,
      {
      	toValue: (ScreenHeight - this.props.height)/2,
      	duration: 300,
      },
    ).start(this.showEnd.bind(this));
  }
  showEnd() {
    this.props.showAnimatedEnd(true);
  }
  hidden() {
  	Animated.timing(
  		this.state.top,
      {
      	toValue: ScreenHeight,
      	duration: 300,
      },
    ).start(this.hiddenEnd.bind(this));
  }
  hiddenEnd() {
    this.changeState(false); 
    this.props.hiddenAnimatedEnd(true);
  }
  changeState(bln) {
  	this.setState({
  		blnShow: bln
  	});
  }
}

const styles = StyleSheet.create({
	container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: ScreenWidth,
    height: ScreenHeight,
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
		fontSize: MinUnit*2,
    fontWeight: 'bold',
	},
  lrIconView: {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  }
});


export default PopupBox;