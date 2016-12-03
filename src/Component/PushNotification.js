/**
 * Created by tangweishu on 16/12/2.
 */

import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'


import {StyleSheet, Text, View, PushNotificationIOS, Switch,DatePickerIOS} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class PushNotification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            setTime:new Date(),
            blnSwitch:false,
        };
    }

    static propTypes = {        
    };
    static defaultProps = {};

    componentWillMount() {
        if(app.storagePush){
            this.setState({
                setTime:new Date(app.storagePush.setTime),
                blnSwitch:app.storagePush.blnSwitch,
            })
        }
    }

    componentWillUpdate(nProps,nState) {
        
    }

    render() {
        return (
            <PanView name="pushNotificationBox" style={styles.container}>
                <View style={styles.msgView}>
                    <Text style={UtilStyles.fontSmall}>每日学习提醒</Text>
                    <Switch value={this.state.blnSwitch} onValueChange={this.onSwitch.bind(this,0)}/>
                </View>
                <View style={styles.timeView}>
                    <Text style={UtilStyles.fontSmall}>设置提醒时间</Text>
                    <Text style={UtilStyles.fontSmall}>{this.showTimeString(this.state.setTime)}</Text>
                </View>
                <DatePickerIOS mode="time" onDateChange={this._onTimeChange.bind(this)}
                               date={this.state.setTime}
                />
            </PanView>
        )
    }

    _onTimeChange = (time)=> {//时间被修改
        this.setState({
            setTime: time,
        })
        //console.log("当前设置时间:", time);
    }

    showTimeString = (time)=> {
        var hours = time.getHours();
        var halfDay = "上午"
        if (hours >= 12) {
            halfDay = "下午"
        } else if (hours < 12) {
            halfDay = "上午"
        }
        if (hours != 12) {
            hours = hours % 12;
        }
        var show = halfDay + hours + "点" + time.getMinutes() + "分"
        return show;
    }

    onSwitch = ()=> {
        var userInfo = {
            key: 0,
        }
        if (this.state.blnSwitch) {
            this.cancelLocalNotifications(userInfo);
            //取消推送1
        } else {
            this.scheduleLocalNotification(userInfo, this.state.setTime, "亲,开始学习哟!")
            //设置推送1
        }
        app.savePush({
            setTime:this.state.setTime,
            blnSwitch:!this.state.blnSwitch
        })
        this.setState({blnSwitch: !this.state.blnSwitch})
    }

    scheduleLocalNotification = (userInfo, planTime, alertMsg)=> {
        console.log("计划时间:", planTime);
        var notification = {
            fireDate: this.getPlanTime(planTime),
            alertBody: alertMsg,
            alertAction: '这是alertAction的信息',
            repeatInterval: 'day',
            applicationIconBadgeNumber: 1,
            userInfo: userInfo,
        }
        console.log("看看这个推送消息详情:",notification)
        PushNotificationIOS.scheduleLocalNotification(notification)
    }

    cancelLocalNotifications = (userInfo)=> {
        PushNotificationIOS.cancelLocalNotifications(userInfo);
    }

    getPlanTime = (date)=> {
        var year = date.getFullYear();
        var month = this.getStringNum(date.getMonth() + 1)
        var day = this.getStringNum((date.getDate()))

        var hour = this.getStringNum(date.getHours())//时间由外部传递
        var minute = this.getStringNum(date.getMinutes())//时间由外部传递
        var second = "00"
        var milliseconds = "000"
        var timeOffSet = date.getTimezoneOffset() / 60;
        var timezone = ""
        if (timeOffSet >= 0) {
            timezone = "-" + this.getStringNum(timeOffSet)
        } else {
            timezone = "+" + this.getStringNum(Math.abs(timeOffSet))
        }
        //..console.log("计算时差值:",timezone)
        var planTime = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second + "." + milliseconds + timezone + "00";
        //..console.log("计划时间:",planTime);
        return planTime;
    }
    getStringNum = (num, length = 2)=> { //返回一个
        var len = num.toString().length;
        while (len < length) {
            num = "0" + num;
            len++;
        }
        return num;
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        //backgroundColor:'yellow'
    },
    msgView:{
        flexDirection:'row',
        padding:MinUnit*2,
        alignItems:'center',
        justifyContent:'space-between',
        height:MinUnit*6,
        borderBottomWidth:MinWidth,
        borderBottomColor:'gray'
    },
    timeView:{
        flexDirection:'row',
        marginTop:MinUnit*1,
        justifyContent:'space-between',
        padding:MinUnit*2,
    }
});