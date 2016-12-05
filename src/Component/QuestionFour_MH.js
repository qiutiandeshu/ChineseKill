/**
 * Created by tangweishu on 16/11/28.
 */

import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, TextInput,} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import DrawWord from '../Common/DrawWord'
import WB from '../Utils/GetWebData'
var itemHeight = MinUnit * 7;
var curWidth = parseInt(ScreenHeight * 0.48);
export default class QuestionFour_MH extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.drawWord = null;
        this.initWriteQuestion(this.props.questionData.Q_Question)
    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired
    };
    static defaultProps = {};

    initWriteQuestion = (word)=>{

        this.character = word//..获取到要写的字
        let scaleWidth = curWidth*0.8 / 400;
        let offsetXY = curWidth*0.2 / 2;
        this.blnAutoWrite = false;
        this.blnHandWrite = false;
        this.blnSeeBack = true;
        this.blnSeeLine = true;

        //let base = require('../../data/characters/不.json')
        //var jsonStr = JSON.stringify(base.character);
        //this.character = JSON.parse(jsonStr);

        /*for(var i=0;i<this.character.length;i++){
            var points = this.character[i].points;
            for(var k=0;k<points.length;k++){
                points[k].x = points[k].x * scaleWidth + offsetXY;
                points[k].y = points[k].y * scaleWidth + offsetXY;
            }
        }*/
    }

    componentWillUpdate(nProps,nState) {
        if(nProps.questionData != this.props.questionData){
            console.log("更新了写字题")
            this.initWriteQuestion(nProps.questionData.Q_Question)
            console.log("blnAutoWrite",this.blnAutoWrite)
            if (this.blnSeeBack){
                this.setSeeBack(this.blnSeeBack);
            }
            if (this.blnSeeLine){
                this.setSeeLine(this.blnSeeLine);
            }
            this.onPressAutoWrite();
        }
    }

    componentDidMount() {
        if (this.blnSeeBack){
            this.setSeeBack(this.blnSeeBack);
        }
        if (this.blnSeeLine){
            this.setSeeLine(this.blnSeeLine);
        }
        this.onPressAutoWrite();
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderTitle()}
                {this.renderContents()}
            </View>
        )
    }

    renderTitle = ()=> {
        return (
            <Text style={[UtilStyles.fontNormal,{color:'#14838D',marginBottom:MinUnit*3}]}>
                {this.props.questionData.Q_Title}
            </Text>
        );
    }

    renderContents = ()=> {
        console.log('uri:','http://192.169.1.19:8080/ChineseSkill/miaohongSrc/'+this.character)
        return (
            <View style={styles.bodyCenterView}>
                <View style={styles.bodyMiddleLeftView}>
                    <CircleIcon
                        name='btnStrokersWritePaly'
                        onPress={this.onPressPlay.bind(this)}
                        style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}
                        iconName={'volume-up'}
                        iconSize={3}
                        iconStyle={{color: '#4C8D93'}} />
                    <CircleIcon
                        name='btnStrokersWritePop'
                        onPress={this.onPressPop.bind(this)}
                        style={[styles.btnBackView2, {borderColor: '#4C8D93'}]}
                        iconName={'leaf'}
                        iconSize={3}
                        iconStyle={{color: '#4C8D93'}} />
                </View>
                <DrawWord ref={(r)=>{this.drawWord = r}}
                          style={styles.bodyMiddleCenterView}
                          data={{path:WB.CACHES + 'mhJson',name:this.character,
                            uri:'http://192.169.1.19:8080/ChineseSkill/miaohongSrc/',
                          }}
                          firstPlay={true}
                          curWidth={curWidth}
                          blnTouch={true}
                          writeOver={this.writeOver.bind(this)}
                />
                <View style={styles.bodyMiddleRightView}>
                    <ButtonIcon ref={(r)=>{this.refAutoWrite = r}}
                                name='btnStrokersWriteAutoWrite'
                                onPress={this.onPressAutoWrite.bind(this)}
                                style={{marginTop: MinUnit*2}}
                                iconName={["play-circle-o", "pause-circle-o"]}
                                iconSize={3.5}
                                iconStyle={{color: '#4C8D93'}} />
                    <CircleIcon ref={(r)=>{this.refHandWrite = r}}
                                name='btnStrokersWriteHandWrite'
                                onPress={this.onPressHandWrite.bind(this)}
                                style={[styles.btnBackView2, {borderColor: '#4C8D93', marginTop: MinUnit*4}]}
                                iconName={["paint-brush", "paint-brush"]}
                                iconSize={3}
                                iconStyle={{color: '#4C8D93'}} />
                    <View style={{marginBottom: MinUnit*2}}>
                        <CircleIcon ref={(r)=>{this.refSeeBack = r}}
                                    name='btnStrokersWriteSeeBack'
                                    onPress={this.onPressSeeBack.bind(this)}
                                    style={[styles.btnBackView3, {borderColor: '#4C8D93'}]}
                                    iconName={["eye","eye"]}
                                    iconSize={2}
                                    iconStyle={{color: '#4C8D93'}} />
                        <CircleIcon ref={(r)=>{this.refSeeLine = r}}
                                    name='btnStrokersWriteSeeLine'
                                    onPress={this.onPressSeeLine.bind(this)}
                                    style={[styles.btnBackView3, {borderColor: '#4C8D93', marginTop: MinUnit*2}]}
                                    iconName={["fire","fire"]}
                                    iconSize={2}
                                    iconStyle={{color: '#4C8D93'}} />
                    </View>
                </View>
            </View>
        )
    }

    onPressPlay(){//播放语音

    }
    onPressPop(){

    }
    onPressAutoWrite(){//自动描红
        if (this.blnHandWrite){
            this.blnHandWrite = false;
            if (this.refHandWrite){
                this.refHandWrite.setIconIndex(0);
            }
        }
        if (!this.blnAutoWrite){
            this.blnAutoWrite = true;
            if (this.drawWord){
                this.drawWord.setArrowShow(false);
                this.drawWord.setAutoWrite();
            }
            if (this.refAutoWrite){
                this.refAutoWrite.setIconIndex(1);
            }
        }
    }
    onPressHandWrite(){//手写描红
        if (this.blnAutoWrite){
            this.blnAutoWrite = false;
            if (this.drawWord){
                this.drawWord.stopAutoWrite();
            }
            if (this.refAutoWrite){
                this.refAutoWrite.setIconIndex(0);
            }
        }
        this.blnHandWrite = true;
        if (this.drawWord){
            this.drawWord.setArrowShow(this.blnSeeLine);
            this.drawWord.setHandWrite();
        }
        if (this.refHandWrite){
            this.refHandWrite.setIconIndex(1);
        }
    }
    setSeeLine(bln){
        if (this.refSeeLine){
            this.refSeeLine.setIconIndex(bln ? 1 : 0);
        }
        if (this.drawWord){
            if (this.blnHandWrite){
                this.drawWord.setArrowShow(bln);
            }else if (this.blnAutoWrite){
                this.drawWord.setArrowShow(false);
            }
        }
    }
    setSeeBack(bln){
        if (this.refSeeBack){
            this.refSeeBack.setIconIndex(bln ? 1 : 0);
        }
        if (this.drawWord){
            this.drawWord.setBackShow(bln);
        }
    }
    onPressSeeBack(){//是否看见汉字背影
        this.blnSeeBack = !this.blnSeeBack;
        this.setSeeBack(this.blnSeeBack);
    }
    onPressSeeLine(){//是否看见笔画提示
        this.blnSeeLine = !this.blnSeeLine;
        this.setSeeLine(this.blnSeeLine);
    }
    writeOver(){
        if (this.blnAutoWrite){
            this.blnAutoWrite = false;
            if (this.refAutoWrite){
                this.refAutoWrite.setIconIndex(0);
            }
            this.onPressHandWrite()
        }else{
            this.props.setCheckBtn(true)
        }
    }

    checkAnswer = ()=>{
        return "Right";
    }
}

