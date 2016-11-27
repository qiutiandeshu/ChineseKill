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

export default class QuestionThree_PX extends Component {
    constructor(props) {
        super(props);
        //..this.arrContent = props.questionData.Q_Centents
        this.arrContent = this.getRndContent(props.questionData.Q_Centents)
        this.arrSelectTrueIndex = [];//记录被选中的box 实际的index
        this.state = {
            arrSelected: [],
            arrSelectedState:[],
            arrContentState: Array.from({length:this.arrContent.length}, ()=>'normal'),
        };

    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired
    };
    static defaultProps = {};

    getRndContent = (data)=>{
        let dataLength = data.length
        for(var i=0;i<dataLength;i++){
            let rnd = parseInt(dataLength * Math.random())
            if(rnd != i){
                let tmp = data[rnd];
                data[rnd] = data[i];
                data[i] = tmp;
            }
        }
        return data
    }

    componentWillUpdate(nProps,nState) {
        if(nProps.questionData != this.props.questionData){
            this.arrContent = []
            this.arrContent = this.getRndContent(nProps.questionData.Q_Centents)
            this.arrSelectTrueIndex = []
            this.setState({
                arrSelected:[],
                arrSelectedState:[],
                arrContentState:Array.from({length:this.arrContent.length}, ()=>'normal'),
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderTitle()}
                {this.renderQuestion()}
                {this.renderSelect()}
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

    renderSelect = ()=> {
        var boxes = []
        console.log("被选中的数量:",this.arrSelectTrueIndex.length)
        for(let i=0;i<this.arrSelectTrueIndex.length;i++){
            boxes.push(
                <Box key={i} content={this.state.arrSelected[i]} selectIndex = {i} unselectIndex = {this.arrSelectTrueIndex[i]}
                    showState = {this.state.arrSelectedState[i]} onPressBox = {this.onPressSelect.bind(this)}
                />
            )
        }
        return (
            <View style={styles.select}>
                <View style={styles.dummy}/>
                {boxes}
            </View>
        )
    }

    renderContents = ()=> {
        var boxes = []
        for(let i=0;i<this.arrContent.length;i++){
            boxes.push(
                <Box key={i} content={this.arrContent[i]} unselectIndex={i}
                     showState={this.state.arrContentState[i]} onPressBox = {this.onPressUnselect.bind(this)}/>
            )
        }
        return (
            <View style={styles.content}>
                {boxes}
            </View>
        );
    }

    onPressUnselect = (indexUnselect)=>{
        //点击了待选中的box
        //添加一个被选中的box,然后将被点击的这个状态改变了 (后期做移动,要new 可移动的box)
        let selectContents = this.state.arrSelected//获取当前选中BOX 数组
        let selectStates = this.state.arrSelectedState
        let selectCount = selectContents.length
        let unselectStates = this.state.arrContentState  //先定义并赋值一些临时变量
        if(this.state.arrSelected.length == 0){
            this.props.setCheckBtn(true)
        }
        selectContents[selectCount] = this.arrContent[indexUnselect] //想数组末尾添加一个"内容"
        selectStates[selectCount] = "normalSelected" //向数组末尾添加一个"状态"
        this.arrSelectTrueIndex[selectCount] = indexUnselect //记录下这个box真实的位置,以便取消时知道找自己的位置
        unselectStates[indexUnselect] = "hideNormal" //修改待选区某个的状态

        this.setState({
            arrSelected:selectContents,
            arrSelectedState:selectStates,
            arrContentState:unselectStates,
        })
    }

    onPressSelect = (indexSelect,indexUnselect)=>{
        //点击了已经选中的box
        //从已选中的box中删除这个对象,修改待选区的Box状态
        let selectContents = this.state.arrSelected;//获取当前选中BOX 数组
        let selectStates = this.state.arrSelectedState;
        let unselectStates = this.state.arrContentState  //先定义并赋值一些临时变量

        selectContents.copyWithin(indexSelect,indexSelect+1)//删掉选中的
        selectStates.copyWithin(indexSelect,indexSelect+1)//删掉选中的
        this.arrSelectTrueIndex.copyWithin(indexSelect,indexSelect+1)//删掉选中的
        selectContents.length -=1
        selectStates.length -=1
        this.arrSelectTrueIndex.length -=1
        if(selectContents.length == 0){
            this.props.setCheckBtn(false)
        }
        unselectStates[indexUnselect] = "normal"
        this.setState({
            arrSelected:selectContents,
            arrSelectedState:selectStates,
            arrContentState:unselectStates,
        })
    }

    checkAnswer = ()=> {
        let answerData = this.props.questionData.Q_Answer
        let checkAnswer = this.state.arrSelected
        console.log("我的答案:", checkAnswer, "正确答案:", answerData)
        if(answerData.toString() == checkAnswer.toString()){
            return "Right"
        }
        return "Wrong"
    }
}

class Box extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showState:props.initState,
        };
    }
    static propTypes = {
        unselectIndex:PropTypes.number.isRequired,
        selectIndex:PropTypes.number,
        content:PropTypes.string.isRequired,
        showState:PropTypes.string.isRequired,//初始状态 (normal(正常显示,可被选中),normalSelected(正常显示,已被选中),hideNormal(隐藏但能看到灰底色),selected(选中状态),hide(隐藏看不到底色))
        onPressBox:PropTypes.func,
    }

    render(){
        let backgroundColor = '#E3E3E3' // normal的背景色
        let color = '#050504' //normal字体颜色
        if(this.props.showState == "hideNormal"){
            backgroundColor = '#D4D4D4'
            color = '#D4D4D4'
        }
        return (
            <PanButton activeOpacity ={1} name={"btn"+this.props.content} style={[styles.box,{backgroundColor}]} onPress={this._onPress.bind(this)}>
                <Text style={[styles.text,{color}]}>{this.props.content}</Text>
            </PanButton>
        )
    }
    _onPress = ()=>{
        if(this.props.showState == "normal"){
            this.props.onPressBox(this.props.unselectIndex)
        }else if(this.props.showState == "normalSelected"){
            this.props.onPressBox(this.props.selectIndex,this.props.unselectIndex)
        }
    }
}

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
        //backgroundColor: '#ffff00',
    },

    select:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: ScreenHeight * 0.2,
        marginBottom:MinUnit*4,
    },
    dummy:{ //假的
        position:'absolute',
        left:0,
        bottom:MinUnit,
        height:ScreenHeight*0.1,
        width:ScreenWidth*0.8,
        borderTopWidth:MinWidth,
        borderBottomWidth:MinWidth,
        borderTopColor:'#D4D4D4',
        borderBottomColor:'#D4D4D4',
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: ScreenHeight * 0.2,
        //backgroundColor: 'yellow',
        justifyContent: 'center'
    },
    box:{
        height:ScreenHeight*0.07,
        padding:MinUnit*2,
        borderRadius:MinUnit,
        justifyContent:'center',
        alignItems:'center',
        marginHorizontal:MinUnit*1,
        marginVertical:MinUnit*1,

    },
    text:{
        fontSize:MinUnit*2,
    },
});