/**
 * Created by tangweishu on 16/8/29.
 */
'use strict'

function UserBehavior(app,userInfo) {//构造函数,app首页didmount时调用,传递启动时间,页面总数,首页名称,用户基础信息
    
    this.app = app;
    this.appStartTime = new Date();
    this.appExitTime = null; 
    this.userMsg = {
        "id":"",
        "areaInfo":"",
        "netWork":"",
        "deviceInfo":"",
    }    
    this.arrayUserBehavior = [];//每页要记录的信息      
    this.jumpSceneCount = 0;//记录页面跳转次数
    this.nowScene = app.nowSceneName;//当前页面名称
    this.sceneStartTime = this.appStartTime;//当前页面进入时间
        
    this.aKeyArray = [];//保存当前页面单击情况的数组
    this.aKeyCount = 0;//记录当前页面单击次数
    this.aNoneKeyArray = [];//保存当前页面无效单击情况的数组
    this.aNoneKeyCount = 0;//记录当前页面无效单击次数
    
    this.aLongKeyArray = [];//保存当前页面有效长按情况的数组
    this.aLongKeyCount = 0;//保存当前页面无效长按情况的次数
    this.aNoneLongKeyArray = [];//保存当前页面无效长按情况数组
    this.aNoneLongKeyCount = 0;//保存当前页面无效长按次数

    this.aScrollArray = [];//保存当前页面有效移动情况的数组
    this.aScrollCount = 0;//保存当前页面有效移动次数
    this.aNoneScrollArray = [];//保存当前页面无效移动次数
    this.aNoneScrollCount = 0;//保存当前页面无效移动次数
    console.log("启动APP","AppStartTime:",this.appStartTime,"initScene:",this.nowScene,"UserInfo:",userInfo);
}

UserBehavior.prototype.addPress = function (objPress) {
    this.app.Logf("UserBehavior addPress:",objPress);
    this.aKeyArray[this.aKeyCount] = objPress;
    this.aKeyCount += 1;
}

UserBehavior.prototype.addNonePress = function (objPress) {
    this.app.Logf("UserBehavior addNonePress:",objPress);
    this.aNoneKeyArray[this.aNoneKeyCount] = objPress;
    this.aNoneKeyCount += 1;
}

UserBehavior.prototype.addLongPress = function (objLongPress) {
    this.app.Logf("UserBehavior addLongPress:",objLongPress);
    this.aLongKeyArray[this.aLongKeyCount] =  objLongPress;
    this.aLongKeyCount += 1;
}

UserBehavior.prototype.addNoneLongPress = function (objLongPress) {
    this.app.Logf("UserBehavior addNoneLongPress:",objLongPress);
    this.aNoneLongKeyArray[this.aNoneLongKeyCount] = objLongPress;
    this.aNoneLongKeyCount += 1;
}

UserBehavior.prototype.addScroll = function (objScroll) {
    this.app.Logf("UserBehavior addScroll:",objScroll);
    this.aScrollArray[this.aScrollCount] = objScroll;
    this.aScrollCount += 1;
}

UserBehavior.prototype.addNoneScroll = function (objScroll) {
    this.app.Logf("UserBehavior addNoneScroll:",objScroll);
    this.aNoneScrollArray[this.aNoneScrollCount] = objScroll;
    this.aNoneScrollCount += 1;
}

UserBehavior.prototype.changeScene = function (nextScene) {//页面跳转时调用,将在当前页面发生的操作都记录下来
    let exitTime = new Date()
    this.arrayUserBehavior[this.jumpSceneCount] = {
        "SceneName":this.nowScene,
        "StartTime":this.sceneStartTime,
        "ExitTime":exitTime,
        "KeyArray":this.aKeyArray,
        "NoneKeyArray":this.aNoneKeyArray,
        "LongKeyArray":this.aLongKeyArray,
        "NoneLongKeyArray":this.aNoneLongKeyCount,
        "ScrollArray":this.aScrollArray,
        "NoneScrollArray":this.aNoneScrollArray,
    }
    this.aKeyCount = 0;
    this.aNoneKeyCount = 0;
    this.aLongKeyCount = 0;
    this.aNoneLongKeyCount = 0;
    this.aScrollCount = 0;
    this.aNoneScrollCount = 0;
    this.aKeyArray = [];
    this.aNoneKeyArray = [];
    this.aLongKeyArray = [];
    this.aNoneLongKeyArray = [];
    this.aScrollArray = [];
    this.aNoneScrollArray = [];
    this.app.Logf("页面跳转:",this.arrayUserBehavior[this.jumpSceneCount]);
    this.jumpSceneCount += 1;
    this.nowScene = nextScene;
    this.sceneStartTime = exitTime;
}

UserBehavior.prototype.update = function () {
    this.appExitTime = new Date();
    this.app.Logf("UserBehavior 上传了数据");
}

module.exports =  UserBehavior;