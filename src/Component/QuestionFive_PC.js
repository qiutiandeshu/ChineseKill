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
import* as Progress from 'react-native-progress'
export default class QuestionFive_PC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            volumProgress: 0,
            recordResult: '',
            recordState: 'normal',//普通'normal',录音中'working',评测中'waiting'
            playRecordState: 'none',//无录音'none',等待播放'normal',播放中'playing',暂停'pause'
            timeProgress: 0,
        };
    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired,
        questionInfo: PropTypes.string.isRequired,
    };
    static defaultProps = {};

    componentWillUpdate(nProps, nState) {
        if (nProps.questionData != this.props.questionData) {

        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderTitle()}
                {this.renderQuestion()}
                {this.renderContents()}
                {this.renderButtons()}
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
        if(this.state.timeProgress  == 0){
            return   (
                <View style={{width:ScreenWidth*0.8,height:ScreenHeight*0.25 }}>

                </View>
            )
        }
        let list = []
        let str = this.props.questionData.Q_Question
        for(let i=0;i<str.length;i++){
            list.push(
                <Text key={i}>{this.getResultMsg(str[i],this.state.recordResult.details[i])}</Text>
            )
        }
        return (
            <View style={{width:ScreenWidth*0.8,height:ScreenHeight*0.25 }}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <Text style={UtilStyles.fontSmall}>评测解析</Text>
                    <Text style={UtilStyles.fontSmall}>分数:{this.state.recordResult.overallScore}</Text>
                </View>
                {list}

                <Text>评测结果:{JSON.stringify(this.state.recordResult)}</Text>

            </View>
        );
    }

    getResultMsg = (str,detail)=>{
        const {overallScore,phnScore,pronScore,toneScore,originalTone,recordTone,phoneScores} = detail
        let toneStr = ["轻声","一声","二声","三声","四声"]
        let result = str + ": "
        let blnGood = true
        if(phoneScores.sm){
            if(phoneScores.sm < 75){
                result += "声母读的不准  "
                blnGood = false
            }
            //result += "声母得分:"+phoneScores.sm+"  "
        }
        if(phoneScores.ym){
            if(phoneScores.ym < 75){
                result += "韵母读的不准  "
                blnGood = false
            }
            //result += "韵母得分:"+phoneScores.ym+"  "
        }
        if(originalTone != recordTone){
            result += "声调读的不准 (将"+toneStr[originalTone]+"读成"+toneStr[recordTone]+")"
            blnGood = false
        }
        if(blnGood){
            result += "您读的很准确"
        }
        return result
    }

    renderButtons = ()=> {
        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>

                <PanButton name="btnRecord" onPress={this.onPressRecord.bind(this)}
                           style={[styles.bigCircle,{backgroundColor:'#00BDD3'}]}>
                    <Progress.Circle  thickness={MinUnit*0.5} borderWidth={0} style={{position:'absolute',left:0,top:0}}
                                      progress={Number(this.state.volumProgress)} size={IconSize * 2 + MinUnit * 2} color="#1BA2FF"/>
                    <Icon name="microphone" style={{backgroundColor:'#00000000'}}  size={IconSize*2} color="white"/>
                </PanButton >
                <PanButton name="btnPlayRecord" style={[styles.smallCircle]}
                           disabled={this.state.playRecordState=='none'}
                           onPress={this.onPressPlayRecord.bind(this)}>
                    <Icon name="play-circle" size={IconSize*1.5} color={this.state.playRecordState == "none"?"#ADADAD":"#00BDD3"} />
                </PanButton>
            </View>
        )
    }

    onPressRecord = ()=> {
        if (this.state.recordState == "normal") {
            let param = {
                gategory: 'word',
                text: this.props.questionData.Q_Answer,
                audioName: this.props.questionInfo
            }
            if (app.onStartChivox(param, this.callBackRecord)) {
                this.setState({
                    recordState: 'working'
                })
            }
        } else if (this.state.recordState == "working") {
            app.onStopChivox()
        } else if (this.state.recordState == "waiting") {

        }
    }

    onPressPlayRecord = ()=> {
        if (this.state.playRecordState == 'normal') {
            app.onPlayRecord()
        }
    }

    callBackRecord = (data)=> {
        switch (data.type) {
            case 'volume':
                console.log("获得音量回调:",data.volume)
                this.setState({
                    volumProgress: data.volume
                })
                break;
            case 'result':
                console.log("得到评测结果:", data.result)
                this.setState({
                    volumProgress: 0,
                    recordResult: data.result,
                    recordState: 'normal',
                })
                app.initPlayRecord(this.props.questionInfo,this.callBackPlayRecord)
                this.props.setCheckBtn(true)

                break;
            case 'error':
                console.log("评测出错:", data.error)
                this.setState({
                    volumProgress: 0,
                    recordResult: data.error,
                    recordState: 'normal'
                })
                break;
            case 'working':
                console.log("工作ing:", data.working)
        }
    }

    callBackPlayRecord = (data)=> {
        switch (data.type) {
            case 'audioTime':
                console.log("获取到录音时长:", data.audioTime)
                this.setState({
                    playRecordState:'normal',
                    timeProgress:data.audioTime
                })
                break;
            case 'working':
                console.log("获取到工作状态:", data.working)
                break;
        }
    }

    checkAnswer = ()=> {
        return "Right"
    }
}

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
    },
    bigCircle: {
        width: IconSize * 2 + MinUnit * 2,
        height: IconSize * 2 + MinUnit * 2,
        borderRadius: IconSize + MinUnit,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallCircle: {
        position: 'absolute',
        bottom: MinUnit * 3,
        right: ScreenWidth * 0.25
    },
    volumCircle: {
        position: 'absolute',
        width: IconSize * 2 + MinUnit * 2,
        height: IconSize,
        backgroundColor: 'black',
        bottom: 0,
        left: 0,
    }
});