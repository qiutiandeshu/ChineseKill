/**
 * Created by tangweishu on 16/11/17.
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

export default class S_LessonMenus extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        console.log("lesstonData:",props.lessonData)
    }
    static propTypes = {
        lessonData: React.PropTypes.object.isRequired,
    };
    static defaultProps = {
        lessonDate:{title:"null",icon:"none",lessonTitle:["none","none"]}
    };

    shouldComponentUpdate(nProps,nStates) {
        if(nStates != this.state){
            return true;
        }
        return false;
    }

    render() {    
        const {title,icon,lessonTitle} = this.props.lessonData;
        console.log("Scene LessonMenus Render")
        return (
            <PanView name = "S_LessonMenus" style={styles.container}>
                <View style={styles.titleView}>
                    <PanButton name="btnLessonMenusBack" onPress={this.onBackScene.bind(this)}>
                        <Icon name="angle-left" size={IconSize} color='white'/>
                    </PanButton>
                    <Text style={[UtilStyles.fontNormal,styles.titleText]}>{title}</Text>
                    <View/>
                </View>
                <Icon name = "car" size={60} style={{marginTop:MinUnit*3}} />
                 <Text>{lessonTitle[0].words}</Text>
            </PanView>
        );
    }

    onBackScene = ()=>{
        this.props.navigator.pop();
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00BCD4',
        alignItems:'center'
    },
    titleView:{
        width:ScreenWidth,
        height:MinUnit*4,
        paddingHorizontal:MinUnit*3,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:MinUnit*3,
    },
    titleText:{
        color:'white',
    },
});