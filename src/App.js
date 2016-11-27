/**
 * Created by tangweishu on 16/9/18.
 */

import React, {Component} from 'react'
import {
    View, Text, Navigator, StyleSheet, StatusBar,
    AppState, AsyncStorage, AlertIOS, Platform
} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles} from './AppStyles'
import Storage from 'react-native-storage'
import UserBehavior from './UserInfo/UserBehavior'
import {RouteList, RouteIndex} from './AppRoutes'
const defaultStatusBar = false; //默认的状态栏属性
import SocketLink from './Component/SocketLink.js'
export default class App extends Component {
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            blnShowStatusBar: defaultStatusBar, //是否显示状态栏
            blnLoading:true,
        };
        this.blnUpdate = false; //一个标记是否上传了用户操作数据的变量,作用是在用户恢复app时,检测算新启动还是只算从后台恢复
        this.appState = 'active';//初始的app状态
        this.closeTime = null;//计时器, 当用户在后台多长时间后,就当做用户已经退出,并上传本次使用情况
        global.app = this;//定义一个全局变量,可以在项目中随时访问主类 (不建议经常使用,而是将app中的各大通用功能分成模块,就像global.UB,global.Storage)
        global.logf = this.Logf.bind(this);//重写的一个log函数,方便调试用
        this.allLessonData = [];
        this.lessonChapterCount = [];
        this.routeProps = {allLessonData:this.allLessonData};//页面跳转时,从A页面到B页面需要传递的消息
        this.routeStackNowIndex = 0;//route堆栈的序号,其实现在只会一条堆栈的导航,还不会多条堆栈的
        this.initRouteName = "Home";//初始页面的名称
        this.nowSceneName = "";
        //..this.setNowPageName(this.getRoute(this.initRouteName))
        this.sceneRef = null;//当前页面的引用对象
        this.storage = new Storage(
            {
                size: 2000,//最大容量,默认值2000条数据循环存储
                storageBackend: AsyncStorage,//定义存储引擎,如果不指定则数据只会保存在内存中重启后消失
                defaultExpires: null,//(单位:毫秒) 数据过期时间,默认为24小时,设置为null为永不过期
                enableCache: true,//读写时在内存中缓存数据.默认启用
            }
        );
       
        /*-----------本地存储数据有关的变量 Start--------------*/
        this.storageUserInfo = null;//用户信息
        this.storageLearning = [];//学习进度
        this.storageCardInfo = null;//卡片情况
        /*-----------本地存储数据有关的变量 End--------------*/
    }

    componentWillMount() {
        // 连接服务器
        global.socket = new SocketLink(this);
        this.getLessonDate()
        this.initUserInfoByStorage()
        this.initLearningByStorage()
        this.initCardInfoByStorage()
    }

    componentDidMount() {
        //..this.logDeviceInfo(); 打印设备信息
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        global.UB = new UserBehavior(this, require('react-native-device-info'));
        //this.removeAllStorageData()
    }


    /*--------------------------本地数据存储部分 Start-----------------------*/
    initUserInfoByStorage = ()=>{
        this.storage.load({key:'UserInfo'}).then(
            ret=>{
                console.log("读取到UserInfo:",ret)
                this.storageUserInfo = ret
            }
        ).catch (err=>{
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    console.log("没有找到UserInfo相关数据")
                    break;
                case 'ExpiredError'://相关数据已过期
                    console.log("UserInfo数据过期了")
                    break;
            }
        })       
    }

    noneUserInfoStorage = ()=>{

    }

    saveUserInfo = (saveData,expires=null)=>{
        this.storage.save({
            key:'UserInfo',
            rawData:saveData,
            expires:expires
        })
    }

    initLearningByStorage = ()=>{
        this.storage.getAllDataForKey('Learning').then(
            ret =>{
                console.log("读取到Learning:",ret)
                if(ret.length != this.allLessonData.length){//如果这个key里面没有数据,则初始化以下
                    this.noneLearningStorage(ret)
                }else{
                    this.storageLearning = ret //赋值

                }
                this.setState({blnLoading:false})
            }
        )
    }

    noneLearningStorage = (retData)=>{//传入已经保存的数据
        console.log("None Learning Storage:",retData)
        for(let i=0;i<this.allLessonData.length;i++){
            //console.log("检查index:",i)
            this.storageLearning[i] = {
                chapterStates:[],
                chapterScores:[],
                chapterTimes:[],
            }
            if(i<retData.length){//当前的是已经存在本地的数据
                let data = retData[i]
                for(let j=0;j<data.chapterStates.length;j++){
                    this.storageLearning[i].chapterStates[j] = data.chapterStates[j]
                    this.storageLearning[i].chapterScores[j] = data.chapterScores[j]
                    this.storageLearning[i].chapterTimes[j] = data.chapterTimes[j]
                }
            }else{
                let data = this.allLessonData[i]
                //console.log("show data:",data,i);
                for(let j=0;j<data.chapters.length;j++){
                    if(i==0&&j==0){
                        this.storageLearning[i].chapterStates[j] = 'unlocked'
                    }else{
                        this.storageLearning[i].chapterStates[j] = 'locked'
                    }
                    this.storageLearning[i].chapterScores[j] = 0
                    this.storageLearning[i].chapterTimes[j] = 0
                }
            }
            this.storage.save({
                key:'Learning',
                id:this.getSaveId(i),
                rawData:this.storageLearning[i],
                expires:null,
            })
        }
    }
    
    getStorageLearning = ()=>{
        return this.storageLearning
    }

    saveLearningStorage = (lessonId,chapterId,saveData)=>{
        const {state,score,time} = saveData
        this.storageLearning[lessonId].chapterStates[chapterId] = state;
        this.storageLearning[lessonId].chapterScores[chapterId] = score;
        this.storageLearning[lessonId].chapterTimes[chapterId] = time;
        this.storage.save({
            key:'Learning',
            id:this.getSaveId(lessonId),
            rawData:this.storageLearning[lessonId],
            expires:null,//永不过期
        })
    }

    initCardInfoByStorage = ()=>{
        this.storage.load({key:'CardInfo'}).then(
            ret=>{
                console.log("读取到CardInfo:",ret)
                this.storageCardInfo = ret
            }
        ).catch (err=>{
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    console.log("没有找到CardInfo相关数据")
                    break;
                case 'ExpiredError'://相关数据已过期
                    console.log("CardInfo数据过期了")
                    break;
            }
        })
    }

    noneCardInfoStorage = ()=>{
        let maxZiCard = 3000;
        let maxCiCard = 10000;
        let maxJuCard = 1000; //临时的卡片最大值,实际应该数据给或者从服务器获取,并且在读取数据时,还得检测才行做好扩容的预算

        this.storageCardInfo = {
            learnCards:{
                ziKey:[],
                ciKey:[],
                juKey:[],
            },//存储已经学习的卡片
            cardQuestion:{
                ziCards:Array.from({length:maxZiCard}, ()=>[]),
                ciCards:Array.from({length:maxCiCard}, ()=>[]),
                juCards:Array.from({length:maxJuCard}, ()=>[]),
            }//用来记录所有卡片的题目,对象的属性是一个二维的数组,通过key值来索引到第二维数据
        }
    }

    getCardInfo =()=>{
        return this.storageCardInfo
    }

    saveCardInfo = (newLearnCards,newQuestions,lessonId,chapterId)=>{
        const {cardZis,cardCis,cardJus} = newLearnCards
        if(cardZis){
            this.storageCardInfo.learnCards.ziKey.concat(cardZis)
        }
        if(cardCis){
            this.storageCardInfo.learnCards.ciKey.concat(cardCis)
        }
        if(cardJus){
            this.storageCardInfo.learnCards.juKey.concat(cardJus)
        }
        for(let i=0;i<newQuestions.length;i++){
            if(newQuestions[i]){
                const {ziCards,ciCards,juCards} = newQuestions[i]
                let practice = {
                    lessonId:lessonId,
                    chapterId:chapterId,
                    practiceId:i,
                } //记录题目的信息
                if(ziCards){
                    for(let i=0;i<ziCards.length;i++){
                        this.storageCardInfo.cardQuestion.ziCards[ziCards[i]].concat(practice)
                    }
                }
                if(ciCards){
                    for (let i=0;i<ziCards.length;i++){
                        this.storageCardInfo.cardQuestion.ciCards[ciCards[i]].concat(practice)
                    }
                }
                if(juCards){
                    for(let i=0;i<juCards.length;i++){
                        this.storageCardInfo.cardQuestion.juCards[juCards[i]].concat(practice)
                    }
                }
            }
        }
        this.storage.save({
            key:'CardInfo',
            rawData:this.storageCardInfo,
            expires:expires
        })
    }

    getSaveId = (id,blnStartOne=true)=>{ //默认传进来的id都会+1,
        let size = 2000
        let saveId = size + id
        if(blnStartOne){
            saveId += 1
        }
        return saveId+""
    }

    removeStorageData = (key,id)=> {// 删除单个数据
        this.storage.remove({
            key:{key},
            id:{id}
        })
    }

    removeAllStorageData = ()=> {//清空map，移除所有"key-id"数据（但会保留只有key的数据）
        this.storage.clearMap();
    }


