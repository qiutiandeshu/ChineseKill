/**
 * Created by tangweishu on 16/11/17.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView, AlertIOS} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'

import Icon from 'react-native-vector-icons/FontAwesome'
export default class S_Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioTimes:[0,0,0,0],
            audioNowTimes:[0,0,0,0],
            audioStates:['stop','stop','stop','stop'],

            audioState0:'stop',
            audioNowTime0:0,
            audioState1:'stop',
            audioNowTime1:0,
        };        
        this.audoName = []
        for(let i=0;i<4;i++){
            this.audoName[i] = "testaudio/"+i+".mp3";
        }
    }
    render(){
        let buttons = []
        let audioStr = ['你叫什么? ','我叫李小龙 ','你是哪国人 ','我是中国人 ']
        for(i=1;i<=4;i++){
            let str = "音频:"+audioStr[i-1]+"时长"+this.state.audioTimes[i-1]+"当前状态:"+this.state.audioStates[i-1]+"播放进度:"+this.state.audioNowTimes[i-1]
            buttons.push(
                <TouchableOpacity name = {'btn'+i} key={i-1} style={{backgroundColor:'skyblue',width:ScreenWidth*0.7,height:MinUnit*5,margin:MinUnit*2}}
                           onPress={this.onPlayAudio.bind(this,i-1)}
                >
                    <Text style={{fontSize:20}}>{str}</Text>
                </TouchableOpacity>
            )
        }
        let str0 = "音频:你叫什么?"+"时长"+this.state.audioTimes[0]+"当前状态:"+this.state.audioState0+"播放进度:"+this.state.audioNowTime0;
        let str1 = "音频:我叫李小龙?"+"时长"+this.state.audioTimes[1]+"当前状态:"+this.state.audioState1+"播放进度:"+this.state.audioNowTime1;
        //console.log("Show str0:",str0)
        //console.log("Show str1:",str1)
        return (

            <PanView name="testView" style={{flex:1,backgroundColor:'white'}} >
                {buttons}
                <PanButton name = {'btn'+5}  style={{backgroundColor:'skyblue',width:ScreenWidth*0.7,height:MinUnit*5,margin:MinUnit*2}}
                           onPress={this.onPlayAudioByName.bind(this,this.audoName[0],'btn5')}
                >
                    <Text style={{fontSize:20}}>{str0}</Text>
                </PanButton>
                <PanButton name = {'btn'+6}  style={{backgroundColor:'skyblue',width:ScreenWidth*0.7,height:MinUnit*5,margin:MinUnit*2}}
                           onPress={this.onPlayAudioByName.bind(this,this.audoName[1],'btn6')}
                >
                    <Text style={{fontSize:20}}>{str1}</Text>
                </PanButton>
            </PanView>
        );
    }

    onPlayAudio = (i,event)=>{
        console.log("on play audio:",event.target)
        app.onPlaySound(this.audoName[i],this.callbackPlay.bind(this,i),i,{})
    }

    onPlayAudioByName = (audioName,name,event)=>{
        console.log("on play audio:",event)
        app.onPlaySound(audioName,this.callbackPlayByName.bind(this,name),name,{rate:0.5})
    }

    callbackPlayByName = (name,data)=>{
        //..console.log("test callback",name,data.type,data.message)
        switch (data.type){
            case 'initError'://音频初始化错误
                //console.log("音频初始化错误:",data.message)
                AlertIOS.alert("音频"+name,"初始化错误"+data.message)
                break;
            case 'firstPlay': //首次播放会返回音频的时长
                if(name == 'btn5'){
                    this.changeState('audioTimes',0,data.message)
                    this.setState({audioState0:'play'})
                }else if(name == 'btn6'){
                    this.changeState('audioTimes',1,data.message)
                    this.setState({audioState1:'play'})
                }
                //console.log("音频",index,"时长",data.message)
                break;
            case 'play': //非首次播放音频
                if(name == 'btn5'){
                    this.setState({audioState0:'play'})
                }else if(name == 'btn6'){
                    this.setState({audioState1:'play'})
                }
                break;
            case 'pause'://音频被暂停
                if(name == 'btn5'){
                    this.setState({audioState0:'pause'})
                }else if(name == 'btn6'){
                    this.setState({audioState1:'pause'})
                }
                break;
            case 'stop'://音频被停止
                if(name == 'btn5'){                    
                    this.setState({audioState0:'stop',audioNowTime0:0})
                }else if(name == 'btn6'){
                    this.setState({audioState1:'stop',audioNowTime1:0})
                }
                break;
            case 'resume'://从暂停状态恢复
                if(name == 'btn5'){
                    this.setState({audioState0:'play'})
                }else if(name == 'btn6'){
                    this.setState({audioState1:'play'})
                }
                break;
            case 'repeat'://重播
                if(name == 'btn5'){
                    this.setState({audioNowTime0:0})
                }else if(name == 'btn6'){
                    this.setState({audioNowTime1:0})
                }
                break;
            case 'playEnd'://播放结束
                if(name == 'btn5'){
                    this.setState({audioState0:'stop',audioNowTime0:0})
                }else if(name == 'btn6'){
                    this.setState({audioState1:'stop',audioNowTime1:0})
                }
                break;
            case 'cTime'://当前播放时间
                if(name == 'btn5'){
                    this.setState({audioNowTime0:data.message})
                }else if(name == 'btn6'){
                    this.setState({audioNowTime1:data.message})
                }
                break;
        }
    }

    callbackPlay = (index,data)=>{        
        //..console.log("test callback",index,data.type,data.message)
        switch (data.type){
            case 'initError'://音频初始化错误
                //console.log("音频初始化错误:",data.message)
                AlertIOS.alert("音频"+index,"初始化错误"+data.message)
                break;
            case 'firstPlay': //首次播放会返回音频的时长
                this.changeState('audioTimes',index,data.message)
                this.changeState('audioStates',index,'play')
                //console.log("音频",index,"时长",data.message)
                break;
            case 'play': //非首次播放音频
                this.changeState('audioStates',index,'play')
                break;
            case 'pause'://音频被暂停
                this.changeState('audioStates',index,'pause')
                break;
            case 'stop'://音频被停止
                this.changeState('audioNowTimes',index,0)
                this.changeState('audioStates',index,'stop')
                break;
            case 'resume'://从暂停状态恢复
                this.changeState('audioStates',index,'play')
                break;
            case 'repeat'://重播
                this.changeState('audioNowTimes',index,0)
                break;
            case 'playEnd'://播放结束
                this.changeState('audioStates',index,'stop')
                this.changeState('audioNowTimes',index,0)
                break;
            case 'cTime'://当前播放时间
                this.changeState('audioNowTimes',index,data.message)
                break;
        }
    }

    changeState = (stateKey,index,value)=>{
        let tempKey = Object.assign({},this.state)
        tempKey[stateKey][index] = value
        //console.log("changeState:",tempKey[stateKey])
        this.setState(tempKey)
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },

    titleView: {
        flexDirection: 'row',
        height: MinUnit * 6,
        paddingHorizontal: MinUnit * 2,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    titleText: {
        fontSize: MinUnit * 4,
        color: 'black',
    },
    contentView:{
        width:ScreenWidth,
        height:ScreenHeight,
        //flex:1,
        backgroundColor:'#fff000',
        alignSelf:'center'
    },
    listContent:{
        justifyContent: 'space-between',
        //marginTop:MinUnit*12,
        //flexDirection:'row',
        //flexWrap:'wrap',
        paddingHorizontal:ScreenWidth*0.25,
    },
    card:{
        width:MinUnit*10,
        height:MinUnit*12,
        backgroundColor:'skyblue',
        marginVertical:MinUnit*2,
        marginHorizontal:MinUnit*2,
        justifyContent:'space-between',
        alignItems:'center'
    },
});