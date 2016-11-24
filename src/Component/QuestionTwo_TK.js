/**
 * Created by tangweishu on 16/11/22.
 */

import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, TextInput} from 'react-native'
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
                {this.renderTitle()}
                {this.renderQuestion()}
                {this.renderContents()}
            </View>
        )
    }

    renderTitle = ()=> {
        return (
            <Text style={[UtilStyles.fontNormal,{color:'#14838D',marginBottom:MinUnit*3}]}>
                {this.props.questionData.title}
            </Text>
        );
    }

    renderQuestion = ()=> {
        const {question, question_PY, Q_Sound} = this.props.questionData
        return (
            <QuestionRender sound={Q_Sound} question={question} pinyin={question_PY}/>
        );
    }

    renderContents = ()=> {
        return (
            <TextInput style={styles.textInput}
                multiline={true} ref = "input"
                       onChangeText = {this.onChangeText.bind(this)}
                       placeholder = {this.props.questionData.Q_Tips}
                       placeholderTextColor = "#ABABAB"
                       onEndEditing = {()=>{console.log("输入结束")}}
                       blurOnSubmit = {true}
                       returnKeyType = "done"
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
        checkAnswer = checkAnswer.replace(/(^\s*)|(\s*$)/g, "")
        checkAnswer = checkAnswer.toLowerCase()
        console.log("我的答案:",checkAnswer,"正确答案:",answerData)
        for(let i=0;i<answerData.length;i++){
            let answer = answerData[i].toLowerCase()
            if(answer == checkAnswer){
                return "Right";
            }
        }
        return "Wrong"
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
});