/*--------------------------本地数据存储部分End-----------------------*/

    getLessonDate = ()=>{
        this.allLessonData[0] = require('../data/lessons/lesson1.json')
        this.allLessonData[1] = require('../data/lessons/lesson2.json')
        this.allLessonData[2] = require('../data/lessons/lesson3.json')
        this.allLessonData[3] = require('../data/lessons/lesson4.json')

        for(let i=0;i<this.allLessonData.length;i++){
            this.lessonChapterCount[i] = this.allLessonData[i].chapters.length
        }
    }

    getLessonCount = ()=>{
        return this.allLessonData.length
    }
    
    getChapterCount = (lessonId)=>{
        return this.lessonChapterCount[lessonId]
    }

    Logf(message, ...optionalParams) {
        // var args = arguments.length;
        //console.log(message, ...optionalParams);
    }

    setNowPageName = (route)=> { //ScrollViewTab调用
        if (route.type) {
            if (route.type == 'Scene') {
                this.nowSceneName = route.name;
                if (global.UB) {
                    global.UB.changeScene(this.nowSceneName);
                }
            }
        } else {
            this.nowSceneName = route.name;
            if (global.UB) {
                global.UB.changeScene(this.nowSceneName);
            }
        }
    }

    logDeviceInfo = ()=> {
        var DeviceInfo = require('react-native-device-info');

        console.log("Device Unique ID", DeviceInfo.getUniqueID());  // e.g. FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9
// * note this is IDFV on iOS so it will change if all apps from the current apps vendor have been previously uninstalled

        console.log("Device Manufacturer", DeviceInfo.getManufacturer());  // e.g. Apple

        console.log("Device Brand", DeviceInfo.getBrand());  // e.g. Apple / htc / Xiaomi

        console.log("Device Model", DeviceInfo.getModel());  // e.g. iPhone 6

        console.log("Device ID", DeviceInfo.getDeviceId());  // e.g. iPhone7,2 / or the board on Android e.g. goldfish

        console.log("System Name", DeviceInfo.getSystemName());  // e.g. iPhone OS

        console.log("System Version", DeviceInfo.getSystemVersion());  // e.g. 9.0

        console.log("Bundle ID", DeviceInfo.getBundleId());  // e.g. com.learnium.mobile

        console.log("Build Number", DeviceInfo.getBuildNumber());  // e.g. 89

        console.log("App Version", DeviceInfo.getVersion());  // e.g. 1.1.0

        console.log("App Version (Readable)", DeviceInfo.getReadableVersion());  // e.g. 1.1.0.89

        console.log("Device Name", DeviceInfo.getDeviceName());  // e.g. Becca's iPhone 6

        console.log("User Agent", DeviceInfo.getUserAgent()); // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)

        console.log("Device Locale", DeviceInfo.getDeviceLocale()); // e.g en-US

        console.log("Device Country", DeviceInfo.getDeviceCountry()); // e.g US

        //console.log("App Instance ID", DeviceInfo.getInstanceID());//ANDROID ONLY
    }

    componentWillUnMount() {
        console.log("App is closed");
        AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
        // stop服务器连接
        socket.stopLink();
    }

    _handleAppStateChange = (state)=> {
        console.log("当前APP的状态是:", state)
        if (state == 'inactive') {//由active到background的过渡状态
        } else if (state == 'active') {//应用在前台运行
            if (this.blnUpdate) {
                this.appStartTime = new Date();
                console.log("启动时间:", this.appStartTime.toString(), typeof(this.appStartTime));
            } else {
                clearTimeout(this.time);
            }
        } else if (state == 'background') {//应用在后台运行
            this.time = setTimeout(this.updateUserMsg, 30000);
        }
        this.appState = state;
    }

    updateUserMsg = ()=> {
        console.log("上传用户数据&停用时间", new Date());
        this.blnUpdate = true;
        global.UB.update();//这里应该有个回调函数 作为参数,告诉是否上传成功
    }

    render() {
        //console.log("APP Render",this.state.blnLoading)
        if(this.state.blnLoading){
            return (<View/>)
        }
        return (
            <Navigator
                initialRoute={this.getRoute(this.initRouteName)}
                //initialRouteStack = {RouteList}
                configureScene={this._configureScene}
                renderScene={this._renderScene}
                onWillFocus={this._onWillFocus.bind(this)}
                onDidFocus={this._onDidFocus.bind(this)}
                sceneStyle={this.state.blnShowStatusBar?{paddingTop:MinUnit*4}:{marginTop: 0}}
                //navigationBar={this.renderNavBar()}
            />
        );
    }

    _configureScene = (route, routeStack)=> {
        //console.log("configureScene:",route.name)

        if (route.configure) {
            return this.getRouteConfigure(route.configure)
        }
        return Navigator.SceneConfigs.PushFromRight;
    }

    _onWillFocus = (route)=> {
        if (route.showStatusBar != null) {
            this.setState({
                blnShowStatusBar: route.showStatusBar,
            });
        } else {
            this.setState({
                blnShowStatusBar: defaultStatusBar,
            });
        }
    }

    _onDidFocus = (route)=> {
        //console.log("On Did Focus")
        //this.routeProps = {};//当页面跳转完成清除属性
        if (route.type) {
            if (route.type === 'Scene') {
                this.setNowPageName(route)
            } else {
                this.setNowPageName(this.sceneRef.getNowScene())
            }
        } else {
            this.setNowPageName(route)
        }
    }

    _renderScene = (route, navigator)=> {
        this.routeStackNowIndex = navigator.state.presentedIndex;
        if (StatusBar != null) {
            StatusBar.setHidden(!this.state.blnShowStatusBar, false);
        }
        let Component = route.component;
        //console.log("App Renider Scene Route Props:",this.routeProps)
        return <Component ref={this.setSceneRef.bind(this)}  {...this.routeProps} navigator={navigator}/>
    }

    setSceneRef = (ref)=> {
        this.sceneRef = ref;
    }

    setNextRouteProps = (props)=> {
        //console.log("Set Next Route Props:",props)
        //console.log("Next Route Props Type:",typeof(props))
        this.routeProps = props;
        //console.log("Set Next Route Props:",this.routeProps)
    }

    getRoute = (name) => {
        var index = RouteIndex[name];
        if (index >= 0) {
            return {...RouteList[index]};//对RouteList进行对象深拷贝
        } else {
            console.log("没有找到此页面");
        }
    }

    getRouteStackLength = ()=> {
        var routes = this.refs.navigator.getCurrentRoutes();
        return routes.length;
    }

    getStackRouteFirst = (name)=> {
        var routes = this.refs.navigator.getCurrentRoutes();
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (route.name == name) {
                return route;
            }
        }
        console.log("getStackRouteFirstError:堆栈中没有此页面")
    }

    getStackRouteLast = (name)=> {
        var routes = this.refs.navigator.getCurrentRoutes();
        for (var i = routes.length - 2; i > 0; i--) {
            var route = routes[i];
            if (route.name == name) {
                return route;
            }
        }
        console.log("getStackRouteLastError:堆栈中没有此页面")
    }

    getRouteConfigure = (strConfigure)=> {
        var configure = Navigator.SceneConfigs.PushFromRight;
        if (strConfigure) {
            switch (strConfigure) {
                case 'FFR':
                    configure = Navigator.SceneConfigs.FloatFromRight;
                    break;
                case 'FFL':
                    configure = Navigator.SceneConfigs.FloatFromLeft;
                    break;
                case 'FFB':
                    configure = Navigator.SceneConfigs.FloatFromBottom;
                    break;
                case 'FFB_A':
                    configure = Navigator.SceneConfigs.FloatFromBottomAndroid;
                    break;
                case 'F_A':
                    configure = Navigator.SceneConfigs.FadeAndroid;
                    break;
                case 'HSJ':
                    configure = Navigator.SceneConfigs.HorizontalSwipeJump;
                    break;
                case 'HSJFR':
                    configure = Navigator.SceneConfigs.HorizontalSwipeJumpFromRight;
                    break;
                case 'VUSJ':
                    configure = Navigator.SceneConfigs.VerticalUpSwipeJump;
                    break;
                case 'VDSJ':
                    configure = Navigator.SceneConfigs.VerticalDownSwipeJump;
                    break;
            }
        }
        return configure;
    }

    objectIsEqual = (object1, object2)=> {//比较两个对象值是否全等
        if (object1 === object2) {
            return true;
        }
        if (!(object1 instanceof Object) || !(object2 instanceof Object)) {
            return false;
        }
        if (object1.constructor !== object2.constructor) {
            return false;
        }
        for (var p in object1) {
            if (object1.hasOwnProperty(p)) {
                if (!object2.hasOwnProperty(p)) {
                    return false;
                }
            }
            if (object1[p] === object2[p]) {
                continue;
            }
            var type = typeof(object1[p])
            if (type === 'function') {
                continue;
            }
            if (type !== 'object') {
                return false;
            }
            if (!this.objectIsEqual(object1[p], object2[p])) {
                return false;
            }
        }
        for (p in object2) {
            if (object2.hasOwnProperty(p) && !object1.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    }
}

const styles = StyleSheet.create({
    
});
