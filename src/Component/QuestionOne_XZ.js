/**
 * Created by tangweishu on 16/11/21.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import QuestionRender from '../Common/QuestionRender'

export default class QuestionOne_XZ extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                logf("rowHasChange:", (r1 !== r2));
                return ( r1 !== r2)
            }
        });
        this.listData = this.initListData(props.questionData.Q_Contents, props.questionData.Q_Pics);

        this.state = {
            mySelect: -1,
            dataSource: ds.cloneWithRows(this.listData),
        };
        console.log("问题数据:", props.questionData)
    }

    static propTypes = {
        setCheckBtn: PropTypes.func.isRequired,
        questionData: PropTypes.object.isRequired
    };
    static defaultProps = {};

    resetQuestion = (questionData)=>{
        this.listData = this.initListData(questionData.Q_Contents,questionData.Q_Pics)
        console.log("初始化listData:", this.listData)
        this.setState({
            mySelect:-1,
            dataSource:this.state.dataSource.cloneWithRows(this.listData),
        })
    }

    initListData = (arrayData, arrayPic)=> {
        let listData = [];
        if (arrayPic) {
            if (arrayData.length != arrayPic.length) {
                console.error("数据错误,图片数量和文字数量不一致")
                return listData;
            }
        }
        let rndIndex = this.getRndIndex(arrayData.length)//获取一个随机的index,把选项位置打乱
        for (var i = 0; i < arrayData.length; i++) {
            let content = arrayData[rndIndex[i]]
            let pic = arrayPic ? arrayPic[rndIndex[i]] : ""
            listData[i] = {
                content: content,
                blnSelect: false,
                pic: pic,
            }
        }
        return listData
    }

    getRndIndex = (length)=> {
        let rndData = [];
        for (let i = 0; i < length; i++) {
            rndData[i] = i;
        }
        for (let i = 0; i < length; i++) {
            let rnd = parseInt(length * Math.random())
            if (rnd != i) {
                let tmp = rndData[i];
                rndData[i] = rndData[rnd];
                rndData[rnd] = tmp;
            }
        }
        return rndData
    }

    onPressOpition = (index)=> {
        let newData = this.listData.slice();
        let nextIndex = -1
        if (this.state.mySelect == index) {
            newData[index].blnSelect = false;
            this.itemUnselect(newData, index)
        } else {
            if (this.state.mySelect != -1) {
                this.itemUnselect(newData, this.state.mySelect)
            }
            this.itemSelect(newData, index)
            nextIndex = index
        }
        this.listData = newData;
        if (this.state.mySelect == -1) {
            this.props.setCheckBtn(true)
        } else {
            if (nextIndex == -1) {
                this.props.setCheckBtn(false)
            }
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(newData),
            mySelect: nextIndex,
        })
    }

    itemSelect = (data, index)=> {
        data[index] = {
            content: data[index].content,
            pic: data[index].pic,
            blnSelect: true,
        }
    }

    itemUnselect = (data, index)=> {
        data[index] = {
            content: data[index].content,
            pic: data[index].pic,
            blnSelect: false,
        }
    }

    componentWillUpdate(nProps,nState) {
        if(nProps.questionData != this.props.questionData){
            console.log("更新了题目")
            this.resetQuestion(nProps.questionData)
        }
    }

    render() {
        console.log("Render QuestionOne:",this.props.questionData)
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
            <ListView name="content" dataSource={this.state.dataSource}
                      renderRow={this.renderOpition.bind(this)}
                      scrollEnabled={false}
                      contentContainerStyle={this.props.questionData.Q_Pics?styles.photoList:styles.textList}
            />
        );
    }
    renderOpition = (rowData, sectionID, rowID)=> {
        const {content, blnSelect, pic} = rowData
        if (this.props.questionData.Q_Pics) {
            return <PhotoOpition blnSelect={blnSelect} content={content}
                                 opitionId={Number(rowID)} _onPress={this.onPressOpition.bind(this)}/>
        } else {
            return <TextOpition blnSelect={blnSelect} content={content}
                                opitionId={Number(rowID)} _onPress={this.onPressOpition.bind(this)}
            />
        }
    }

    checkAnswer = ()=>{
        let answerData = this.props.questionData.Q_Answer
        let checkAnswer = this.listData[this.state.mySelect].content
        console.log("我的答案:",checkAnswer,"正确答案:",answerData)
        if(answerData === checkAnswer){
            return "Right"
        }
        return "Wrong"
    }
}

class TextOpition extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static propTypes = {
        blnSelect: PropTypes.bool.isRequired,
        content: PropTypes.string.isRequired,
        opitionId: PropTypes.number.isRequired,
        _onPress: PropTypes.func.isRequired,
    }

    render() {
        return (
            <PanButton name={"btnOpition"+this.props.opitionId}
                       style={[styles.opition,this.props.blnSelect?styles.select:styles.unselect]}
                       onPress={this.onPressOpition.bind(this)}
            >
                <Icon name={this.props.blnSelect?"check-circle-o":"circle-o"}
                      size={IconSize*0.75} style={{marginRight:MinUnit*2}}
                      color={this.props.blnSelect?"white":"gray"}
                />
                <Text style={[UtilStyles.fontSmall]}>{this.props.content}</Text>
            </PanButton>
        )
    }

    onPressOpition = ()=> {
        this.props._onPress(this.props.opitionId)
    }
}

class PhotoOpition extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static propTypes = {
        blnSelect: PropTypes.bool.isRequired,
        content: PropTypes.string.isRequired,
        opitionId: PropTypes.number.isRequired,
        _onPress: PropTypes.func.isRequired,
    }

    render() {
        return (
            <PanButton name={"btnOpition"+this.props.opitionId}
                       onPress={this.onPressOpition.bind(this)}
                       style={[styles.photoOpition,this.props.blnSelect&&styles.photoSelect]}
            >
                <View style={{flexDirection:'row'}}>
                    <Icon name={this.props.blnSelect?"check-circle-o":"circle-o"}
                          size={IconSize*0.5} style={{marginRight:MinUnit*1}}
                          color={this.props.blnSelect?"white":"gray"}
                    />
                    <Text
                        style={[UtilStyles.fontSmall,{color:this.props.blnSelect?'white':'#615F60'}]}>{this.props.content}</Text>
                </View>

            </PanButton>
        )
    }

    onPressOpition = ()=> {
        this.props._onPress(this.props.opitionId)
    }
}

const styles = StyleSheet.create({
    container: {
        height: ScreenHeight * 0.7,
        //backgroundColor: '#ffff00',
    },
    opition: {
        flexDirection: 'row',
        height: MinUnit * 4,
        alignItems: 'center',
        marginBottom: MinUnit,
        paddingHorizontal: MinUnit,
    },
    select: {
        backgroundColor: '#4BCFE1',
        borderRadius: MinUnit,
    },
    unselect: {
        borderBottomColor: 'gray',
        borderBottomWidth: MinWidth,
    },
    photoOpition: {
        width: ScreenWidth * 0.2,
        height: ScreenWidth * 0.2,
        borderRadius: 10,
        padding: MinUnit,
        backgroundColor: '#EAEAEA',
    },
    photoSelect: {
        backgroundColor: '#4BCFE1',
    },
    textList: {},
    photoList: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'wrap',

        //paddingHorizontal: ScreenWidth * 0.25,
    },
});