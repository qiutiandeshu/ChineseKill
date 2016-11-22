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
        };
        this.blnUpdate = false; //一个标记是否上传了用户操作数据的变量,作用是在用户恢复app时,检测算新启动还是只算从后台恢复
        this.appState = 'active';//初始的app状态
        this.closeTime = null;//计时器, 当用户在后台多长时间后,就当做用户已经退出,并上传本次使用情况
        global.app = this;//定义一个全局变量,可以在项目中随时访问主类 (不建议经常使用,而是将app中的各大通用功能分成模块,就像global.UB,global.Storage)
        global.logf = this.Logf.bind(this);//重写的一个log函数,方便调试用
        this.lessonDate = [];
        this.routeProps = {allLessonData:this.lessonDate};//页面跳转时,从A页面到B页面需要传递的消息
        this.routeStackNowIndex = 0;//route堆栈的序号,其实现在只会一条堆栈的导航,还不会多条堆栈的
        this.initRouteName = "Home";//初始页面的名称
        this.nowSceneName = "";
        //..this.setNowPageName(this.getRoute(this.initRouteName))
        this.sceneRef = null;//当前页面的引用对象
        this.storage = null;
        global.storageDate = [];//与本地存储有关的数据
        // if (Platform.OS == 'ios'){
        //     Text.defaultProps.allowFontScaling = false;//设置文字不受机器字体放大缩小的影响，这里是全局设定
        // }
    }

    componentWillMount() {
        this.getStorageDate();
        // 连接服务器
        global.socket = new SocketLink(this);
        this.getLessonDate();
    }

    componentDidMount() {
        //..this.logDeviceInfo(); 打印设备信息
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        global.UB = new UserBehavior(this, require('react-native-device-info'));
    }

    getStorageDate = ()=> {
        var storage = new Storage(
            {
                size: 1000,//最大容量,默认值1000条数据循环存储
                storageBackend: AsyncStorage,//定义存储引擎,如果不指定则数据只会保存在内存中重启后消失
                defaultExpires: 1000 * 3600 * 24,//(单位:毫秒) 数据过期时间,默认为24小时,设置为null为永不过期
                enableCache: true,//读写时在内存中缓存数据.默认启用
                //..sync:{login:this.initStorageDate.bind(this)}
                /*如果storage中没有数据或数据过期,则会调用相应的sync方法,无缝返回最新数据.
                 也可以将sync写到另一个文件里,用require引入*/
            }
        )
        console.log("准备读取本地数据")
        storage.load({key: 'login', id: '1'}).then(ret=> {
            console.log("数据读取成功")
            console.log(ret)
        }).catch(err=> {
            console.log("数据读取失败")
            console.log(err)
            switch (err.name) {
                case 'NotFoundError'://没有找到相关数据
                    this.initStorageDate()
                    break;
                case 'ExpiredError'://相关数据已过期
                    break;
            }
        })
        this.storage = storage
    }

    getLessonDate = ()=>{
        this.lessonDate[0] = require('../data/lessons/lesson1.json')
        this.lessonDate[1] = require('../data/lessons/lesson2.json')
        this.lessonDate[2] = require('../data/lessons/lesson3.json')
        this.lessonDate[3] = require('../data/lessons/lesson4.json')
    }

    initStorageDate = ()=> {
        //..AlertIOS.alert("本地无数据或数据已过期");
        var initUser = {
            key: 'login',
            //id:'1',
            rawData: {
                userid: '123456',
                password: '654321',
                age: '00',
                name: '无名氏',
                love: ['抽烟', '喝酒', '烫头'],
            },
            expires: 1000 * 3600 * 24,//如果不指定过期时间，则会使用defaultExpires参数,null用不过期
        }
        this.saveStorageData(initUser);
    }

    saveStorageData = (data)=> {
        console.log("运行了保存数据的函数")
        var allData = global.storageDate;
        console.log(global.storageDate);
        console.log(data);
        var dataIndex = allData.length;
        for (var i = 0; i < allData.length; i++) {
            if (allData[i].key === data.key && allData[i].id === data.id) {
                dataIndex = i;
                break;
            }
        }
        allData[dataIndex] = data;
        global.storageDate = allData;
        this.storage.save(data)
    }

    removeStorageData = (data)=> {//移除某项数据
        var allData = global.storageDate;
        var dataIndex = -1;
        for (var i = 0; i < allData.length; i++) {
            if (allData[i].key === data.key && allData[i].id === data.id) {
                dataIndex = i;
                break;
            }
        }
        allData.copyWithin(dataIndex,)
        this.storage.remove(data);
    }

    removeAllStorageData = ()=> {//清空所有数据
        storage.clearMap();
    }

    Logf(message, ...optionalParams) {
        // var args = arguments.length;
        // console.log(message, ...optionalParams);
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
        console.log("On Did Focus")
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
        return <Component ref={this.setSceneRef.bind(this)}  {...this.routeProps} navigator={navigator}/>
    }

    setSceneRef = (ref)=> {
        this.sceneRef = ref;
    }

    setNextRouteProps = (props)=> {

        this.routeProps = props;
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
            gestures:{}//禁用手势返回
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
