/**
 * Created by tangweishu on 16/11/17.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class S_LessonMenus extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.baseProps = props;//在页面保存一下属性,以便pop到此页面时,还能找到属性
        //console.log("lesstonData:",props.lessonData)
    }
    static propTypes = {
        lessonData: PropTypes.object.isRequired,
    };
    static defaultProps = {
        lessonData:{title:"null",icon:"none",lessonTitle:["none","none"]}
    };
    shouldComponentUpdate(nProps,nStates) {
        if(nStates != this.state){
            return true;
        }
        return false;
    }

    render() {    
        const {title,icon,lessonTitle} = this.props.lessonData;
        console.log("Scene LessonMenus Render")
        return (
            <PanView name = "S_LessonMenus" style={styles.container}>
                <View style={styles.titleView}>
                    <PanButton name="btnLessonMenusBack" onPress={this.onBackScene.bind(this)}>
                        <Icon name="angle-left" size={IconSize} color='white'/>
                    </PanButton>
                    <Text style={[UtilStyles.fontNormal,styles.titleText]}>{title}</Text>
                    <View/>
                </View>
                <Icon name = "car" size={60} style={{marginTop:MinUnit*5,marginBottom:MinUnit*15}} />
                <LessonCard index={0} cardCount = {this.props.lessonData.lessonTitle.length}
                            contentData={this.props.lessonData.lessonTitle[0]} onPressStart={this.startPractice.bind(this)}
                />
            </PanView>
        );
    }

    onBackScene = ()=>{
        this.props.navigator.pop();
    }

    startPractice = ()=>{
        let questions = this.baseProps.lessonData.lessonTitle[0].questions
        console.log("问题S:",questions);
        app.setNextRouteProps({questionData:questions})
        this.props.navigator.push(app.getRoute("Practice"));
    }
}


class LessonCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    static propTypes = {
        index:PropTypes.number.isRequired,//卡片index
        cardCount:PropTypes.number.isRequired,//卡片总数
        contentData:PropTypes.object.isRequired,
        blnPassed:PropTypes.bool,
        onPressStart:PropTypes.func.isRequired,
    }
    static defaultProps = {
        blnPassed:false,
    }

    render(){
        return (
            <Animated.View>
                <PanView name={"card"+this.props.index} style={styles.card}>
                    <Text style={[UtilStyles.fontSmall,{color:'#7F7F7F'}]}>LESSON</Text>
                    {this.renderIndex()}
                    {this.renderMessage()}
                    {this.renderCardButton()}
                </PanView>
            </Animated.View>
        );
    }
    renderIndex = ()=>{
        let nowIndex = this.props.index + 1;
        return (
            <View >
                <Text style={[UtilStyles.fontNormal,{color:'black',}]}>
                    {nowIndex + "/" + this.props.cardCount}
                </Text>
                {<Icon style={{position:'absolute',top:MinUnit,right:-MinUnit*4}} name="check-circle" color="#00BCD4" size={IconSize*0.5}/>}
            </View>
        );
    }

    renderMessage = ()=>{
        console.log("Show contentData:",this.props.contentData)
        return (
            <View style={{alignItems:'center'}}>
                {this.props.contentData.sentence && <Text style={{fontSize:MinUnit*2,color:'#CACACA'}}>{this.props.contentData.sentence}</Text>}
                {this.props.contentData.words && <Text style={{fontSize:MinUnit*2,color:'#CACACA'}}>{this.props.contentData.words}</Text>}
            </View>
        )
    }

    renderCardButton = ()=>{
        if(this.props.blnPassed){
            return (
                <View style={{width:ScreenWidth*0.4,flexDirection:'row',justifyContent:'space-around'}}>
                    <PanButton style={styles.btnShort} name="btnShort1">
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>REDO</Text>
                    </PanButton>
                    <PanButton style={styles.btnShort} name="btnShort2">
                        <Text style={[UtilStyles.fontSmall,{color:'white'}]}>REVIEW</Text>
                    </PanButton>
                </View>
            );
        }
        return (
            <PanButton name = 'btnLong'style={styles.btnLong} onPress={this._onStartPractice.bind(this)}>
                <Text style={[UtilStyles.fontSmall,{color:'white'}]}>START</Text>
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
    card:{
        backgroundColor:'white',
        width:ScreenWidth*0.4,
        height:ScreenHeight*0.4,
        paddingHorizontal:MinUnit*2,
        paddingVertical:MinUnit*2,
        justifyContent:'space-between',
        borderRadius:MinUnit*1,
        alignItems:'center',
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