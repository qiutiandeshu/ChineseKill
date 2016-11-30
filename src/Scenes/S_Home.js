/**
 * Created by tangweishu on 16/9/18.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'
import MenuLeft from '../Component/HomeSideMenuLeft'
import MenuRight from '../Component/HomeSideMenuRight'
import Icon from 'react-native-vector-icons/FontAwesome'
var Box = require('../Component/Box.js');
export default class S_Home extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2)=>r1 !== r2})
        this.learingRecord = app.getStorageLearning()
        this.state = {
            menuState: 'none',
            sideMenuAnim: new Animated.Value(0),
            dataSource: ds.cloneWithRows(this.learingRecord)
        };
        this.blnContentOffX = false;
        global.Home = this;
        this.baseProps = props;
    }    

    static propTypes = {
        allLessonData: PropTypes.array.isRequired,
    };
    static defaultProps = {
        allLessonData: []
    };
    
    changeDataSource = (lessonId,chapterId,data)=>{
        let newData = this.learingRecord.slice();
        const {state,score,time} = data
        newData[lessonId] = {
            chapterStates:[],
            chapterScores:[],
            chapterTimes:[],
        }
        for(let i=0;i<app.getChapterCount(lessonId);i++){
            if(i==chapterId){
                newData[lessonId].chapterStates[i] = state
                newData[lessonId].chapterScores[i] = score
                newData[lessonId].chapterTimes[i] = time
            }else{
                newData[lessonId].chapterStates[i] = this.learingRecord[lessonId].chapterStates[i]
                newData[lessonId].chapterScores[i] = this.learingRecord[lessonId].chapterScores[i]
                newData[lessonId].chapterTimes[i] = this.learingRecord[lessonId].chapterTimes[i]
            }
        }
        console.log("change dataSource:",newData)
        this.setState({
            dataSource:this.state.dataSource.cloneWithRows(newData)
        })
    }    

    openSideMenu = (side)=> {
        if (this.state.menuState != 'none') {
            this.state.sideMenuAnim.setValue(0)
        }
        this.blnContentOffX = false;
        if (side == 'left') {
            this.blnContentOffX = true;
        }
        Animated.timing(this.state.sideMenuAnim, {
            toValue: 1,
        }).start()
        this.setState({menuState: side})
    }

    closeSideMenu = ()=> {
        this.blnContentOffX = false;
        if (this.state.menuState == 'left') {
            this.blnContentOffX = true;
        }
        Animated.timing(this.state.sideMenuAnim, {
            toValue: 0,
        }).start(()=> {
            this.setState({menuState: 'none'})
        })
    }

    shouldComponentUpdate(nProps, nStates) {
        if (nStates != this.state) {
            return true;
        }
        return false;
    }

    render() {
        const width = this.state.sideMenuAnim.interpolate(
            {
                inputRange: [0, 1],
                outputRange: [ScreenWidth, ScreenWidth * 0.75],
            }
        )
        var left = this.state.sideMenuAnim.interpolate(
            {
                inputRange: [0, 1],
                outputRange: [0, ScreenWidth * 0.25],
            }
        )
        if (!this.blnContentOffX) {
            left = 0
        }

        return (
            <View name="s_home" style={styles.container}>
                <Animated.View style={[{width},{left}]}>
                    {this.renderTitleBar()}
                    {this.renderContent()}
                </Animated.View>
                {this.state.menuState == 'left' &&
                <MenuLeft sideMenuAnim={this.state.sideMenuAnim} onCancel={this.closeSideMenu.bind(this)}/>}
                {this.state.menuState == 'right' &&
                <MenuRight sideMenuAnim={this.state.sideMenuAnim} onCancel={this.closeSideMenu.bind(this)}
                           onPressOrder = {this._onPressOrder.bind(this)}
                           onPressPinyin= {this._onPressPinyin.bind(this)} />}
                <Box.SettingBox ref={'Setting'} />
                <Box.LoginBox ref={'Login'} />
                <Box.LogoutBox ref={'Logout'} />
                <Box.ChangePasswordBox ref={'ChangePassword'} />
                <Box.SignUpBox ref={'SignUp'} />
                <Box.ForgetBox ref={'Forget'} />
                <Box.FlashCardBox ref={'FlashCard'} />
                <Box.CardBox ref={'Character'} kind={'Character'} />
                <Box.CardBox ref={'Word'} kind={'Word'} />
                <Box.CardBox ref={'Sentence'} kind={'Sentence'} />

                {this.state.menuState == 'none'&&
                    <PanButton name="btnDeleteSave" style={styles.delBtn} onPress={()=>{
                    app.removeAllStorageData()
                    app.removeStorageData('UserInfo')
                     app.removeStorageData('CardInfo')
                     app.removeStorageData('Review')
                    }}>
                    <Text>删除存档</Text>
                    </PanButton>}
            </View>
        );
    }

    renderTitleBar = ()=> {
        return (
            <PanView name="homeTitleView" style={[styles.titleView,UtilStyles.bottomLine,UtilStyles.grayBackColor]}>
                {
                    this.state.menuState == 'left' ? <View style={{width:IconSize}}/> :
                        <PanButton name="btnTitleLeft" onPress={this.openSideMenu.bind(this,'left')}>
                            <Icon name="pencil-square" size={IconSize}/>
                        </PanButton>
                }
                <Text style={UtilStyles.fontNormal}>ChineseKill</Text>
                {
                    this.state.menuState == 'right' ? <View style={{width:IconSize}}/> :
                        <PanButton name="btnTitleLeft" onPress={this.openSideMenu.bind(this,'right')}>
                            <Icon name="compass" size={IconSize}/>
                        </PanButton>}
            </PanView>
        );
    }
    renderContent = ()=> {
        return (
            <PanListView name="homeContentListView"
                         style={styles.contentView}
                         contentContainerStyle={styles.listContent}
                         dataSource={this.state.dataSource}
                         renderRow={this._renderRow.bind(this)}
                         initialListSize={20}
                         scrollRenderAheadDistance={ScreenHeight*0.5} //离屏幕底部多少距离时渲染
                         showsVerticalScrollIndicator={false}
            />
        );
    }
    _renderRow = (rowData, sectionID, rowID)=> {
        const {chapterStates,chapterScores,chapterTimes} = rowData
        const {lessonTitle, lessonIcon, chapters} = this.baseProps.allLessonData[rowID]
        let color = 'black'
        let canPress = true
        if(chapterStates[0] == 'locked'){
            color = 'gray'
            canPress = false
        }
        let passCount = 0
        for(let i=0;i<chapterStates.length;i++){
            if(chapterStates[i]=="passed"){
                passCount += 1
            }
        }

        return (
            <PanButton  name={"btn"+lessonTitle} style={styles.card} disabled={!canPress}
                        onPress={this._onPressCard.bind(this,this.baseProps.allLessonData[rowID],rowData,parseInt(rowID))}>
                <Icon name='bug' size={MinUnit*8} color = {color}/>
                <Text style={{color}}>{lessonTitle}</Text>
                <Text style={{color}}>{passCount+"/"+chapters.length}</Text>
            </PanButton>
        );
    }
    _onPressCard = (data,record,id)=> {
        app.setNextRouteProps({lessonData: data,lessonRecord:record,lessonId:id})
        this.props.navigator.push(app.getRoute("LessonMenus"));
    }

    _onPressOrder(){
        this.props.navigator.push(app.getRoute('StrokersOrder'));
    }
    _onPressPinyin(){
        this.props.navigator.push(app.getRoute('PinyinChart'));
    }

    // 控制弹出框显示/隐藏
    _onPopupBoxShow = (name)=>{
        this.refs[name].show();
    }
    _onPopupBoxHidden = (name)=>{
        this.refs[name].hidden();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },

    titleView: {
        flexDirection: 'row',
        height: MinUnit * 6,
        paddingHorizontal: MinUnit * 2,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    titleText: {
        fontSize: MinUnit * 4,
        color: 'black',
    },
    contentView: {
        width: ScreenWidth,
        height: ScreenHeight,
        //flex:1,
        //backgroundColor:'#ffff00',
        alignSelf: 'center'
    },
    listContent: {        
        justifyContent: 'space-between',
        //marginTop:MinUnit*12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: ScreenWidth * 0.25,
    },
    card: {
        width: MinUnit * 10,
        height: MinUnit * 12,
        backgroundColor: 'skyblue',
        marginVertical: MinUnit * 2,
        marginHorizontal: MinUnit * 2,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    delBtn:{
        position:'absolute',
        left:0,
        bottom:0,
        width:MinUnit*10,
        height:MinUnit*4,
        borderWidth:1,
        borderColor:'gray',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'gray'
    },
});