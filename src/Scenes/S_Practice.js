/**
 * Created by tangweishu on 16/11/18.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import QuestionOne_XZ from '../Component/QuestionOne_XZ'
import QuestionTwo_TK from '../Component/QuestionTwo_TK'
import QuestionThree_PX from '../Component/QuestionThree_PX'
import QuestionFour_MH from '../Component/QuestionFour_MH'
import QuestionFive_PC from '../Component/QuestionFive_PC'
import InputBoard from '../Common/InputBoard'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class S_Practice extends Component {
    constructor(props) {
        super(props);
        this.questionCount = props.questionData.length;
        let arrayColor = Array.from({length: this.questionCount}, ()=>'white');
        this.state = {
            life: 4,
            score: 0,
            answerColor: arrayColor,//'white'还没答题,'#4BCFE1'正确,'#E68A58'错误,
            index: 0,//..当前题目的index
            canCheck: false,
            showResult: "",//显示答某道题结果弹窗 "Right","Wrong"
            showGameOver: "",//显示游戏结束页面 "Success","Fail" (闯关时赢和输),"TheEnd"(纯练习时)
        };
        this.practiceTime = new Date()
        this.rightQuestion = [];
        this.wrongQuestion = [];
    }

    static propTypes = {
        blnGate: PropTypes.bool,//标记是否为闯关,因为涉及到life属性的处理和显示的问题还有练习结果页面
        questionData: PropTypes.array.isRequired,
        newCardInfo: PropTypes.object,
        lessonInfo: PropTypes.object,
        chapterRecord: PropTypes.object
    }
    static defaultProps = {
        blnGate: false,
        //questionData: [],
    }

    setCheckBtn = (blnOpen)=> {
        this.setState({
            canCheck: blnOpen
        })
    }

    checkAnswer = ()=> {
        let result = this.refs.nowQuestion.checkAnswer();
        let {life, score, answerColor, index} = this.state
        console.log("结果:", result, life, score, index)
        let rightCount = this.rightQuestion.length;
        let wrongCount = this.wrongQuestion.length;
        if (result == "Right") {
            app.onPlaySound('Sounds/correct_sound.mp3',()=>{},0,{})
            if (this.props.blnGate) {
                score += 10
            }
            answerColor[index] = "#4BCFE1"
            this.rightQuestion[rightCount] = this.props.questionData[index]
        } else {
            app.onPlaySound('Sounds/wrong_sound.mp3',()=>{},0,{})
            if (this.props.blnGate) {
                life -= 1
            }
            answerColor[index] = "#E68A58"
            this.wrongQuestion[wrongCount] = this.props.questionData[index]
        }
        if (index == this.questionCount - 1) {
            this.practiceTime = new Date() - this.practiceTime
            console.log("花费的时间为:", this.practiceTime)
        }
        this.setState({
            life: life,
            score: score,
            answerColor: answerColor,
            showResult: result,
        })
    }

    nextQuestion = ()=> {
        let {index, canCheck, showGameOver} = this.state

        index += 1
        canCheck = false
        if (this.state.life < 0) {
            showGameOver = "Fail"
        } else {
            if (index == this.questionCount ) {
                if (this.props.blnGate) {
                    this.saveLearning()
                    showGameOver = "Success"
                } else {
                    showGameOver = "TheEnd"
                }
            }
        }
        this.setState({
            index: index,
            canCheck: canCheck,
            showResult: "",
            showGameOver: showGameOver,
        })
    }

    saveLearning = ()=> {
        let nowScore = this.state.score
        let nowUseTime = this.practiceTime
        const {chapterState, chapterScore, chapterTime}=this.props.chapterRecord
        const {lessonId, chapterIndex} = this.props.lessonInfo

        let blnSave = false
        if (chapterScore < nowScore) { //如果记录的得分小于当前得分,确定要保存
            blnSave = true
        } else {//如果记录的分数大于或等于当前得分,那就重新赋值,以便后面可能会保存
            nowScore = chapterScore
        }
        if (chapterTime == 0) {
            blnSave = true
        } else {
            if (chapterTime > nowUseTime) {
                blnSave = true
            } else {
                nowUseTime = chapterTime
            }
        }

        if (blnSave) { //如果要保存
            app.saveLearningStorage(lessonId, chapterIndex, {
                state: "passed",
                score: nowScore,
                time: nowUseTime,
            })
        }

        if (chapterState != "passed") {//如果当前关卡不是已经打通的,那就需要将下一关卡解锁
            let unlockLesson = lessonId
            let unlockChapter = chapterIndex + 1
            if (unlockChapter == app.getChapterCount(unlockLesson)) {
                unlockChapter = 0
                unlockLesson += 1
            }
            if (unlockLesson < app.getLessonCount()) {
                app.saveLearningStorage(unlockLesson, unlockChapter, {
                    state: "unlocked",
                    score: 0,
                    time: 0,
                })
                LessonMenu.updateRender(app.getStorageLearning()[lessonId])
                Home.changeDataSource(unlockLesson, unlockChapter, {
                    state: "unlocked",
                    score: 0,
                    time: 0,
                })
            }
            this.saveCardInfo()
        }       
    }

    saveCardInfo = ()=> {
        const {lessonId, chapterIndex} = this.props.lessonInfo
        let serverList = []
        for (let i = 0; i < this.questionCount; i++) {
            const {Q_ZiCards,Q_CiCards,Q_JuCards} = this.props.questionData[i]
            let service = {
                ziCards:Q_ZiCards,
                ciCards:Q_CiCards,
                juCards:Q_JuCards,
            }
            serverList[i] = service
        }
        app.saveCardInfo(this.props.newCardInfo, serverList, lessonId, chapterIndex)
    }

    shouldComponentUpdate(nProps, nStates) {
        if (nStates != this.state) {
            return true;
        }
        return false;
    }

    render() {
        if (this.state.showGameOver != "") {
            return (
                <PanView style={[styles.container]} name="s_practiceOver">
                    {this.renderGameOverTitle()}
                    {this.renderGameOver()}
                    {this.renderBottomBtn()}
                </PanView>
            )
        }

        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}>
                <PanView style={styles.container} name="s_practice">
                    {this.renderTop()}
                    {this.renderQuestion()}
                    {this.renderBtnCheck()}
                </PanView>
                {<InputBoard spaceHeight={0}/>}
                {this.renderQuestionResult()}
            </View>
        );
    }

    renderTop = ()=> {//显示答题页面的顶部信息,血条和格子啥的
        let lifeIcon = []
        for (let i = 1; i <= 4; i++) {
            if (i <= this.state.life) {
                lifeIcon.push(<Icon style={{marginHorizontal:MinUnit*0.5}} name="heart" key={i} size={IconSize}
                                    color="#E77D85"/>)
            } else {
                lifeIcon.push(<Icon style={{marginHorizontal:MinUnit*0.5}} name="heart-o" key={i} size={IconSize }
                                    color="#E77D85"/>)
            }
        }
        let answerBlock = []
        for (let i = 0; i < this.questionCount; i++) {
            answerBlock.push(
                <View key={i}
                      style={[styles.smallBlock,{width: parseInt((ScreenWidth*0.8) / this.questionCount),backgroundColor:this.state.answerColor[i]}]}/>
            )
        }
        return (
            <View >
                <View style={styles.top}>
                    <PanButton name="btnBackView" onPress={()=>{this.props.navigator.pop()}}>
                        <Icon name="times" size={IconSize}/>
                    </PanButton>

                    <View style={{flexDirection:'row'}}>
                        {lifeIcon}
                    </View>
                    <Text style={UtilStyles.fontNormal}>{this.state.score}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:MinUnit}}>
                    {answerBlock}
                </View>
            </View>
        );
    }

    renderBtnCheck = ()=> {//显示答题页面中的check按钮
        let question = this.props.questionData[this.state.index];
        if (!this.state.canCheck) {
            if (question.Q_Type === 3 || question.Q_Type === 4) {
                return this.renderSkipCheck()
            }
        }
        return (
            <PanButton name="btnCheckAnswer"
                       style={[styles.btnCheck,{backgroundColor:this.state.canCheck?'#4BCFE1':'#ADADAD'}]}
                       disabled={this.state.canCheck?false:true} onPress={this.checkAnswer.bind(this)}
            >
                <Text style={[UtilStyles.fontSmall,{color:'white'}]}>CHECK</Text>
            </PanButton>
        );
    }

    renderSkipCheck = ()=> {
        return (
            <View
                style={{flexDirection:'row',width:ScreenWidth*0.8,justifyContent:'space-between',alignItems:'center'}}>
                <PanButton name="btnNextQuestion" disabled={true}
                           style={[styles.btnCheck,{backgroundColor:'#ADADAD',width:ScreenWidth*0.6}]}>
                    <Text style={[UtilStyles.fontSmall,{color:'white'}]}>NEXT</Text>
                </PanButton>
                <PanButton name="btnSkipQuestion" onPress={this.checkAnswer.bind(this)}>
                    <Text style={[UtilStyles.fontSmall,{color:'#ADADAD'}]}>SKIP</Text>
                </PanButton>
            </View>
        )
    }

    renderQuestion = ()=> {//显示答题页面中要回答的问题
        let question = this.props.questionData[this.state.index];
        let questionInfo = "tp"+this.state.index; //临时的练习时
        if(this.props.blnGate){
            const {lessonId, chapterIndex} = this.props.lessonInfo
            questionInfo = lessonId + "_" + chapterIndex + "_" + this.state.index
        }

        if (question.Q_Type === 0) {
            return (
                <QuestionOne_XZ ref="nowQuestion"
                                setCheckBtn={this.setCheckBtn.bind(this)}
                                questionData={question}
                />
            )
        } else if (question.Q_Type === 1) {
            return (<QuestionTwo_TK ref="nowQuestion"
                                    setCheckBtn={this.setCheckBtn.bind(this)}
                                    questionData={question}
            />)
        } else if (question.Q_Type === 2) {
            return (<QuestionThree_PX ref="nowQuestion"
                                      setCheckBtn={this.setCheckBtn.bind(this)}
                                      questionData={question}
            />)
        } else if (question.Q_Type === 3) {
            return (<QuestionFour_MH ref="nowQuestion"
                                     setCheckBtn={this.setCheckBtn.bind(this)}
                                     questionData={question}/>)
        } else if (question.Q_Type == 4) {
            return (<QuestionFive_PC ref="nowQuestion" questionInfo={questionInfo}
                                     setCheckBtn={this.setCheckBtn.bind(this)}
                                     questionData={question}/>)
        }
    }
    renderQuestionResult = ()=> {//显示当前答题的对错
        if (this.state.showResult == "") {
            return null
        }
        let question = this.props.questionData[this.state.index];
        return (
            <QuestionResult result={this.state.showResult} questionData={question}
                            _onPress={this.nextQuestion.bind(this)}/>
        )
    }

    renderBottomBtn = ()=> {//显示结束界面下面的按钮
        if (this.state.showGameOver == "TheEnd") {
            return (
                <PanButton name="btnContinue" onPress={()=>{this.props.navigator.pop()}}
                           style={[styles.btnCheck,{backgroundColor:'#4BCFE1'}]}>
                    <Text style={[UtilStyles.fontSmall,{color:'white'}]}>CONTINUE</Text>
                </PanButton>
            )
        } else {
            return (
                <View
                    style={{width: ScreenWidth - MinUnit * 16,height:MinUnit*4,flexDirection:'row',justifyContent:'space-between'}}>
                    <PanButton style={[styles.btnCheck,{backgroundColor:'#4BCFE1',width:ScreenWidth*0.38}]}
                               name="btnRedo" onPress={()=>{ this.props.navigator.replace(app.getRoute("Practice"))}}>
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>REDO</Text>
                    </PanButton>
                    <PanButton style={[styles.btnCheck,{backgroundColor:'#4BCFE1',width:ScreenWidth*0.38}]}
                               name="btnContinue" onPress={()=>{this.props.navigator.pop()}}>
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>CONTINUE</Text>
                    </PanButton>
                </View>
            )
        }
    }

    renderGameOverTitle = ()=> { //显示结束界面的顶部
        let title = ""
        if (this.state.showGameOver == "TheEnd") {
            title = "Practice"
        } else if (this.state.showGameOver == "Success") {
            title = "Success"
        } else if (this.state.showGameOver == "Fail") {
            title = "Fail"
        }
        return (
            <View
                style={{width:ScreenWidth*0.8,height:MinUnit*4,marginTop:MinUnit*2,justifyContent:'center',alignItems:'center'}}>
                <Text style={[UtilStyles.fontNormal]}>{title}</Text>
            </View>
        )
    }

    tempRenderGameOver = ()=> {
        let rightCount = this.rightQuestion.length
        let wrongCount = this.wrongQuestion.length
        if (this.state.showGameOver == "TheEnd") {
            return <Text>恭喜你练习结束啦</Text>
        } else if (this.state.showGameOver == "Fail") {
            return <Text>您已经挂掉了心碎人亡</Text>
        } else if (this.state.showGameOver == "Success") {
            return (
                <View>
                    <Text>此时此刻你不是一个人,分数:{this.state.score},耗时:{this.practiceTime.toString()}毫秒,做对了{rightCount}个题,做错了{wrongCount}
                        个题,正确率:自己算去</Text>
                    {rightCount > 0 &&
                    <PanButton name="btnReViewRight" onPress={this.onPressReview.bind(this,this.rightQuestion)}>
                        <Text>吃饱了撑的</Text>
                    </PanButton >}
                    {wrongCount > 0 &&
                    <PanButton name="btnReViewWrong" onPress={this.onPressReview.bind(this,this.wrongQuestion)}>
                        <Text>死磕到底</Text>
                    </PanButton>}
                </View>)
        }
    }

    onPressReview = (data)=> {

    }

    renderGameOver = ()=> {//显示结束界面中心内容
        return this.tempRenderGameOver()

        if (this.state.showGameOver == "TheEnd") {
            return (
                <View>
                    <Text>PRACTICE</Text>
                    <Icon name="bus" size={MinUnit*10}/>
                </View>
            )
        } else if (this.state.showGameOver == "Fail") {
            return (
                <View>
                    <Icon name="ambulance" size={MinUnit*10}/>
                </View>
            )
        } else if (this.state.showGameOver == "Success") {
            return (
                <View style={{flexDirection:'row',width:ScreenWidth*0.8,height:MinUnit*15,
                                borderTopColor:'#e6e6e6',borderBottomColor:'#e6e6e6',borderTopWidth:MinWidth,borderBottomWidth:MinWidth}}>
                    <View
                        style={{width:ScreenWidth*0.4,height:MinUnit*15,alignItems:'center',justifyContent:'space-around'}}>

                    </View>
                    <View
                        style={{width:ScreenWidth*0.4,height:MinUnit*15,borderLeftColor:'#e6e6e6',borderLeftWidth:MinWidth}}>
                        <View
                            style={{width:ScreenWidth*0.4,height:MinUnit*5,paddingHorizontal:MinUnit*2,paddingVertical:MinUnit}}>
                            <View style={{flexDirection:'row',width:ScreenWidth*0.1,justifyContent:'space-between'}}>
                                <Text>Right</Text>
                                <Text>10</Text>
                            </View>
                        </View>
                        <View style={{width:ScreenWidth*0.4,height:MinUnit*5,paddingHorizontal:MinUnit*2,paddingVertical:MinUnit,
                        borderTopColor:'#e6e6e6',borderBottomColor:'#e6e6e6',borderTopWidth:MinWidth,borderBottomWidth:MinWidth}}>
                            <View>
                                <Text>Wrong</Text>
                                <Text>0</Text>
                            </View>
                        </View>
                        <View
                            style={{width:ScreenWidth*0.4,height:MinUnit*5,paddingHorizontal:MinUnit*2,paddingVertical:MinUnit}}>
                            <View>
                                <Text>Accuracy</Text>
                                <Text>90%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
    }
}

class QuestionResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultAnim: new Animated.Value(0),
        };
    }

    static propTypes = {
        questionData: PropTypes.object.isRequired,
        result: PropTypes.string.isRequired,
        _onPress: PropTypes.func.isRequired,
    }

    componentDidMount() {
        Animated.timing(this.state.resultAnim, {
            toValue: 1,
            duration: 200,
        }).start()
    }

    render() {
        const bottom = this.state.resultAnim.interpolate(
            {
                inputRange: [0, 1],
                outputRange: [-ScreenHeight * 0.3, 0],
            }
        )
        return (
            <PanView name="questionResult" style={styles.resultView}>
                <Animated.View
                    style={[styles.Q_Result,{bottom},{backgroundColor:this.props.result=="Right"?"#00BCD4":"#F06827"}]}>
                    {this.renderContent()}
                    <PanButton name="btnContinue" onPress={this.props._onPress} style={styles.btnContinue}>
                        <Text
                            style={[UtilStyles.fontSmall,{fontWeight :'bold',color:this.props.result=="Right"?"#00BCD4":"#F06827"}]}>Continue</Text>
                    </PanButton>
                </Animated.View>
            </PanView>
        );
    }

    renderContent = ()=> {
        //答对了随机显示 Awesome  You Are Correct   Bravo!   Excellent!
        let answer = this.getAnswerMsg() //..先不实现答案的显示
        let result = this.props.result
        return (
            <View style={styles.resultContent}>
                <Text style={[UtilStyles.fontNormal,{color:'white',marginVertical:MinUnit}]}>{result}</Text>
                {/*answer*/ }
            </View>
        )
    }

    getAnswerMsg = ()=> {
        const {Q_Type, Q_Question, Q_Answer} = this.props.questionData

        if (Q_Type == 0) {
            return <Text style={styles.textAnswer}>{Q_Answer + "=" + this.getQuestion(Q_Question)}</Text>
        }
    }

    getQuestion = (str)=> {
        let newStr = str.replace(/_/g, ' ');
        //return newStr.replace(/ \+|\-|\*|\? /g,"/");
        return newStr.replace(/\*/g, "___");
    }
}


const styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: MinUnit * 8,
        paddingVertical: MinUnit * 2,
        justifyContent: 'space-between',
        width:ScreenWidth,
        height:ScreenHeight - MinUnit*10,
    },
    top: {
        flexDirection: 'row',
        height: MinUnit * 6,
        //backgroundColor: '#ffff00',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    smallBlock: {
        height: MinUnit * 2,
        borderWidth: MinWidth,
        borderColor: '#e6e6e6',
    },
    btnCheck: {
        width: ScreenWidth - MinUnit * 16,
        height: MinUnit * 4,
        borderRadius: MinUnit * 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    practiceContent: {
        height: ScreenHeight * 0.7,
        //..backgroundColor:'#ffff00',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Q_Result: {
        backgroundColor: 'blue',
        width: ScreenWidth,
        height: ScreenHeight * 0.3,
        position: 'absolute',
        //left: -MinUnit * 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultView: {
        backgroundColor: '#00000088', width: ScreenWidth, height: ScreenHeight, position: 'absolute', top: 0, left: 0
    },
    resultContent: {
        //backgroundColor: 'yellow',
        //width: ScreenWidth,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: -MinUnit * 3,
    },
    btnContinue: {
        position: 'absolute',
        left: ScreenWidth * 0.1,
        bottom: MinUnit * 2,
        backgroundColor: 'white',
        width: ScreenWidth * 0.8,
        height: MinUnit * 4,
        borderRadius: MinUnit * 2,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textAnswer: {
        color: 'white',
        fontSize: MinUnit * 2,
    }
});