class ButtonIcon extends Component {
    constructor(props) {
        super(props);
        this.state={
            blnUpdate: false,
        };
        this.iconIdx = 0;
        this.selfStyle={
            width: (this.props.iconSize) * MinUnit,
            height: (this.props.iconSize) * MinUnit,
            borderColor: '#CDCFA7',
            alignItems: 'center',
            justifyContent: 'center'
        };
    }
    static propTypes = {
        name: PropTypes.string.isRequired, //PanView 或者 PanButton的名字
        iconName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired, //icon的名字
        iconSize: PropTypes.number, //icon的大小
        iconStyle: PropTypes.object,  //icon的样式
        onPress: PropTypes.func.isRequired, //可以按，说明就是button
    }
    static defaultProps = {
        iconStyle: {color: '#000'},
        iconSize: 2,
    }
    setIconIndex(idx){
        this.iconIdx = idx % 2;
        this.setUpdate();
    }
    setUpdate(){
        this.setState({
            blnUpdate: !this.state.blnUpdate,
        });
    }
    render(){
        var iname = '';
        if (typeof(this.props.iconName) == 'string'){
            iname = this.props.iconName;
        }else {
            iname = this.props.iconName[this.iconIdx];
        }
        return (
            <PanButton
                name={this.props.name}
                onPress={this.props.onPress}
                style={[this.selfStyle, this.props.style]}
            >
                <Icon
                    name={iname}
                    size={this.props.iconSize * MinUnit}
                    style={[this.props.iconStyle, ]}
                />
            </PanButton>
        );
    }
}

