/**
 * Created by tangweishu on 16/9/19.
 */
import Home from './Scenes/S_Home'
import LessonMenus from './Scenes/S_LessonMenus'
import StrokersOrder from './Scenes/S_StrokersOrder'
import Test from './Scenes/S_Test'
/*
import Main from './Component/MainTabView' 
import Show1 from './Scenes/P_Show1'
import Show2 from './Scenes/P_Show2'
import PushScene from './Scenes/P_PushScene'
import PushScene2 from './Scenes/P_PushScene2'
import Example from './Component/ExampleTabView'
import Embed from './Component/EmbedTabView'
import UserInfo from './Scenes/P_UserInfo'*/
let RouteList = [
    {
        name:'Home',
        component:Home,
        index:0,
        configure:'FFL',
        showStatusBar:false,
    },
    {
        name:'LessonMenus',
        component:LessonMenus,
        index:1,
        configure:'FFB'
    },
    {
        name:'Test',
        component:Test,
        index:2,
    },
    {
        name:'StrokersOrder',
        component: StrokersOrder,
        index: 3,
        configure: 'FFB',
    },
   /* {
        name:'Main',
        component:Main,
        type:'TabView',
        index:0,
        showStatusBar:false,
    },
    
    {
        name:'Show1',
        component:Show1,
        index:2,
        showStatusBar:false,
        configure:'FFL',
    },
    {
        name:'Show2',
        component:Show2,
        index:3,
        configure:'FFL',
    },
    {
        name:'PushScene',
        component:PushScene,
        index:4,
        configure:'FFB',
        showStatusBar:false,
    },
    {
        name:'PushScene2',
        component:PushScene2,
        index:5,
        configure:'FFL',
    },
    {
        name:'Example',
        component:Example,
        type:'TabView',
        index:6,
    },
    {
        name:'Embed',
        component:Embed,
        type:'TabView',
        index:7,
    },
    {
        name:'UserInfo',
        component:UserInfo,
        index:8,
    }*/
];

let RouteIndex = {
    Home:0,
    LessonMenus:1,
    Test:2,
    StrokersOrder: 3,
    /*Main:1,   
    Show1:2,
    Show2:3,
    PushScene:4,
    PushScene2:5,
    Example:6,
    Embed:7,
    UserInfo:8,*/
}
 
module.exports = {RouteList,RouteIndex};