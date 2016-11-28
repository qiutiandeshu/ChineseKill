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
import {Chivox, cv} from './Utils/Chivox.js';
import FBLogin from './Utils/FBLogin.js';
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
        this.getLessonDate();
        this.initUserInfoByStorage();
        this.initLearningByStorage();
        this.initCardInfoByStorage();

        //驰声接口
        this.chivox = Chivox.Instance();//调用初始化静态函数
        //这里需要设置回调函数，评测回调，录音音量回调，录音播放回调（播放进度）
        this.chivox.setCallback(this.iseCallback.bind(this), this.volCallback.bind(this), this.pcmCallback.bind(this));

        //login
        this.fbLogin = FBLogin.Instance();
        this.fbLogin.SetCallback(this.fbCallback.bind(this));
    }

    componentDidMount() {
        //..this.logDeviceInfo(); 打印设备信息
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        global.UB = new UserBehavior(this, require('react-native-device-info'));
        //this.removeAllStorageData()
        
    }

    componentWillUnMount() {
        console.log("App is closed");
        AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
        // stop服务器连接
        socket.stopLink();

        //驰声接口
        Chivox.Remove();//需要将接口释放.
        this.chivox = null;

        //login
        FBLogin.Remove();
        this.fbLogin = null;
    }

    /*--------------------------Login start-----------------------*/
    onLoginFB(){
        this.fbLogin.Login([
            'public_profile',
            'email'
        ]);
    }
    fbCallback(data){
        if (parseInt(data.code) == FBLogin.CB_Error){
            alert('登录FB出错:' +  data.err_msg);
        }else if (parseInt(data.code)== FBLogin.CB_Expired){
            alert('token未过期，直接登录!');
        }else if (parseInt(data.code) == FBLogin.CB_GetInfo){
            alert('欢迎回来，' + data.result.name + '!');
        }else if (parseInt(data.code) == FBLogin.CB_Login){
            alert('登录成功，获取个人信息！');
        }else if (parseInt(data.code) == FBLogin.CB_Logout){
            alert('退出登录！');
        }
    }
    /*--------------------------Login start-----------------------*/
    
    /*--------------------------驰声接口 start-----------------------*/
    onPressChivox(){//开始评测，这里的设置可根据需要进行设置，说明看下方对应条目
        this.chivox.startISE({
            VOLUME_TS: 0.7,//音量超过多少则表示检测到说话了，最大值为1
            VAD_BOS: 3600,//静音超时时间，即用户多长时间不说话则当做超时处理vad_bos 毫秒 ms
            VAD_EOS: 1800,//后端点静音检测时间，即用户停止说话多长时间内即认为不再输入，自动停止录音 毫秒 ms
            ISE_CATEGORY: 'word',//评测模式：word 字词, sent 句子
            SPEECH_TIMEOUT: '10000',//录音超时，录音达到时限时自动触发vad，停止录音，默认-1（无超时）
            TEXT: 'jin1 tian1',//需要评测的内容，带后标声调的拼音数据
            ISE_AUDIO_PATH: 'pcm',//录音文件的名称，不带后缀，默认为wav
            SAMPLE_RATE: '16000',//采样率，16000即可，不需要调整
            USER_ID: 'jld-9527',//userID
            index: 0,
            //WAV_PATH: ''//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
        });
    }
    onPressPlay(){//播放录音，在播放之前一定要init才可以
        this.chivox.playPcm();
    }
    iseCallback(data){//评测的返回回调函数，在这里处理返回的信息，大部分处理同讯飞，只是最后的结果格式不同
    if (data.code == cv.CB_CODE_RESULT) {//返回结果
      console.log('have result!');
      //下面是在得到评测结果之后，初始化录音，这样可以直接调用this.chivox.playPCM，具体参数可以看Chivox.js
      //这里可以根据需要，看是否需要初始化
      this.chivox.initPcm({
        FILE_PATH:'pcm',
        SAMPLE_RATE: '16000'
      }, (data)=>{
        if (data.error){
          console.log(data.err_msg);
        }else{
          console.log('pcm time: ' + data.audioTime);//init录音之后可以得到录音的总时长
        }
      });
      this.resultParse(data.result);
    }
    else if (data.code == cv.CB_CODE_ERROR) {//返回错误
      if (data.result.match("-20161015_")){
        var r = data.result.split('_');
        var ret = JSON.parse(r[1]);
        console.log(ret);//里面包含errorid 和 error的描述
        if (chivoxErr[ret.errId]){//errorid 可以在chivox.js文件中看，在头部导入chivoxErr就可以使用了
          console.log(chivoxErr[ret.errId]);
        }else{
          console.log(`${ret.errId}，未知错误！`);
        }
        // ret.errId;//id
        // ret.error;//描述
      }else{
        console.log('error', data.result);
      }
    }
    else if (data.code == chivoxErr.CB_CODE_STATUS) {//正在录音等的引擎状态返回，可根据返回状态修改对应的button变化
      console.log('status', data.result);
      if (data.result == chivoxErr.SPEECH_START) {//已经开始
        //
      } else if (data.result == chivoxErr.SPEECH_WORK) {//工作中...
        //
      } else if (data.result == chivoxErr.SPEECH_STOP) {//手动停止
        //
      } else if (data.result == chivoxErr.SPEECH_RECOG) {//识别中...
        //
      } else if (data.result == chivoxErr.SPEECH_PRESTART) {//启动前...
        //整个时候还不能说话
      }
    }
    else {//..真的是未知的错误
      console.log('传回其他参数', data.result);
    }
  }
  resultParse(result){//解析最终的评测结果，详情在details里面
    var obj = eval('(' + result + ')');
    console.log(obj);
    if (obj.error){
      // console.log('评测错误', obj.errId, obj.error);
      //已经在原生端处理了，这里只是加个保险。
    }else{
      var result = obj.result;
      console.log('总分：' + result.overall);
      console.log('无调分：' + result.phn);
      console.log('带调分：' + result.pron);
      console.log('声调分：' + result.tone);
      console.log('详情：', result.details);
    }
  }
  volCallback(data){//录音音量的返回值，做动画用到
    console.log(data);
  }
  pcmCallback(data){//播放录音的返回结果，主要的使用是播放完毕的回调。
    if (data.status == cv.PCM_TOTALTIME) {
      //
    } else if (data.status == cv.PCM_PLAYOVER) {
      console.log('play over! ' + data.msg);
    } else if (data.status == cv.PCM_CURRENTTIME) {
      //
    } else if (data.status == cv.PCM_ERROR) {
      //
    }
  }
  /*--------------------------驰声接口 end-----------------------*/

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
        return {
            ...configure,
            gestures: {}
        };
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
