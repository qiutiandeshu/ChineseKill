/**
 * Created by tangweishu on 16/8/31.
 */
import React, {Component, PropTypes} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import PanView from './PanView'
export default class PanScrollView extends Component {
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
        this.onTouchStartTime = 0;
        this.aMove = [];
        this.aMoveCount = 0;
        this.myTarget = -1;
        this.blnScrolling = false;//是否在惯性移动(如果在移动中收到点击事件,可以停止滚动)
        this.contentWidth = 0;
        this.contentHeight = 0;
        this.blnTouchOutside = false;
        this.blnDrag = false;
    }

    static propTypes = {
        name: PropTypes.string.isRequired,
        blnScrollChild:PropTypes.bool,
    };
    static defaultProps = {
        blnScrollChild:false,
        //是否是ScrollView之类的子组件,根据这个变量, 去判断是否要上传"无效滑动",
        // 来解决同时上传一个当前组件无效滑动和父组件的有效滑动问题
    };

    _onLayout = (evt)=> {
        this.myTarget = evt.nativeEvent.target
        //console.log(this.props.name,"target:",this.myTarget);
        if (this.props.onLayout) {
            this.props.onLayout(evt);
        }
    }

    _onTouchStart = (evt)=> { //手指触碰到组件
        //console.log("onTouchStart:",evt.nativeEvent,this.myTarget)
        this.onTouchStartTime = evt.nativeEvent.timestamp;
        this.blnTouchOutside = false;
        if(this.props.horizontal){
            if (evt.nativeEvent.locationX > this.contentWidth) {
                this.blnTouchOutside = true;
            }
        }else{
            if (evt.nativeEvent.locationY > this.contentHeight) {
                this.blnTouchOutside = true;
            }
        }
        if(this.props.onTouchStart){
            this.props.onTouchStart(evt);
        }
    }

    _onTouchEnd = (evt)=> {//手指离开组件
        //console.log("onTouchEnd:",evt.nativeEvent,this.myTarget);
        if (this.blnTouchOutside){
            console.log(this.props.name," touchOutside");
            return;
        }
        var timestamp = evt.nativeEvent.timestamp - this.onTouchStartTime;
        if (this.aMoveCount == 0) {//'抬手'这一手势,表示用户本次操作结束,通过判断对移动情况的记录,看是点击还是
            if (this.blnScrolling) {//如果正在滚动
                UB.addPress({
                    "name": "stopScroll_" + this.props.name,
                    "point": {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY},
                    "pressTime": timestamp,
                });
            } else {
                if (evt.nativeEvent.target == this.myTarget) {
                    UB.addNonePress({
                        "name": this.props.name,
                        "point": {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY},
                        "pressTime": timestamp,
                    });
                }
            }
        } else {
            if(this.blnDrag){ 
                UB.addScroll({
                    "name": this.props.name,
                    "orbit": this.aMove,
                    "touchTime": evt.nativeEvent.timestamp - this.onTouchStartTime,
                });
            }else{
                if(!this.props.blnScrollChild){
                    UB.addNoneScroll({
                        "name":this.props.name + "_scrollErrPath",
                        "orbit":this.aMove,
                        "touchTime":evt.nativeEvent.timestamp - this.onTouchStartTime,
                    });
                }
            }

            this.aMove = []
            this.aMoveCount = 0;
        }
        this.blnDrag = false;

        if(this.props.onTouchEnd){
            this.props.onTouchEnd(evt);
        }
    }

    _onTouchMove = (evt)=> {//手指在滑动
        //console.log("onTouchMove:",evt.nativeEvent)
        this.aMove[this.aMoveCount] = {"point": {x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY}}
        this.aMoveCount += 1;
        if(this.props.onTouchMove){
            this.props.onTouchMove(evt);
        }
    }

    _onScroll = (evt)=>{
        if(this.props.onScroll){
            this.props.onScroll(evt);
        }
    }

    _onScrollBeginDrag = (evt)=> {//通过手指的移动滚动
        this.blnDrag = true;
        //console.log("onScrollBeginDrag:",evt.nativeEvent)
        if(this.props.onScrollBeginDrag){
            this.props.onScrollBeginDrag(evt);
        }
    }

    _onScrollEndDrag = (evt)=> {//通过手指的移动滚动结束
        //console.log("onScrollEndDrag:",evt.nativeEvent)
        if(this.props.onScrollEndDrag){
            this.props.onScrollEndDrag(evt);
        }
    }

    _onMomentumScrollBegin = (evt)=> {//手指离开屏幕继续滑动开始
        //console.log("onMomentumScrollBegin:",evt.nativeEvent)
        this.blnScrolling = true;
        if(this.props.onMomentumScrollBegin){
            this.props.onMomentumScrollBegin(evt);
        }
    }

    _onMomentumScrollEnd = (evt)=> {//手指离开屏幕滑动结束
        //console.log("onMomentumScrollEnd:",evt.nativeEvent)
        this.blnScrolling = false;
        if(this.props.onMomentumScrollEnd){
            this.props.onMomentumScrollEnd(evt);
        }
    }

    setNativeProps = (props)=> {
        this.refs.scrollView.setNativeProps(props);
    }

    _onContentSizeChange = (width, height)=> {
        this.contentWidth = width;
        this.contentHeight = height;//获取内容高度,当用户点的y位置超过此位置,不做记录,从而解决'穿透记录的问题'
        if (this.props.onContentSizeChange) {
            this.props.onContentSizeChange(width, height);
        }
    }

    scrollTo = (...args: Array<mixed>) => {
        this.refs.scrollView.scrollTo(...args);
    }

    render() {
        return (
            <ScrollView
                {...this.props}
                ref="scrollView"
                onLayout={this._onLayout.bind(this)}
                onContentSizeChange={this._onContentSizeChange.bind(this)}
                onTouchStart={this._onTouchStart.bind(this)}
                onTouchEnd={this._onTouchEnd.bind(this)}
                onTouchMove={this._onTouchMove.bind(this)}

                onScroll = {this._onScroll.bind(this)}
                onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
                onScrollEndDrag={(this._onScrollEndDrag.bind(this))}
                onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
                onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
            >
                <PanView name={this.props.name}
                    //onLayout={this._viewLayout.bind(this)}
                    style={[this.props.viewStyle,{flexDirection:this.props.horizontal?'row':'column'}]}
                    //onStartShouldSetResponder={()=>true}
                    >
                    {this.props.children}
                </PanView>

            </ScrollView>
        );
    }
}