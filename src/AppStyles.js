/**
 * Created by tangweishu on 16/9/18.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    PixelRatio,
} from 'react-native';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;
let MinWidth = 1/PixelRatio.get();
var MinUnit = ScreenWidth/100;
var IconSize = MinUnit*4;
let styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
});

var UtilStyles = StyleSheet.create({
    back: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    border: {
        borderWidth: 3,
        borderColor: '#0D220E',
    },
    grayBackColor:{
        backgroundColor:'#F9F9F9'
    },
    bottomLine:{
        borderBottomWidth:MinWidth,
        borderBottomColor:'#E1E1E1'
    },
    fontBig: {
        fontSize: MinUnit*6,
        color: 'black',
    },
    fontNormal:{
        fontSize:MinUnit*4,
        color:'black',
    },
    fontSmall: {
        fontSize: MinUnit*3,
        color: 'black',
    },   
    shade: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: ScreenWidth,
        height: ScreenHeight,
        backgroundColor: 'rgba(10,10,10,0.3)',
    },
});


module.exports = {
    styles,
    ScreenWidth,
    ScreenHeight,
    UtilStyles,
    MinUnit,
    MinWidth,
    IconSize,
};