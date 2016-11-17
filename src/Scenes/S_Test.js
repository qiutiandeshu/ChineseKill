/**
 * Created by tangweishu on 16/11/17.
 */
import React, {Component, PropTypes} from 'react'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import PanListView from '../UserInfo/PanListView'

import {StyleSheet, Text, View, InteractionManager, Animated, TouchableOpacity, ListView} from 'react-native'
import {ScreenWidth, ScreenHeight, MinWidth, MinUnit, UtilStyles, IconSize} from '../AppStyles'

import Icon from 'react-native-vector-icons/FontAwesome'
export default class S_Test extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render(){
        return (
            <PanView name="testView" style={{flex:1,backgroundColor:'white'}} >
                <Text>修改2</Text>

            </PanView>
        );
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
    contentView:{
        width:ScreenWidth,
        height:ScreenHeight,
        //flex:1,
        backgroundColor:'#fff000',
        alignSelf:'center'
    },
    listContent:{
        justifyContent: 'space-between',
        //marginTop:MinUnit*12,
        //flexDirection:'row',
        //flexWrap:'wrap',
        paddingHorizontal:ScreenWidth*0.25,
    },
    card:{
        width:MinUnit*10,
        height:MinUnit*12,
        backgroundColor:'skyblue',
        marginVertical:MinUnit*2,
        marginHorizontal:MinUnit*2,
        justifyContent:'space-between',
        alignItems:'center'
    },
});