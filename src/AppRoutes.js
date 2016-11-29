/**
 * Created by tangweishu on 16/9/19.
 */
import Home from './Scenes/S_Home'
import LessonMenus from './Scenes/S_LessonMenus'
import StrokersOrder from './Scenes/S_StrokersOrder';
import StrokersWrite from './Scenes/S_StrokersWrite';
import Practice from './Scenes/S_Practice';
import PinyinChart from './Scenes/S_PinyinChart';
import Test from './Scenes/S_Test';

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
        name:'Practice',
        component:Practice,
        index:2,
        configure:'FFB'
    },
    {
        name:'StrokersOrder',
        component: StrokersOrder,
        index: 3,
        configure: 'FFB',
    },
    {
        name:'StrokersWrite',
        component: StrokersWrite,
        index: 4,
        configure: 'FFR',
    },
    {
        name:'StrokersWrite',
        component: PinyinChart,
        index: 5,
        configure: 'FFB',
    },
    {
        name:'Test',
        component:Test,
        index:6,
        showStatusBar:false,
    },

];

let RouteIndex = {
    Home:0,
    LessonMenus:1,
    Practice:2,
    StrokersOrder: 3,
    StrokersWrite: 4,
    PinyinChart: 5,
    Test:6,
}
 
module.exports = {RouteList,RouteIndex};