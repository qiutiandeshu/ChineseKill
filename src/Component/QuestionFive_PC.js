/**
 * Created by tangweishu on 16/11/28.
 */


import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, TextInput,} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import QuestionRender from '../Common/QuestionRender'

export default class QuestionFive_PC extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired
    };
    static defaultProps = {};

    componentWillUpdate(nProps,nState) {
        if(nProps.questionData != this.props.questionData){

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
        return (
            <Text>评测咧~</Text>
        );
    }

    checkAnswer = ()=>{
        return "Right"
    }
}

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
    },
    textInput:{
        height:MinUnit*14,
        backgroundColor:'#F6F6F6',
        fontSize:MinUnit*2,
        padding:MinUnit,
    },
});