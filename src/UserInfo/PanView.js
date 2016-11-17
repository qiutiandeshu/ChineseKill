/**
 * Created by tangweishu on 16/8/26.
 */
import React, {Component, PropTypes} from 'react'
import {View,} from 'react-native'

export default class PanView2 extends Component {

    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
        this.myPanResponder = {}
        this.onPanGrantTime = 0;
        this.aMove = [];
        this.aMoveCount = 0;
        this.myTarget = -1;
    }

    static propTypes = {
        name:PropTypes.string.isRequired,
         
    };
    static defaultProps = {
        
    };

    componentWillMount() {

    }

    _onLayout = (evt)=>{
        this.myTarget = evt.nativeEvent.target;
        //..console.log(this.props.name,"target:",this.myTarget);
        if(this.props.onLayout){
            this.props.onLayout(evt);
        }
    }

    _onStartShouldSetResponder = (evt)=>{
        //console.log("onStartShouldSetResponder");
        return true;
    }

    _onResponderTerminationRequest = (evt)=>{
        //console.log("onResponderTerminationRequest");
        return true;
    }

    _onResponderGrant = (evt,)=>{
        //console.log("触摸开始:",evt.nativeEvent);
        this.onPanGrantTime = evt.nativeEvent.timestamp;
    }

    _onResponderMove = (evt)=>{
        //console.log("移动:",evt.nativeEvent);
        this.aMove[this.aMoveCount] = {"point":{x:evt.nativeEvent.pageX,y:evt.nativeEvent.pageY}}
        this.aMoveCount+=1;
    }

    _onResponderRelease = (evt)=>{
        //console.log("抬手:",evt.nativeEvent);
        var timestamp = evt.nativeEvent.timestamp - this.onPanGrantTime;
        if(this.aMoveCount == 0){//'抬手'这一手势,表示用户本次操作结束,通过判断对移动情况的记录,看是点击还是                     
            UB.addNonePress({
                "name":this.props.name,
                "point":{x:evt.nativeEvent.pageX,y:evt.nativeEvent.pageY},
                "pressTimes":timestamp,
            });
        }else{
            UB.addNoneScroll({
                "name":this.props.name,
                "orbit":this.aMove,
                "touchTimes":timestamp,
            });
            this.aMove = []
            this.aMoveCount = 0;
        }
    }

    setNativeProps = (props)=>{
        this.refs.view.setNativeProps(props);
    }

    render() {
        return (
            <View 
                {...this.props} ref = "view"
                onLayout = {this._onLayout.bind(this)}
                onStartShouldSetResponder={this._onStartShouldSetResponder.bind(this)}
                onResponderTerminationRequest = {this._onResponderTerminationRequest.bind(this)}

                onResponderGrant={this._onResponderGrant.bind(this)}
                onResponderMove = {this._onResponderMove.bind(this)}
                onResponderRelease = {this._onResponderRelease.bind(this)}
            >
                {this.props.children}
            </View>
        );
    }
}
 