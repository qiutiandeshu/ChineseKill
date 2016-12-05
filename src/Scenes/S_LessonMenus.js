/**
 * Created by tangweishu on 16/11/17.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'
import PanScrollView from '../UserInfo/PanScrollView'
import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView, Image} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import PopupBox from '../Common/PopupBox'
import PushNotification from '../Component/PushNotification'
export default class S_LessonMenus extends Component {
    constructor(props) {
        super(props);
        this.baseProps = props;//在页面保存一下属性,以便pop到此页面时,还能找到属性
        let initRecord = this.setRecord(props.lessonRecord)
        this.state = {
            chaptersRecord:initRecord,
        };
        global.LessonMenu = this
        //console.log("lesstonData:",props.lessonData)
    }
    static propTypes = {
        lessonData: PropTypes.object,//.isRequired,
        lessonRecord:PropTypes.object,//.isRequired
        lessonId:PropTypes.number,
    };
    static defaultProps = {
        //lessonData:{title:"null",icon:"none",lessonTitle:["none","none"]}
    };
    shouldComponentUpdate(nProps,nStates) {
        if(nStates != this.state){
            return true;
        }
        return false;
    }
    
    setRecord = (lessonRecord)=>{
        const {chapterStates,chapterScores,chapterTimes} = lessonRecord;
        var records = []
        for(let i=0;i<this.baseProps.lessonData.chapters.length;i++){
            let chapterRecord = {
                chapterState:chapterStates[i],
                chapterScore:chapterScores[i],
                chapterTime:chapterTimes[i]
            }           
            records[i] = chapterRecord
        }
        return records       
    }

    updateRender = (record)=>{
        var newRecord = this.setRecord(record)
        this.setState({
            chaptersRecord:newRecord,
        })
    }

    render() {
        const {lessonTitle,lessonIcon,chapters} = this.baseProps.lessonData;
        let LessonCards = []              
        for(let i=0;i<chapters.length;i++){   
            LessonCards.push(
                <LessonCard key = {i} chapterIndex={i} chapterCount = {chapters.length}
                            chapterRecord={this.state.chaptersRecord[i]}
                             contentData={chapters[i]}
                             onPressStart={this.startPractice.bind(this,i)}
                            onPressReview = {this.showPopupBox.bind(this,i)}
                />
            )
        }
        const uri = "http://192.169.1.19:8080/ChineseSkill/Icon/"+lessonIcon
        return (
            <PanView name = "S_LessonMenus" style={styles.container}>
                <View style={styles.titleView}>
                    <PanButton name="btnLessonMenusBack" onPress={this.onBackScene.bind(this)}>
                        <Icon name="angle-left" size={IconSize} color='white'/>
                    </PanButton>
                    <Text style={[UtilStyles.fontNormal,styles.titleText]}>{lessonTitle}</Text>
                    <View/>
                </View>
                <Image source = {{uri:uri}} style={styles.image}/>
                <PanScrollView name="lessoncardScrollView" horizontal ={true}>
                    {LessonCards}
                </PanScrollView>
                <PopupBox ref="reviewBox" name="REVIEEW" onLeftPress = {()=>{this.refs.reviewBox.hidden();}} leftIconName="close">
                    <PushNotification/>
                </PopupBox>
            </PanView>
        );
    }

    onBackScene = ()=>{
        this.props.navigator.pop();
    }

    startPractice = (index)=>{
        let lessonId = this.baseProps.lessonId
        app.onPlaySound('Sounds/page_into.mp3',()=>{},0,{})
        const {cardZis,cardCis,cardJus,practices} = this.baseProps.lessonData.chapters[index]
        app.setNextRouteProps({
            blnGate:true,
            questionData:practices,
            lessonInfo:{lessonId:lessonId,chapterIndex:index},
            newCardInfo:{cardZis:cardZis,cardCis:cardCis,cardJus:cardJus},
            chapterRecord:this.state.chaptersRecord[index]
        })
        this.props.navigator.push(app.getRoute("Practice"));
    }

    showPopupBox = (index)=>{
        console.log("显示弹出框")
        this.refs.reviewBox.show()
    }
}


class LessonCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    static propTypes = {      
        chapterIndex:PropTypes.number.isRequired,//卡片index
        chapterCount:PropTypes.number.isRequired,//卡片总数
        contentData:PropTypes.object.isRequired,

        onPressStart:PropTypes.func.isRequired,
        chapterRecord:PropTypes.object.isRequired,
        onPressReview:PropTypes.func.isRequired,
    }
    static defaultProps = {

    }

    render(){
        return (
            <Animated.View>
                <PanView name={"card"+this.props.chapterIndex} style={styles.card}>
                    <Text style={[UtilStyles.fontSmall,{color:'#7F7F7F'}]}>LESSON</Text>
                    {this.renderIndex()}
                    {this.renderMessage()}
                    {this.renderCardButton()}
                </PanView>
            </Animated.View>
        );
    }
    renderIndex = ()=>{
        const {chapterState} = this.props.chapterRecord
        let nowIndex = this.props.chapterIndex + 1;
        return (
            <View >
                <Text style={[UtilStyles.fontNormal,{color:'black',}]}>
                    {nowIndex + "/" + this.props.chapterCount}
                </Text>
                {chapterState=="passed"&&<Icon style={{position:'absolute',top:MinUnit,right:-MinUnit*4}} name="check-circle" color="#00BCD4" size={IconSize*0.75}/>}
            </View>
        );
    }

    renderMessage = ()=>{
        return (
            <View style={{alignItems:'center'}}>
                {this.props.contentData.sentence && <Text style={{fontSize:MinUnit*2,color:'#CACACA'}}>{this.props.contentData.sentence}</Text>}
                {this.props.contentData.word && <Text style={{fontSize:MinUnit*2,color:'#CACACA'}}>{this.props.contentData.word}</Text>}
            </View>
        )
    }

    renderCardButton = ()=>{
        const {chapterState} = this.props.chapterRecord
       /*if(chapterState=="passed"){ //先去掉2个按钮吧
            return (
                <View style={{width:ScreenWidth*0.4,flexDirection:'row',justifyContent:'space-around'}}>
                    <PanButton style={styles.btnShort} name="btnShort1" onPress={this._onStartPractice.bind(this)}>
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>REDO</Text>
                    </PanButton>
                    <PanButton style={styles.btnShort} name="btnShort2" onPress={()=>{this.props.onPressReview()}}>
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>REVIEW</Text>
                    </PanButton>
                </View>
            );
        }*/
        if(chapterState=="passed"){ //先去掉2个按钮吧
            return (
                <PanButton name = 'btnLong'style={[styles.btnLong,{backgroundColor:'#00BCD4'}]}
                           onPress={this._onStartPractice.bind(this)} >
                    <Text style={[UtilStyles.fontSmall,{color:'white'}]}>START</Text>
                </PanButton>
            );
        }

        let text = chapterState == "unlocked"?"START":"LOCKED"
        let bgColor = chapterState == "unlocked"?'#00BCD4':'#ADADAD'
        let canPress = chapterState == "unlocked"?true:false
        canPress = true
        return (
            <PanButton name = 'btnLong'style={[styles.btnLong,{backgroundColor:bgColor}]}
                       onPress={this._onStartPractice.bind(this)} disabled={!canPress}>
                <Text style={[UtilStyles.fontSmall,{color:'white'}]}>{text}</Text>
            </PanButton>
        )
    }

    _onStartPractice = ()=>{
        this.props.onPressStart()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00BCD4',
        alignItems:'center'
    },
    titleView:{
        width:ScreenWidth,
        height:MinUnit*4,
        paddingHorizontal:MinUnit*3,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:MinUnit*3,
    },
    titleText:{
        color:'white',
    },
    image:{
        width: MinUnit * 10,
        height: MinUnit * 10,
        marginVertical:MinUnit*4
    },
    card:{
        backgroundColor:'white',
        width:ScreenWidth*0.4,
        height:ScreenHeight*0.4,
        paddingHorizontal:MinUnit*2,
        paddingVertical:MinUnit*2,
        justifyContent:'space-between',
        borderRadius:MinUnit*1,
        alignItems:'center',
        marginHorizontal:-MinUnit*3,//临时
        transform :[{scale:0.7}]//临时
    },
    btnLong:{
        width:ScreenWidth*0.4*0.8,
        height:MinUnit*4,
        backgroundColor:'#00BCD4',
        borderRadius:MinUnit*2,
        alignItems:'center',
        justifyContent:'center'
    },
    btnShort:{
        width:ScreenWidth*0.4*0.4,
        height:MinUnit*4,
        backgroundColor:'#00BCD4',
        borderRadius:MinUnit*2,
        alignItems:'center',
        justifyContent:'center'
    },

});