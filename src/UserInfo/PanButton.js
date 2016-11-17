/**
 * Created by tangweishu on 16/8/29.
 */
import React, {Component, PropTypes} from 'react'
import {TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback} from 'react-native'

export default class PanButton extends Component {
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
        this.defDelayLongPress = this.props.onLongPress ? this.props.delayLongPress : 9999999
        //解决长按和点击的冲突,如果没有长按属性,就给个比较大的延时,保证onPress的执行
        this.onPressInTime = 0;
    }

    static propTypes = {
        name: PropTypes.string.isRequired,
        btnType: PropTypes.oneOf(["none", "opacity", "highlight"]),//按钮类型
        delayLongPress: PropTypes.number,//从onPressIn开始,到onLongPress被调用的延迟
    };

    static defaultProps = {
        btnType: "opacity",
        delayLongPress: 500,
    };

    _onLayout = (evt)=> {
        if (this.props.onLayout) {
            this.props.onLayout(evt);
        }
    }
    _onPress = (evt)=> {
        var timestamp = evt.nativeEvent.timestamp - this.onPressInTime;
        var pressObj = {
            "name": this.props.name,
            "point": {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY},
            "pressTimes": timestamp,
        }
        if (this.props.onPress) {
            //console.log("按了个钮:", this.props.name, event.nativeEvent,"时间:",event.nativeEvent.timestamp - this.onPressInTime);

            UB.addPress(pressObj);
            this.props.onPress(evt);
        } else {
            //console.log("按了个钮,但什么也没发生:", this.props.name, event.nativeEvent,"时间:",event.nativeEvent.timestamp - this.onPressInTime);

            if (timestamp > 200) {
                UB.addNoneLongPress(pressObj);
            } else {
                UB.addNonePress(pressObj);
            }
        }
    }

    _onLongPress = (evt)=> {
        var longPressObj = {
            "name": this.props.name,
            "point": {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY},
            "pressTimes": evt.nativeEvent.timestamp - this.onPressInTime,
        }
        if (this.props.onLongPress) {
            //console.log("长按了个钮",this.props.name,event.nativeEvent,"时间:",event.nativeEvent.timestamp - this.onPressInTime);

            UB.addLongPress(longPressObj);
            this.props.onLongPress(evt);
        } else {
            //console.log("长按了个钮,但什么也没发生",this.props.name,event.nativeEvent,"时间:",event.nativeEvent.timestamp - this.onPressInTime);

            UB.addNoneLongPress(longPressObj);
            //记录一个无效长按操作
        }
    }

    _onPressIn = (evt)=> {
        //console.log("按下去")
        this.onPressInTime = evt.nativeEvent.timestamp;
        if (this.props.onPressIn) {
            this.props.onPressIn(evt);
        }
    }

    _onPressOut = (evt)=> {
        //console.log("释放")
        if (this.props.onPressOut) {
            this.props.onPressOut(evt);
        }
    }

    setNativeProps = (props)=> {
        this.refs.touch.setNativeProps(props);
    }

    render() {
        //console.log("this.props:", this.props);
        const {btnType,} = this.props;
        const hitslop = {top: 15, bottom: 15, left: 15, right: 15}
        if (btnType == "none") {
            return (
                <TouchableWithoutFeedback
                    {...this.props} ref="touch"
                                    delayLongPress={this.defDelayLongPress}
                                    onLayout={this._onLayout.bind(this)}
                                    onPress={this._onPress.bind(this)}
                                    onLongPress={this._onLongPress.bind(this)}
                                    onPressIn={this._onPressIn.bind(this)}
                                    onPressOut={this._onPressOut.bind(this)}
                                    hitSlop={hitslop}
                >
                    {this.props.children}
                </TouchableWithoutFeedback>
            );
        } else if (btnType == "opacity") {
            return (
                <TouchableOpacity
                    {...this.props} ref="touch"
                                    delayLongPress={this.defDelayLongPress}
                                    onLayout={this._onLayout.bind(this)}
                                    onPress={this._onPress.bind(this)}
                                    onLongPress={this._onLongPress.bind(this)}
                                    onPressIn={this._onPressIn.bind(this)}
                                    onPressOut={this._onPressOut.bind(this)}
                                    hitSlop={hitslop}
                >
                    {this.props.children}
                </TouchableOpacity>
            );
        } else if (btnType == "highlight") {
            return (
                <TouchableHighlight
                    {...this.props} ref="touch"
                                    delayLongPress={this.defDelayLongPress}
                                    onLayout={this._onLayout.bind(this)}
                                    onPress={this._onPress.bind(this)}
                                    onLongPress={this._onLongPress.bind(this)}
                                    onPressIn={this._onPressIn.bind(this)}
                                    onPressOut={this._onPressOut.bind(this)}
                                    hitSlop={hitslop}
                >
                    {this.props.children}
                </TouchableHighlight>
            );
        }
    }
}