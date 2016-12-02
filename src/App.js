/**
 * Created by tangweishu on 16/9/18.
 */

import React, {Component} from 'react'
import {
    View, Text, Navigator, StyleSheet, StatusBar,
    AppState, AsyncStorage, AlertIOS, Platform
} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, SyllableData} from './AppStyles'
import Storage from 'react-native-storage'
import UserBehavior from './UserInfo/UserBehavior'
import {RouteList, RouteIndex} from './AppRoutes'
const defaultStatusBar = false; //默认的状态栏属性
import SocketLink from './Component/SocketLink.js'
import {Chivox, cv, chivoxErr} from './Utils/Chivox.js';
import FBLogin from './Utils/FBLogin.js';
import TWLogin from './Utils/TWLogin.js';
import GGLogin from './Utils/GGLogin.js';
import Sound from 'react-native-sound'
export default class App extends Component {
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            blnShowStatusBar: defaultStatusBar, //是否显示状态栏
            blnLoading: true,
        };
        this.loadIndex = 0;
        this.blnUpdate = false; //一个标记是否上传了用户操作数据的变量,作用是在用户恢复app时,检测算新启动还是只算从后台恢复
        this.appState = 'active';//初始的app状态
        this.closeTime = null;//计时器, 当用户在后台多长时间后,就当做用户已经退出,并上传本次使用情况
        global.app = this;//定义一个全局变量,可以在项目中随时访问主类 (不建议经常使用,而是将app中的各大通用功能分成模块,就像global.UB,global.Storage)
        global.logf = this.Logf.bind(this);//重写的一个log函数,方便调试用
        this.allLessonData = [];
        this.lessonChapterCount = [];
        this.routeProps = {allLessonData: this.allLessonData};//页面跳转时,从A页面到B页面需要传递的消息
        this.routeStackNowIndex = 0;//route堆栈的序号,其实现在只会一条堆栈的导航,还不会多条堆栈的
        this.initRouteName = "Test";//初始页面的名称
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
        this.storageReview = null;//用户复习
        /*-----------本地存储数据有关的变量 End--------------*/

        /*------------------RNSound Start-------------------------------*/
        this.objSound = {} //播放的音乐对象
        this.objAudioParam = {}//播放的音乐属性
        this.objCallbackPlayer = {} //
        this.playerState = 'stop' //播放器状态 // "stop,play,pause"
        this.nowPlayAudio = "" //记录当前播放的音频
        this.playerCurrentTime = 0 //播放器当前播放时间
        this.getCurrentTimeInterval = null //获取当前播放时间的计时器
        this.playTarget = -1

        /*------------------RNSound end-------------------------------*/

        this.blnChivoxWorking = false //驰声引擎是否在工作的标志位
        this.callBackChivox = null
        this.callBackPlayRecord = null
    }

    componentWillMount() {
        // 连接服务器
        global.socket = new SocketLink(this,(msg)=>{});
        this.getLessonDate();
        this.initUserInfoByStorage();
        this.initLearningByStorage();
        this.initCardInfoByStorage();
        this.initReviewByStorage()
        //驰声接口
        this.chivox = Chivox.Instance();//调用初始化静态函数
        //这里需要设置回调函数，评测回调，录音音量回调，录音播放回调（播放进度）
        this.chivox.setCallback(this.iseCallback.bind(this), this.volCallback.bind(this), this.pcmCallback.bind(this));

        //login
        this.fbLogin = FBLogin.Instance();
        this.fbLogin.SetCallback(this.fbCallback.bind(this));
        this.twLogin = TWLogin.Instance();
        this.twLogin.SetCallback(this.twCallback.bind(this));
        this.ggLogin = GGLogin.Instance();
        this.ggLogin.SetCallback(this.ggCallback.bind(this));
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
        TWLogin.Remove();
        this.twLogin = null;
        GGLogin.Remove();
        this.ggLogin = null;
    }

    addLoadingIndex = ()=> {
        this.loadIndex += 1
        if (this.loadIndex == 4) {
            this.setState({
                blnLoading: false,
            })
        }
    }

    /*--------------------------Login start-----------------------*/
    onLoginThird(name, callback) {
        this.thirdCB = callback;
        if (name == 'facebook') {
            this.fbLogin.Login([
                'public_profile',
                'email'
            ]);
        } else if (name == 'twitter') {
            this.twLogin.Login();
        } else if (name == 'google') {
            this.ggLogin.Login();
        } else {
            console.log('not set this param of name');
        }
    }

    onLogoutThird(name, callback) {
        this.thirdCB = callback;
        if (name == 'facebook') {
            this.fbLogin.Logout();
        } else if (name == 'twitter') {
            this.twLogin.Logout();
        } else if (name == 'google') {
            this.ggLogin.Logout();
        } else {
            console.log('not set this param of name');
        }
    }

    onExpiredThird(name, callback) {
        this.thirdCB = callback;
        if (name == 'facebook') {
            this.fbLogin.Expired();
        } else if (name == 'twitter') {
            this.twLogin.Expired();
        } else if (name == 'google') {
            this.ggLogin.Expired();
        } else {
            console.log('not set this param of name');
        }
    }

    onGetInfoThird(name, callback) {
        this.thirdCB = callback;
        if (name == 'facebook') {
            this.fbLogin.GetInfo();
        } else if (name == 'twitter') {
            this.twLogin.GetInfo();
        } else if (name == 'google') {
            this.ggLogin.LoginSilently();
        } else {
            console.log('not set this param of name');
        }
    }

    thirdLoginCallback(name, data) {
        if (this.thirdCB) {
            this.thirdCB({
                name: name,
                data: data,
            });
        }
    }

    fbCallback(data) {
        this.thirdLoginCallback('facebook', data);
        if (parseInt(data.code) == FBLogin.CB_Error) {
            alert('登录FB出错:' + data.err_msg);
        } else if (parseInt(data.code) == FBLogin.CB_Expired) {
            // alert('token未过期，直接登录!');
        } else if (parseInt(data.code) == FBLogin.CB_GetInfo) {
            var json = data.result;
            socket.thirdSignUp(json.email, json.name, 'facebook');
        } else if (parseInt(data.code) == FBLogin.CB_Login) {
            this.fbLogin.GetInfo();
        } else if (parseInt(data.code) == FBLogin.CB_Logout) {
            alert('退出登录！');
        }
    }

    twCallback(data) {
        this.thirdLoginCallback('facebook', data);
        if (data.code == TWLogin.CB_CODE_ERROR) {
            var ret = JSON.parse(data.result);
            if (ret.id == TWLogin.ERROR_LOGIN) {
                alert('登录失败：' + ret.dsc);
            } else if (ret.id == TWLogin.ERROR_EXPIRED) {
                // console.log('验证有效期失败：' + ret.dsc);
                this.twLogin.Login();
            } else if (ret.id == TWLogin.ERROR_GETINFO) {
                // console.log('获取信息失败：' + ret.dsc);
            } else if (ret.id == TWLogin.ERROR_NOTLOGIN) {
                // console.log('你还未登录呢！');
                this.twLogin.Login();
            } else {
                alert("未知错误！");
            }
        } else if (data.code == TWLogin.CB_CODE_LOGIN) {
            var ret = JSON.parse(data.result);
            this.twLogin.GetInfo();
        } else if (data.code == TWLogin.CB_CODE_LOGOUT) {
            // var ret = JSON.parse(data.result);
            // // this.setState({
            // //   twName: '',
            // //   twLoginStatus: false,
            // //   twIcon: null,
            // // });
            // console.log('登出成功：' + ret.userID);
        } else if (data.code == TWLogin.CB_CODE_EXPIRED) {
            if (data.result == TWLogin.EXPIRED_OUT) {
                // console.log('登录已经过期');
                this.twLogin.Login();
            } else {
                this.twLogin.GetInfo();
            }
        } else if (data.code == TWLogin.CB_CODE_GETINFO) {
            var ret = JSON.parse(data.result);
            socket.thirdSignUp(ret.id, ret.name, 'twitter');
            // this.setState({
            //   twName: ret.name,
            //   twLoginStatus: true,
            //   twIcon: ret.profile_image_url,
            // });
            // console.log('欢迎回来，' + ret.name + '!');
        }
    }

    ggCallback(data) {
        // console.log(data);
        this.thirdLoginCallback('facebook', data);
        if (data.code == GGLogin.CB_CODE_ERROR) {
            var ret = JSON.parse(data.result);
            if (ret.id == GGLogin.ERROR_LOGIN) {
                alert()('登录失败：' + ret.dsc);
            } else if (ret.id == GGLogin.ERROR_DISCONNECT) {
                alert('断开连接失败：' + ret.dsc);
            } else {
                alert("未知错误！");
            }
        } else if (data.code == GGLogin.CB_CODE_LOGIN) {
            var ret = JSON.parse(data.result);
            socket.thirdSignUp(ret.userID, ret.fullName, 'Google');
            // this.setState({
            //   glName: ret.fullName,
            //   glEmail: ret.email,
            //   glLoginStatus: true
            // });
            // console.log('欢迎回来，' + ret.fullName + '!');
            //谷歌登录后会直接返回个人信息
        } else if (data.code == GGLogin.CB_CODE_LOGOUT) {
            // this.setState({
            //   glName: '',
            //   glEmail: '',
            //   glLoginStatus: false,
            // });
            // console.log('登出成功！');
        } else if (data.code == GGLogin.CB_CODE_EXPIRED) {
            if (data.result == GGLogin.EXPIRED_OUT) {
                // console.log('登录已经过期');
                this.Google.Login();
            } else {
                // console.log('登录成功！');
                // this.LoginSilently();
            }
        } else if (data.code == GGLogin.CB_CODE_DISCONNECT) {
            // this.setState({
            //   glName: '',
            //   glEmail: '',
            //   glLoginStatus: false,
            // });
            // console.log('登出成功：' + ret.fullName);
        }
    }

    /*--------------------------Login end-----------------------*/

    /*--------------------------驰声接口 start-----------------------*/
    onStartChivox(param, callBack) {//开始评测，这里的设置可根据需要进行设置，说明看下方对应条目
        console.log("开始评测:", this.blnChivoxWorking)
        if (this.blnChivoxWorking) return false;//如果引擎正在工作,返回错误
        const {gategory, text, audioName}=param
        this.chivox.startISE({
            VOLUME_TS: 0.7,//音量超过多少则表示检测到说话了，最大值为1
            VAD_BOS: 3600,//静音超时时间，即用户多长时间不说话则当做超时处理vad_bos 毫秒 ms
            VAD_EOS: 1800,//后端点静音检测时间，即用户停止说话多长时间内即认为不再输入，自动停止录音 毫秒 ms
            ISE_CATEGORY: gategory,//,'word',//评测模式：word 字词, sent 句子
            SPEECH_TIMEOUT: '10000',//录音超时，录音达到时限时自动触发vad，停止录音，默认-1（无超时）
            TEXT: text,//'jin1 tian1',//需要评测的内容，带后标声调的拼音数据
            ISE_AUDIO_PATH: audioName,//录音文件的名称，不带后缀，默认为wav
            SAMPLE_RATE: '16000',//采样率，16000即可，不需要调整
            USER_ID: 'jld-9527',//userID
            index: 0,
            //WAV_PATH: ''//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
        });
        this.blnChivoxWorking = true
        this.callBackChivox = callBack
        return true
    }

    onStopChivox() {
        this.chivox.stopISE()
    }

    onCancelChivox() {
        this.chivox.cancelISE()
    }

    onPlayRecord() {
        this.chivox.playPcm()
        this.getPlayRecordTime = setInterval(this.getCurrentTime.bind(this), 100)
    }

    onStopRecord(){
        this.chivox.stopPcm();
    }

    onPauseRecord(){
        this.chivox.pausePcm();
    }

    getCurrentTime() {
        this.chivox.getCurrentTime(
            (data)=> {
                if (data.error) {
                    console.log(data.error)
                } else {
                    console.log(data.audioCurrentTime)
                }
            }
        )
    }

    initPlayRecord(audioName, callBack) {//播放录音，在播放之前一定要init才可以
        this.callBackPlayRecord = callBack
        this.chivox.initPcm({
            FILE_PATH: audioName,
            SAMPLE_RATE: '16000'
        }, (data)=> {
            if (data.error) {
                console.log(data.err_msg);
            } else {
                console.log('pcm time: ' + data.audioTime);//init录音之后可以得到录音的总时长
                if (this.callBackPlayRecord) {
                    this.callBackPlayRecord({type: 'audioTime', audioTime: data.audioTime})
                }
            }
        });
    }

    iseCallback(data) {//评测的返回回调函数，在这里处理返回的信息，大部分处理同讯飞，只是最后的结果格式不同
        if (data.code == cv.CB_CODE_RESULT) {//返回结果
            console.log('have result!');
            //下面是在得到评测结果之后，初始化录音，这样可以直接调用this.chivox.playPCM，具体参数可以看Chivox.js
            //这里可以根据需要，看是否需要初始化
            this.resultParse(data.result);
            this.onChivoxEndOfWork()
        }
        else if (data.code == cv.CB_CODE_ERROR) {//返回错误
            if (data.result.match("-20161015_")) {
                var r = data.result.split('_');
                var ret = JSON.parse(r[1]);
                console.log(ret);//里面包含errorid 和 error的描述
                if (chivoxErr[ret.errId]) {//errorid 可以在chivox.js文件中看，在头部导入chivoxErr就可以使用了
                    console.log(chivoxErr[ret.errId]);
                } else {
                    console.log(`${ret.errId}，未知错误！`);
                }
                // ret.errId;//id
                // ret.error;//描述
            } else {
                console.log('error', data.result);
            }
            if (this.callBackChivox) {
                this.callBackChivox({type: 'error', error: data.result})
            }
            this.onChivoxEndOfWork()
        }
        else if (data.code == cv.CB_CODE_STATUS) {//正在录音等的引擎状态返回，可根据返回状态修改对应的button变化
            console.log('status', data.result);
            let workState = ''
            if (data.result == cv.SPEECH_START) {//已经开始
                workState = 'start'//
            } else if (data.result == cv.SPEECH_WORK) {//工作中...
                workState = 'work'//
            } else if (data.result == cv.SPEECH_STOP) {//手动停止
                workState = 'stop'//
            } else if (data.result == cv.SPEECH_RECOG) {//识别中...
                workState = 'recog'//
            } else if (data.result == cv.SPEECH_PRESTART) {//启动前...
                workState = 'restart'//这个时候还不能说话
            }
            if (this.callBackChivox) {
                this.callBackChivox({type: 'working', working: workState})
            }
        }
        else {//..真的是未知的错误
            console.log('传回其他参数', data.result);
            if (this.callBackChivox) {
                this.callBackChivox({type: 'superErr', superErr: data.result})
            }
            this.onChivoxEndOfWork()
        }
    }

    resultParse(result) {//解析最终的评测结果，详情在details里面
        var obj = eval('(' + result + ')');
        console.log(obj);
        if (obj.error) {
            // console.log('评测错误', obj.errId, obj.error);
            //已经在原生端处理了，这里只是加个保险。
        } else {
            let result = {
                overallScore: obj.result.overall,//总分
                phnScore: obj.result.phn,//无调得分
                pronScore: obj.result.pron,//带调得分
                toneScore: obj.result.tone,//声调得分
                details: this.getDetails(obj.result.details)
            }
            if (this.callBackChivox) {
                this.callBackChivox({type: 'result', result: result})
            }
        }
    }

    getDetails(details) {
        console.log("获取详情:", details)
        var detailList = [];
        if (details) {
            for (let i = 0; i < details.length; i++) {
                let detail = {
                    content: details[i].char,//内容
                    overallScore: details[i].overall,//评测分数
                    phnScore: details[i].phn,
                    pronScore: details[i].pron,
                    toneScore: details[i].tonescore,
                    originalTone: details[i].tone,//正确的音调
                    recordTone: this.getToneIndex(details[i].confidence),//读的音调
                    phoneScores: this.getPhoneScore(details[i].char, details[i].phone),
                }
                detailList[i] = detail
            }
        }
        console.log("获取详情:", detailList)
        return detailList;
    }

    getToneIndex = (confidence)=> {//获取用户读的音调值
        let toneIndex = 0
        let tmpScore = 0;
        for (let i = 0; i < confidence.length; i++) {
            if (tmpScore < confidence[i]) {
                tmpScore = confidence[i];
                toneIndex = i;
            }
        }
        return toneIndex
    }

    getPhoneScore = (content, phone)=> {
        let pinyin = {}
        for (let i = 0; i < SyllableData.length; i++) {
            let syllable = SyllableData[i]
            if (syllable.py == content) {
                if (syllable.sm != "无声母") {
                    pinyin.sm = syllable.sm
                }
                pinyin.ym = syllable.ym
            }
        }

        if (phone.length == 1) {
            if (pinyin.sm) {
                return {sm: phone[0].score, ym: phone[0].score}
            } else {
                return {ym: phone[0].score}
            }
        } else if (phone.length == 2) {
            return {
                sm: phone[0].score,
                ym: phone[1].score,
            }
        }
        console.log("评测数据有问题,没有返回声母和韵母的情况")
        return {sm: 0, ym: 0}
    }

    onChivoxEndOfWork() {
        this.blnChivoxWorking = false
        this.callBackChivox = null
    }

    volCallback(data) {//录音音量的返回值，做动画用到
        //console.log(data);
        if (this.callBackChivox) {
            this.callBackChivox({type: 'volume', volume: data.volume})
        }
    }

    pcmCallback(data) {//播放录音的返回结果，主要的使用是播放完毕的回调。
        console.log("会不会走到这里来呢")
        let workState = ''
        if (data.status == cv.PCM_TOTALTIME) {
            workState = 'totalTime' + data.msg//
        } else if (data.status == cv.PCM_PLAYOVER) {
            workState = 'playover' + data.msg
            console.log('play over! ' + data.msg);
            this.getPlayRecordTime && clearInterval(this.getPlayRecordTime)
        } else if (data.status == cv.PCM_CURRENTTIME) {
            workState = 'currenttime' + data.msg//
        } else if (data.status == cv.PCM_ERROR) {
            workState = 'error' + data.msg//
        }
        if (this.callBackPlayRecord) {
            this.callBackPlayRecord({type: 'working', working: workState})
        }
    }

    /*--------------------------驰声接口 end-----------------------*/

    /*--------------------------本地数据存储部分 Start-----------------------*/
    initReviewByStorage = ()=> {
        this.storage.load({key: 'Review'}).then(
            ret=> {
                console.log("读取到Review:", ret)
                this.storageReview = ret;
                this.addLoadingIndex()
            }
        ).catch(err=> {
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    console.log("没有找到Review相关数据")
                    break;
                case 'ExpiredError'://相关数据已过期
                    console.log("Review数据过期了")
                    break;
            }
            this.addLoadingIndex()
        })
    }

    saveReview = (saveData, expires = null)=> {
        this.storage.save({
            key: 'Review',
            rawData: saveData,
            expires: expires
        })
    }

    initUserInfoByStorage = ()=> {
        this.storage.load({key: 'UserInfo'}).then(
            ret=> {
                console.log("读取到UserInfo:", ret)
                this.storageUserInfo = ret
                socket.verifyUserInfo(this.storageUserInfo);
                this.addLoadingIndex()
            }
        ).catch(err=> {
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    console.log("没有找到UserInfo相关数据")
                    break;
                case 'ExpiredError'://相关数据已过期
                    console.log("UserInfo数据过期了")
                    break;
            }
            this.addLoadingIndex()
        })
    }

    noneUserInfoStorage = ()=> {

    }

    saveUserInfo = (saveData, expires = null)=> {
        saveData.flashCard = null;
        saveData.learnCards = null;
        this.storage.save({
            key: 'UserInfo',
            rawData: saveData,
            expires: expires
        })
    }

    initLearningByStorage = ()=> {
        this.storage.getAllDataForKey('Learning').then(
            ret => {
                console.log("读取到Learning:", ret)
                if (ret.length != this.allLessonData.length) {//如果这个key里面没有数据,则初始化以下
                    this.noneLearningStorage(ret)
                } else {
                    this.storageLearning = ret //赋值

                }
                this.addLoadingIndex()
            }
        )
    }

    noneLearningStorage = (retData)=> {//传入已经保存的数据
        console.log("None Learning Storage:", retData)
        for (let i = 0; i < this.allLessonData.length; i++) {
            //console.log("检查index:",i)
            this.storageLearning[i] = {
                chapterStates: [],
                chapterScores: [],
                chapterTimes: [],
            }
            if (i < retData.length) {//当前的是已经存在本地的数据
                let data = retData[i]
                for (let j = 0; j < data.chapterStates.length; j++) {
                    this.storageLearning[i].chapterStates[j] = data.chapterStates[j]
                    this.storageLearning[i].chapterScores[j] = data.chapterScores[j]
                    this.storageLearning[i].chapterTimes[j] = data.chapterTimes[j]
                }
            } else {
                let data = this.allLessonData[i]
                //console.log("show data:",data,i);
                for (let j = 0; j < data.chapters.length; j++) {
                    if (i == 0 && j == 0) {
                        this.storageLearning[i].chapterStates[j] = 'unlocked'
                    } else {
                        this.storageLearning[i].chapterStates[j] = 'locked'
                    }
                    this.storageLearning[i].chapterScores[j] = 0
                    this.storageLearning[i].chapterTimes[j] = 0
                }
            }
            this.storage.save({
                key: 'Learning',
                id: this.getSaveId(i),
                rawData: this.storageLearning[i],
                expires: null,
            })
        }
    }

    getStorageLearning = ()=> {
        return this.storageLearning
    }

    saveLearningStorage = (lessonId, chapterId, saveData)=> {
        const {state, score, time} = saveData
        this.storageLearning[lessonId].chapterStates[chapterId] = state;
        this.storageLearning[lessonId].chapterScores[chapterId] = score;
        this.storageLearning[lessonId].chapterTimes[chapterId] = time;
        this.storage.save({
            key: 'Learning',
            id: this.getSaveId(lessonId),
            rawData: this.storageLearning[lessonId],
            expires: null,//永不过期
        })
    }

    initCardInfoByStorage = ()=> {
        this.storage.load({key: 'CardInfo'}).then(
            ret=> {
                console.log("读取到CardInfo:", ret)
                this.storageCardInfo = ret
                this.addLoadingIndex()
            }
        ).catch(err=> {
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    console.log("没有找到CardInfo相关数据")
                    this.noneCardInfoStorage()
                    break;
                case 'ExpiredError'://相关数据已过期
                    console.log("CardInfo数据过期了")
                    break;
            }
            this.addLoadingIndex()
        })
    }

    noneCardInfoStorage = ()=> {
        let maxZiCard = 3000;
        let maxCiCard = 10000;
        let maxJuCard = 1000; //临时的卡片最大值,实际应该数据给或者从服务器获取,并且在读取数据时,还得检测才行做好扩容的预算

        this.storageCardInfo = {
            learnCards: {
                ziKey: [],
                ciKey: [],
                juKey: [],
            },//存储已经学习的卡片
            cardQuestion: {
                ziCards: Array.from({length: maxZiCard}, ()=>[]),
                ciCards: Array.from({length: maxCiCard}, ()=>[]),
                juCards: Array.from({length: maxJuCard}, ()=>[]),
            }//用来记录所有卡片的题目,对象的属性是一个二维的数组,通过key值来索引到第二维数据
        }
    }

    getCardInfo = ()=> {
        return this.storageCardInfo
    }

    saveCardInfo = (newLearnCards, newQuestions, lessonId, chapterId)=> {
        console.log("newLearnCards:", newLearnCards)
        console.log("newQuestions:", newQuestions)
        const {cardZis, cardCis, cardJus} = newLearnCards
        if (cardZis) {
            this.storageCardInfo.learnCards.ziKey = this.storageCardInfo.learnCards.ziKey.concat(cardZis)
        }
        if (cardCis) {
            this.storageCardInfo.learnCards.ciKey = this.storageCardInfo.learnCards.ciKey.concat(cardCis)
        }
        if (cardJus) {
            this.storageCardInfo.learnCards.juKey = this.storageCardInfo.learnCards.juKey.concat(cardJus)
        }
        for (let i = 0; i < newQuestions.length; i++) {
            if (newQuestions[i]) {
                const {ziCards, ciCards, juCards} = newQuestions[i]
                console.log("newQuestion", i, ":", newQuestions[i])
                let practice = {
                    lessonId: lessonId,
                    chapterId: chapterId,
                    practiceId: i,
                } //记录题目的信息
                if (ziCards) {
                    for (let i = 0; i < ziCards.length; i++) {
                        this.storageCardInfo.cardQuestion.ziCards[ziCards[i]] = this.storageCardInfo.cardQuestion.ziCards[ziCards[i]].concat(practice)
                    }
                }
                if (ciCards) {
                    for (let i = 0; i < ciCards.length; i++) {
                        this.storageCardInfo.cardQuestion.ciCards[ciCards[i]] = this.storageCardInfo.cardQuestion.ciCards[ciCards[i]].concat(practice)
                    }
                }
                if (juCards) {
                    for (let i = 0; i < juCards.length; i++) {
                        this.storageCardInfo.cardQuestion.juCards[juCards[i]] = this.storageCardInfo.cardQuestion.juCards[juCards[i]].concat(practice)
                    }
                }
            }
        }

        this.storage.save({
            key: 'CardInfo',
            rawData: this.storageCardInfo,
            expires: null
        })
    }

    getSaveId = (id, blnStartOne = true)=> { //默认传进来的id都会+1,
        let size = 2000
        let saveId = size + id
        if (blnStartOne) {
            saveId += 1
        }
        return saveId + ""
    }

    removeStorageData = (key, id)=> {// 删除单个数据
        this.storage.remove({
            key: key,
            id: id
        })
    }

    removeAllStorageData = ()=> {//清空map，移除所有"key-id"数据（但会保留只有key的数据）
        this.storage.clearMap();
    }

    /*--------------------------本地数据存储部分End-----------------------*/

    /*------------------RNSound Start-------------------------------*/
    onPlaySound = (audioName, callback,audioTarget,param = {})=> { //param:{mainPath:"",rate:1,blnRepeat:false,autoRelease:true}
        console.log("app on playSound:",audioName,audioTarget)
        
        let mainPath = "DOCUMENT" //"MAIN_BUNDLE,DOCUMENT,LIBRARY,CACHES"
        let rate = 1
        let blnRepeat = false
        let autoRelease = true
        let audioParam = {}
        audioParam.mainPaht = param.mainPath ? param.mainPath : mainPath
        audioParam.rate = param.rate ? param.rate : rate
        audioParam.blnRepeat = param.blnRepeat ? param.blnRepeat : blnRepeat
        audioParam.autoRelease = param.autoRelease ? param.autoRelease : autoRelease
        if (!this.objCallbackPlayer[audioName+audioTarget]) {
            //console.log("接受到新的回调函数")
            this.objCallbackPlayer[audioName+audioTarget] = callback
        }
        if(!this.objAudioParam[audioName+audioTarget]){
            this.objAudioParam[audioName+audioTarget] = audioParam
            //..Object.assign(this.objAudioParam[audioName], param)
        }

        if (this.playerState == 'stop') {
            this.playSound(audioName,audioTarget, mainPath,audioParam)
        } else if (this.playerState == 'play') {
            if (this.nowPlayAudio == audioName && this.playTarget == audioTarget) {
                this.pauseSound(audioName,audioTarget)
            } else {
                this.stopSound(this.nowPlayAudio,this.playTarget)
                this.playSound(audioName,audioTarget, mainPath, audioParam)
            }
        } else if (this.playerState == 'pause') {
            if (this.nowPlayAudio == audioName && this.playTarget == audioTarget) {
                this.resumeSound(audioName,audioTarget,audioParam)
            } else {
                this.stopSound(this.nowPlayAudio,this.playTarget)
                this.playSound(audioName,audioTarget,mainPath, audioParam)
            }
        }

    }

    initSound = (audioName,audioTarget,mainPath)=> {
        this.objSound[audioName] = new Sound(audioName, Sound[mainPath], this.callbackInit.bind(this, audioName,audioTarget))
    }

    playSound = (audioName,audioTarget, mainPath, param)=> {
        if (this.objSound[audioName]) { //如果有这个对象
            console.log("减个速",param.rate)
            this.objSound[audioName].setRate(param.rate)
            this.objSound[audioName].play(this.callbackPlayEnd.bind(this, audioName,audioTarget))
            this.setInterval(audioName,audioTarget)
            this.playerState = 'play'
            this.playTarget = audioTarget
            this.nowPlayAudio = audioName
            this.playCallback(audioName, audioTarget,{type: 'play', message: 'start play old audio'})
        } else {
            this.initSound(audioName, audioTarget,mainPath)
        }

    }

    resumeSound = (audioName,audioTarget, param)=> {
        this.objSound[audioName].setRate(param.rate)
        this.objSound[audioName].play(this.callbackPlayEnd.bind(this, audioName,audioTarget))
        this.playerState = 'play'
        this.playCallback(audioName,audioTarget, {type: 'resume', message: this.playerCurrentTime})
    }

    pauseSound = (audioName,audioTarget)=> {
        this.objSound[audioName].pause()
        this.playerState = 'pause'
        this.playCallback(audioName,audioTarget, {type: 'pause', message: this.playerCurrentTime})
    }

    stopSound = (audioName,audioTarget)=> {
        this.objSound[audioName].stop()
        this.nowPlayAudio = ''
        this.playTarget = -1
        this.playerState = 'stop'
        this.playCallback(audioName,audioTarget, {type: 'stop', message: 'stop play audio'})
    }

    releaseSound = (audioName)=> {
        if (this.objSound[audioName]) {
            this.objSound[audioName].release();//释放掉音频
            this.objSound[audioName] = null;
        }
    }

    callbackInit = (audioName,audioTarget, error)=> {
        if (error) {
            console.log('failed to load the sound', error.message)
            this.playCallback(audioName,audioTarget,{type: 'initError', message: error.message})
        } else {
            if (this.objSound[audioName]) {
                if (this.objAudioParam[audioName+audioTarget]) {
                    console.log("减个速",this.objAudioParam[audioName+audioTarget])
                    this.objSound[audioName].setRate(this.objAudioParam[audioName+audioTarget].rate)
                }
                this.objSound[audioName].play(this.callbackPlayEnd.bind(this, audioName,audioTarget))
                this.setInterval(audioName,audioTarget)
                this.playerState = 'play'
                this.playTarget = audioTarget
                this.nowPlayAudio = audioName
                this.playCallback(audioName,audioTarget, {type: 'firstPlay', message: this.objSound[audioName].getDuration()})
            }
        }
    }

    callbackCurrentTime = (audioName,audioTarget)=> {
        if (this.objSound[audioName]) {
            this.objSound[audioName].getCurrentTime(
                (time)=> {
                    this.playerCurrentTime = time
                    if (this.playerState == 'play') {
                        this.playCallback(audioName,audioTarget, {type: 'cTime', message: time})
                    }
                }
            )
        }
        //console.log("callBackCurrentTime:", data)
    }

    callbackPlayEnd = (audioName,audioTarget)=> {
        if (this.objAudioParam[audioName+audioTarget]) {
            if (this.objAudioParam[audioName+audioTarget].blnRepeat) {
                this.setInterval(audioName)
                this.objSound[audioName].play(this.callbackPlayEnd.bind(this, audioName,audioTarget))
                this.playCallback(audioName,audioTarget, {type: 'repeat', message: 'audio repeat'})
            } else {
                this.freeInterval()
                this.stopSound(audioName,audioTarget)
                this.playCallback(audioName,audioTarget, {type: 'playEnd', message: 'audio play over'})
            }
        }
        //console.log("callBackPlayEnd:", data)
    }

    setInterval = (audioName,audioTarget)=> {
        this.freeInterval()
        this.getCurrentTimeInterval = setInterval(this.callbackCurrentTime.bind(this, audioName,audioTarget), 250)
    }
    freeInterval = ()=> {
        this.playerCurrentTime = 0
        if (this.getCurrentTimeInterval) {
            clearInterval(this.getCurrentTimeInterval)
            this.getCurrentTimeInterval = null;
        }
    }

    playCallback = (audioName,audioTarget,data)=> {
        if (this.objCallbackPlayer[audioName+audioTarget]) {
            this.objCallbackPlayer[audioName+audioTarget](data)
        }
    }
    /*------------------RNSound end-------------------------------*/

    getLessonDate = ()=> {
        this.allLessonData[0] = require('../data/lessons/lesson1.json')
        this.allLessonData[1] = require('../data/lessons/lesson2.json')
        this.allLessonData[2] = require('../data/lessons/lesson3.json')
        //this.allLessonData[3] = require('../data/lessons/lesson4.json')

        for (let i = 0; i < this.allLessonData.length; i++) {
            this.lessonChapterCount[i] = this.allLessonData[i].chapters.length
        }
    }

    getLessonCount = ()=> {
        return this.allLessonData.length
    }

    getChapterCount = (lessonId)=> {
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
        if (this.state.blnLoading) {
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

const styles = StyleSheet.create({});
