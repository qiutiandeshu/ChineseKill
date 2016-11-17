/**
 * Created by tangweishu on 16/9/18.
 */
import React, {Component, PropTypes} from 'react'
import {View,Text, StyleSheet, Animated} from 'react-native'
import PanView from '../UserInfo/PanView'
import PanButton from '../UserInfo/PanButton'
import {ScreenWidth,ScreenHeight,MinUnit,MinWidth,IconSize,UtilStyles} from '../AppStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class HomeSideMenuLeft extends Component {
    constructor(props) {
        super(props);
         
    }
    static propTypes = {
        onCancel:React.PropTypes.func.isRequired,
        sideMenuAnim:React.PropTypes.object,
    };
    static defaultProps = {

    };

    render(){ 
        const left = this.props.sideMenuAnim.interpolate({
            inputRange:[0,1],
            outputRange:[-ScreenWidth*0.25,0]
        })
        return (
            <PanView name = "HomeSideMenuLeft" style={styles.container} >
                <Animated.View style={[styles.content,UtilStyles.grayBackColor,{left}]}>
                    {this.renderTitle()}
                </Animated.View>
                
            </PanView>
        );
    }
    _onCloseSideMenu = ()=>{        
        this.props.onCancel();
    }
    renderTitle = ()=>{
        return(
            <View style={[styles.menuTitleView,UtilStyles.bottomLine]}>
                <PanButton name="btnMenuLeftBack" onPress={this._onCloseSideMenu.bind(this)}>
                    <Icon name="angle-left" size={IconSize}/>
                </PanButton>
                <PanButton name="btnMenuLeftSet">
                    <Icon name="cog" size={IconSize}/>
                </PanButton>
            </View>
        );       
    }
}



const styles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
    },
    content:{       
        width:ScreenWidth*0.25,
        height:ScreenHeight,
        alignItems:'center',
    },
    menuTitleView:{
        width:ScreenWidth*0.25,
        flexDirection: 'row',
        height: MinUnit * 6,
        paddingHorizontal: MinUnit * 2,
        justifyContent: 'space-between',
        alignItems: 'center',      
    },     
});