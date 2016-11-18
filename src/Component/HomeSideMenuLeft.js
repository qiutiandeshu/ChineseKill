/**
 * Created by tangweishu on 16/9/18.
 */
import React, {Component, PropTypes} from 'react'
import {View,Text, StyleSheet, Animated} from 'react-native'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

var Box = require('./Box.js');
export default class HomeSideMenuLeft extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }
    static propTypes = {
        onCancel:React.PropTypes.func.isRequired,
        sideMenuAnim:React.PropTypes.object,
    };
    static defaultProps = {

    };
    renderTips=()=>{

    }
    render(){ 
        const left = this.props.sideMenuAnim.interpolate({
            inputRange:[0,1],
            outputRange:[-ScreenWidth*0.25,0]
        })
        return (
            <PanView name = "HomeSideMenuLeft" style={styles.container} >
                <Animated.View style={[styles.content,UtilStyles.grayBackColor,{left}]}>
                    {this.renderTitle()}
                    {this.renderUserInfo()}
                    {this.renderMemoryMenu()}
                </Animated.View>
                <Box.SettingBox ref={'Setting'} />
                <Box.LoginBox ref={'Login'} />
            </PanView>
        );
    }
    _onCloseSideMenu = ()=>{        
        this.props.onCancel();
    }
    renderTitle = ()=>{
        return(
            <View style={[styles.menuTitleView, UtilStyles.bottomLine]}>
                <PanButton name="btnMenuLeftBack" onPress={this._onCloseSideMenu.bind(this)}>
                    <Icon name="angle-left" size={IconSize}/>
                </PanButton>
                <PanButton name="btnMenuLeftSet" onPress={this._onPopupBoxShow.bind(this, "Setting")}>
                    <Icon name="cog" size={IconSize}/>
                </PanButton>
            </View>
        );       
    }
    // 控制弹出框显示
    _onPopupBoxShow = (name)=>{
        this.refs[name].show();
    }

    // 用户头像，登陆
    renderUserInfo = ()=>{
        return (
            <PanView name='v_userInfo' style={[styles.userInfo, ]}>
                <PanButton name='b_userHead' onPress={this._onPopupBoxShow.bind(this, "Login")}>
                    <Icon name="user-circle" size={MinUnit*8}/>
                </PanButton>
                <PanButton name='b_userSign' onPress={this._onPopupBoxShow.bind(this, "Login")}>
                    <LineText />
                </PanButton>
            </PanView>
        );
    }
    // 记忆库信息
    renderMemoryMenu = ()=>{
        return (
            <PanView name='memoryMenu' style={[styles.memoryMenu, ]}>
            </PanView>
        );
    }
}

// 下方标有直线的Text（跟带下滑线的text不同）
class LineText extends Component {
    static propTypes = {
      fontSize: React.PropTypes.number,
      color: React.PropTypes.string,
      word: React.PropTypes.string,
      lineDis: React.PropTypes.number,
    };
    static defaultProps = {
      fontSize: MinUnit*2,
      color: "#737373",
      word: 'Sign In/Sign Up',
      lineDis: 3*MinWidth,
    };
    render() {
        return (
            <View>
                <Text style={[styles.lineText, {fontSize: this.props.fontSize, color: this.props.color}]}>
                  {this.props.word}
                </Text>
                <View style={{height: MinWidth, backgroundColor: this.props.color, marginTop: this.props.lineDis}}></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
    },
    content:{       
        width:ScreenWidth*0.25,
        height:ScreenHeight,
        borderRightWidth: MinWidth,
        borderColor: '#E1E1E1'
        // alignItems:'center',
    },
    menuTitleView:{
        width:ScreenWidth*0.25,
        flexDirection: 'row',
        height: MinUnit * 6,
        paddingHorizontal: MinUnit * 2,
        justifyContent: 'space-between',
        alignItems: 'center',      
    },
    border: {
        borderColor: '#202130',
        borderWidth: MinWidth,
    },
    userInfo: {
        height: ScreenHeight/5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: MinUnit,
    },
    memoryMenu: {
        height: ScreenHeight/2,
    },
    lineText: {
        width: MinUnit*14,
    },
});