class CircleIcon extends Component {
    constructor(props) {
        super(props);
        this.state={
            blnUpdate: false,
        };
        this.iconIdx = 0;
        this.selfStyle={
            width: (this.props.iconSize + 1.4) * MinUnit,
            height: (this.props.iconSize + 1.4) * MinUnit,
            borderRadius: (this.props.iconSize + 1.4) * MinUnit / 2,
            borderWidth: 1,
            borderColor: '#CDCFA7',
            alignItems: 'center',
            justifyContent: 'center'
        };
        this.selectStyle = [
            {backgroundColor: this.props.style.backgroundColor},
            {color: this.props.iconStyle.color},
            {backgroundColor: this.props.iconStyle.color},
            {color: '#FFFFFF'},
        ];
    }
    static propTypes = {
        name: PropTypes.string.isRequired, //PanView 或者 PanButton的名字
        iconName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired, //icon的名字
        iconSize: PropTypes.number, //icon的大小
        iconStyle: PropTypes.object,  //icon的样式
        onPress: PropTypes.func, //可以按，说明就是button
    }
    static defaultProps = {
        onPress: null,
        iconStyle: {color: '#000'},
        iconSize: 2,
    }
    setIconIndex(idx){
        this.iconIdx = idx % 2;
        this.setUpdate();
    }
    setUpdate(){
        this.setState({
            blnUpdate: !this.state.blnUpdate,
        });
    }
    render(){
        var iname = '';
        var tempBack = {};
        var tempIcon = {};
        if (typeof(this.props.iconName) == 'string'){
            iname = this.props.iconName;
        }else {
            iname = this.props.iconName[this.iconIdx];
            tempBack = this.selectStyle[this.iconIdx*2+0];
            tempIcon = this.selectStyle[this.iconIdx*2+1];
        }
        var child = (
            <Icon
                name={iname}
                size={this.props.iconSize * MinUnit}
                style={[this.props.iconStyle, tempIcon]}
            />
        );
        var ret = null;
        if (this.props.onPress){
            ret = (
                <PanButton
                    name={this.props.name}
                    onPress={this.props.onPress}
                    style={[this.selfStyle, this.props.style, tempBack]}
                >
                    {child}
                </PanButton>
            );
        }else{
            ret = (
                <PanView
                    name={this.props.name}
                    style={[this.selfStyle, this.props.style, tempBack]}
                >
                    {child}
                </PanView>
            );
        }
        return ret;
    }
}

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
    },

    bodyView:{
        width: ScreenWidth,
        height: ScreenHeight - itemHeight,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: MinUnit*8,
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
        justifyContent: 'center',
        alignItems: 'center',
        height: ScreenHeight * 0.5,
        width: ScreenWidth*0.8,
        //backgroundColor:'blue'
    },
    bodyBottomView:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: ScreenWidth,
        height: MinUnit*10,
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
    btnBackView2:{
        width: MinUnit*6,
        height: MinUnit*6,
        borderRadius: MinUnit*3,
        borderWidth: 1,
        borderColor: '#CDCFA7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnBackView3:{
        width: MinUnit*3,
        height: MinUnit*3,
        borderRadius: MinUnit*1.5,
        borderWidth: 1,
        borderColor: '#CDCFA7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bodyMiddleLeftView:{
        width: MinUnit*8,
        height: ScreenHeight*0.5,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginRight: MinUnit * 2,
        paddingVertical: MinUnit * 5,
        // backgroundColor: '#CCC'
    },
    bodyMiddleCenterView:{
        width: curWidth,
        height: curWidth,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#EEE',
    },
    bodyMiddleRightView:{
        width: MinUnit*8,
        height: ScreenHeight*0.5,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: MinUnit * 2,
        // backgroundColor: '#DDD'
    }
});