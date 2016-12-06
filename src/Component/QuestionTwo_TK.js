/**
 * Created by tangweishu on 16/11/22.
 */

import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, TextInput,Keyboard} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import QuestionRender from '../Common/QuestionRender'



export default class QuestionTwo_TK extends Component {
    constructor(props) {
        super(props);         
        this.state = {
        };
        this.writeText = ""
    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired
    };
    static defaultProps = {};

    componentWillUpdate(nProps,nState) {
        if(nProps.questionData != this.props.questionData){
            this.writeText = ""
            this.refs.input.clear()
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <PanButton name="btnCloseKeyboard" style={styles.hiddenBtn} onPress={this.hiddenKeyboard.bind(this)}/>
                {this.renderTitle()}
                {this.renderQuestion()}
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

    renderQuestion = ()=> {
        const {Q_Question, Q_Question_PY, Q_Sound} = this.props.questionData
        return (
            <QuestionRender sound={Q_Sound} question={Q_Question} pinyin={Q_Question_PY}/>
        );
    }

    renderContents = ()=> {
        let autoCorrect = false;
        if(this.props.questionData.A_Tips.length < 30){
            autoCorrect = true
        }
        return (
            <TextInput style={styles.textInput}
                multiline={true} ref = "input"
                       onChangeText = {this.onChangeText.bind(this)}
                       placeholder = {this.props.questionData.A_Tips}
                       placeholderTextColor = "#ABABAB"
                       onEndEditing = {()=>{console.log("输入结束")}}
                       blurOnSubmit = {true}
                       returnKeyType = "done"
                       autoCorrect = {autoCorrect}
            />
        );
    }
    onChangeText = (text)=>{
        let preText = this.writeText
        this.writeText = text;
        if(preText == ""){
            if(this.writeText != ""){
                this.props.setCheckBtn(true)
            }
        }else{
            if(this.writeText == ""){
                this.props.setCheckBtn(false)
            }
        }
    }

    checkAnswer = ()=>{
        let answerData = this.props.questionData.Q_Answer
        let checkAnswer = this.writeText
        checkAnswer = checkAnswer.replace(/\s/g,"")
        checkAnswer = checkAnswer.toLowerCase()
        console.log("我的答案:",checkAnswer,"正确答案:",answerData)
        for(let i=0;i<answerData.length;i++){
            let answer = answerData[i].replace(/\s/g,"")
            answer = answer.toLowerCase()
            if(answer == checkAnswer){
                return "Right";
            }
        }
        return "Wrong"
    }

    hiddenKeyboard = ()=>{
        Keyboard.dismiss()
    }
} 

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
        //backgroundColor: '#ffff00',
    },
    textInput:{
        height:MinUnit*14,
        backgroundColor:'#F6F6F6',
        fontSize:MinUnit*2,
        padding:MinUnit,
    },
    hiddenBtn:{
        position:'absolute',
        width:ScreenWidth,
        height:ScreenHeight,
        top:0,
        left:0,
        backgroundColor:'white'
    },
});