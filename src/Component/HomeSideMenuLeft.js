/**
 * Created by tangweishu on 16/9/18.
 */
import React, {Component, PropTypes} from 'react'
import {View,Text, StyleSheet, Animated, Modal, Alert} from 'react-native'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

var Box = require('./Box.js');
const LineWidth = MinUnit*14;
export default class HomeSideMenuLeft extends Component {
    constructor(props) {
        super(props);

        var bln = false;
        if (app.storageUserInfo) {
            bln = app.storageUserInfo.blnSign;
        }
        this.state = {
            blnShow: false,
            blnSign: bln,
        };
        global.HomeMenuLeft = this;
        this.blnShowBox = false;
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
            </PanView>
        );
    }
    componentWillUnmount() {
      this.timer && clearTimeout(this.timer);
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
        if (this.blnShowBox == false) {
            Home._onPopupBoxShow(name);
            this.blnShowBox = true;
            this.timer = setTimeout(()=>{this.blnShowBox = false}, 500);
        }
    }
    _onPopupBoxHidden = (name)=>{
        Home._onPopupBoxHidden(name);
    }

    // 用户头像，登陆
    renderUserInfo = ()=>{
        var _word = 'Sign In/Sign Up';
        if (this.state.blnSign) {
            _word = ''+app.storageUserInfo.username;
            if (_word.length > 15) {
                _word = _word.slice(0, 11) + '...';
            }
        }
        return (
            <PanView name='v_userInfo' style={[styles.userInfo, ]}>
                <PanButton name="b_userHead" onPress={this._onPopupBoxShow.bind(this, this.state.blnSign? "Logout":"Login")}>
                    <Icon name="user-circle" size={MinUnit*8}/>
                </PanButton>
                <PanButton name='b_userSign' onPress={this._onPopupBoxShow.bind(this, this.state.blnSign? "Logout":"Login")}>
                    <LineText word={_word} />
                </PanButton>
            </PanView>
        );
    }
    userLogin = ()=>{
        this.setState({
            blnSign: true 
        });
    }
    userLogout = ()=>{
        this.setState({
            blnSign: false
        });
    }
    // 记忆库信息
    renderMemoryMenu = ()=>{
        var card = null;
        var number = 0;
        if (app.storageCardInfo) {
            card = app.storageCardInfo.learnCards;
            var _number = card.ziKey.length+card.ciKey.length+card.juKey.length;
            number = _number;

        }
        return (
            <PanView name='memoryMenu' style={[styles.memoryMenu, ]}>
                <MemoryFrame onPress={this._onPopupBoxShow.bind(this, 'FlashCard')} number={number} />
                <MemoryFrame name={'Character'} color={'#E57C86'} number={card?card.ziKey.length:0} onPress={this._onPopupBoxShow.bind(this, "Character")} />
                <MemoryFrame name={'Word'} color={'#5ABD5A'} number={card?card.ciKey.length:0} onPress={this._onPopupBoxShow.bind(this, 'Word')} />
                <MemoryFrame name={'Sentence'} color={'#F4B460'} number={card?card.juKey.length:0} />
            </PanView>
        );
    }
}
class MemoryFrame extends Component {
    static propTypes = {
      name: React.PropTypes.string,
      color: React.PropTypes.string,
      onPress: React.PropTypes.func,
    };
    static defaultProps = {
      name: 'FlashCard',
      color: '#1A9FAA',
      number: '30',
      onPress: ()=>{console.log("onPress MemoryFrame")},
    };
    render() {
        return (
            <View style={[styles.memoryFrame, ]}>
                <PanButton name={'b_memoryIcon_'+this.props.name} style={[styles.memoryIcon, {backgroundColor: this.props.color}]} onPress={this.onPress.bind(this)} >
                </PanButton>
                <PanButton name={'b_memoryText_'+this.props.name} style={{width: LineWidth}} onPress={this.onPress.bind(this)} >
                    <View style={styles.numberView}>
                        <Text style={[styles.memoryNumber, {color: this.props.color}]} >{this.props.number}</Text>
                        <Icon name={'angle-right'} size={MinUnit*2.8} color={this.props.color} />
                    </View>
                    <LineText color={this.props.color} word={this.props.name} fontSize={MinUnit*1.3} />
                </PanButton>
            </View>
        );
    }
    onPress() {
        if (this.props.number == 0) {
            Alert.alert(
                '警告',
                '卡片数量为0，请学习后再来'
            );
        } else {
            this.props.onPress();
        }
    }
}
// 下方标有直线的Text（跟带下滑线的text不同）
class LineText extends Component {
    static propTypes = {
      fontSize: React.PropTypes.number,
      color: React.PropTypes.string,
      lineDis: React.PropTypes.number,
    };
    static defaultProps = {
      fontSize: MinUnit*1.5,
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
        height: ScreenHeight*0.6,
    },
    memoryFrame: {
        height: ScreenHeight*0.14,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memoryIcon: {
        width: MinUnit*7,
        height: MinUnit*7,
        borderRadius: MinUnit,
        marginLeft: MinUnit*2,
    },
    numberView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: MinUnit*2.5,
    },
    memoryNumber: {
        fontSize: MinUnit*3.8,
        fontWeight: "bold",
    },
    lineText: {
        width: LineWidth,
    },
});