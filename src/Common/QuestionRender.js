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
const PUNCTUATION = ['，', '。', '？', '“', '”', '！', '：', '（', '）', '；'];//标点符号集(中文符号)

export default class QuestionRender extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.initSyllabel(props)
    }
    static propTypes = {
        question:PropTypes.string.isRequired,
        pinyin:PropTypes.string,
        sound:PropTypes.string,
    }

    initSyllabel = (props)=>{
        this.wordCount = 0; //词汇数量
        this.arrWordStart = [];//词汇的起始位置
        this.arrWordLength = [];//词汇长度
        this.arrWord = [];//每个词汇的内容
        this.arrSyllableWord = [];//每个音节汉字的内容
        this.arrSyllablePY = [];//每个音节的拼音
        this.setSyllable(props.question,props.pinyin);

    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(
            ()=>{
                if(this.props.sound){
                    this.playQuestionSound(this.props.sound)
                }
            }
        )
    }

    shouldComponentUpdate(nProps,nStates) {
        if(this.props.question != nProps.question){
            this.initSyllabel(nProps)
            if(nProps.sound){
                this.playQuestionSound(nProps.sound)
            }
            return true
        }
        if(this.state != nStates){
            return true
        }
        return false;//这是一个不用刷新的组件
    }

    setSyllable = (words,pinyins)=>{         
        if(!pinyins)return;//如果没有拼音数据,就不往下进行了

        var dataSentWords = words;
        var dataSentPys = pinyins; //先获取到数据中的数值
        var sentWords = dataSentWords.split("_");//汉字内容第一层解析
        var sentPys = dataSentPys.split("_");//拼音内容第一层解析
        var syllCount = 0;
        this.arrWord = sentWords;
        if(sentWords.length != sentPys.length){//检查词汇格式是否匹配
            console.error("句子的词汇数与拼音数据中不符")           
        }else{
            this.wordCount = sentWords.length;//记录本句词汇的数量
            for(var i=0;i<sentWords.length;i++){
                var words = sentWords[i];//获取到句子中的每个词汇
                var pys = sentPys[i].split(" ");//拼音数据的第二层解析
                var wordsLength = words.length - this.getPunctuationCount(words);//获取除标点以外的词汇实际长度
                if(wordsLength != pys.length){//检查词汇中汉字与拼音是否一样多
                    logf("词汇中的字数与拼音数据中不符");
                }else{
                    this.arrWordStart[i] = syllCount;
                    this.arrWordLength[i] = words.length;//记录下当前词汇的长度
                    for(var j=0;j<words.length;j++){
                        var syllWord = words[j];
                        var syllPy = '';
                        var punctuationCount = 0;
                        if(PUNCTUATION.indexOf(words[j])>=0){
                            syllPy = '\n';
                            punctuationCount += 1;//跳过标点符号
                        }else if(words[j] == "*"){
                            syllPy = '\n';
                            syllWord = "_____"
                        }else{
                            syllPy = pys[j-punctuationCount] + '\n';
                        }
                        this.arrSyllableWord[syllCount] = syllWord;
                        this.arrSyllablePY[syllCount] = syllPy;
                        syllCount += 1;
                    }
                }
            }
        }
    }

    getPunctuationCount = (str)=> {
        var length = str.length;
        var count = 0;
        for (var i = 0; i < length; i++) {
            if (PUNCTUATION.indexOf(str[i]) >= 0) {
                count += 1;
            }
        }
        return count;
    }

    render(){
        return (
            <View style={styles.container}>
                {this.renderSoundIcon()}
                {this.renderContents()}
            </View>
        )
    }

    renderSoundIcon = ()=>{
        if(this.props.sound){
            return (
                    <PanButton name="btnPlaySound" style={{marginRight:MinUnit*4}} onPress={this.playQuestionSound.bind(this,this.props.sound)}>
                        <Icon name = "play-circle" size = {IconSize} color="#4BCFE1"/>
                    </PanButton>
                );
        }
    }

    playQuestionSound = (sound)=>{
        app.onPlaySound("Sound/"+sound,()=>{},this.props.sound,{})
    }

    renderContents = ()=>{
        if(this.props.pinyin){
            var arrSentence = [];
            for(var i=0;i<this.wordCount;i++){
                arrSentence.push(
                    <View style={styles.word} key={i}>
                        {this.getSyllable(i)}
                    </View>
                )
            }
            return <View style={styles.sentence}>{arrSentence}</View>
        }else{
            return (
                <Text style={styles.wordText}>{this.props.question}</Text>
            )
        }
    }

    getSyllable = (index)=>{
        var arrWord = [];
        for(var i=0;i<this.arrWordLength[index];i++){
            var startIndex = this.arrWordStart[index];
            arrWord.push(
                <Text key={startIndex + i} style={styles.pyText}>
                    {this.arrSyllablePY[startIndex + i]}
                    <Text style={styles.wordText}>{this.arrSyllableWord[startIndex+i]}</Text>
                </Text>
            );
        }
        return arrWord;
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        marginBottom:MinUnit*4,
        alignItems:'center'
    },
    sentence:{
        flexDirection:'row',
        flexWrap:'wrap',
        //backgroundColor:'red'
    },
    word:{
        flexDirection:'row',
        marginRight:MinUnit*1,
    },
    wordText:{
        fontSize:MinUnit*3,
        color:'black',
    },
    pyText:{
        fontSize:MinUnit*2,
        color:'black',
        marginRight:MinUnit*0.25,
        textAlign: 'center',
    }
});