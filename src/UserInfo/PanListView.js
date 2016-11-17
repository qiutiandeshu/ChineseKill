/**
 * Created by tangweishu on 16/8/31.
 */
import React, {Component, PropTypes} from 'react'
import {ListView} from 'react-native'

export default class PanListView extends Component {
    // 构造
    constructor(props) {
        super(props);
        this.state = {};
        this.onTouchStartTime = 0;
        this.aMove = [];
        this.aMoveCount = 0;
        this.myTarget = -1;
        this.blnScrolling = false;//是否在惯性移动(如果在移动中收到点击事件,可以停止滚动)
        this.blnNoneTouch = false;
        this.blnDrag = false;
    }
    static propTypes = {
        name:PropTypes.string.isRequired,
        blnScrollChild:PropTypes.bool,
    };
    static defaultProps = {
        blnScrollChild:false,
        //是否是ScrollView之类的子组件,根据这个变量, 去判断是否要上传"无效滑动",
        // 来解决同时上传一个当前组件无效滑动和父组件的有效滑动问题
    };

    _onLayout = (evt)=>{
        this.myTarget = evt.nativeEvent.target
        //console.log("myTarget:",this.myTarget);
        if(this.props.onLayout){
            this.props.onLayout(evt);
        }
    }

    _onTouchStart = (evt)=>{ //手指触碰到组件
        //console.log("onTouchStart:",evt.nativeEvent)
        this.onTouchStartTime = evt.nativeEvent.timestamp;
        this.blnNoneTouch = false;
        /*if(evt.nativeEvent.target == this.myTarget || evt.nativeEvent.target == this.myTarget+1){//不解释,不理解 为什么缝隙中会有一个其他组件?
            this.blnNoneTouch = true;
        }*/
        if(evt.nativeEvent.target == this.myTarget){//不解释,不理解 为什么缝隙中会有一个其他组件?
            this.blnNoneTouch = true;
        }
    }

    _onTouchEnd = (evt)=>{//手指离开组件
        //console.log("onTouchEnd:",evt.nativeEvent);
        if(this.blnNoneTouch) return;

        var timestamp = evt.nativeEvent.timestamp - this.onTouchStartTime;
        console.log("耗时:",timestamp)
        if(this.aMoveCount == 0){//'抬手'这一手势,表示用户本次操作结束,通过判断对移动情况的记录,看是点击还是
            if(this.blnScrolling){
                UB.addPress({
                    "name":"stopScroll_"+this.props.name,
                    "point":{x:evt.nativeEvent.pageX,y:evt.nativeEvent.pageY},
                    "pressTime":timestamp,
                });
            }else{
                if(evt.nativeEvent.target == this.myTarget || evt.nativeEvent.target == this.myTarget+1){
                    UB.addNonePress({
                        "name":this.props.name,
                        "point":{x:evt.nativeEvent.pageX,y:evt.nativeEvent.pageY},
                        "pressTime":timestamp,
                    });
                }
            }
        }else{
            if(this.blnDrag){
                UB.addScroll({
                    "name":this.props.name,
                    "orbit":this.aMove,
                    "touchTime":evt.nativeEvent.timestamp - this.onTouchStartTime,
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
    }

    _onTouchMove = (evt)=>{//手指在滑动
        this.aMove[this.aMoveCount] = {"point":{x:evt.nativeEvent.pageX,y:evt.nativeEvent.pageY}}
        this.aMoveCount+=1;
    }

    _onScrollBeginDrag = (evt)=>{//通过手指的移动滚动
        this.blnDrag = true;
        //console.log("onScrollBeginDrag:",evt.nativeEvent)
    }

    _onScrollEndDrag = (evt)=>{//通过手指的移动滚动结束
        //console.log("onScrollEndDrag:",evt.nativeEvent)
    }

    _onMomentumScrollBegin = (evt)=>{//手指离开屏幕继续滑动开始
        //console.log("onMomentumScrollBegin:",evt.nativeEvent)
        this.blnScrolling = true;
    }

    onMomentumScrollEnd = (evt)=>{//手指离开屏幕滑动结束
        //console.log("onMomentumScrollEnd:",evt.nativeEvent)
        this.blnScrolling = false;
    }

    scrollTo = (...args: Array<mixed>) => {        
        this.refs.listView.scrollTo(...args);
    }

    setNativeProps = (props)=>{
        this.refs.listView.setNativeProps(props);
    }

    _onContentSizeChange = (width,height)=>{
        this.contentHeight = height;//获取内容高度,当用户点的y位置超过此位置,不做记录,从而解决'穿透记录的问题'
        if(this.props.onContentSizeChange){
            this.props.onContentSizeChange(width,height);
        }
    }

    render(){
        return (
            <ListView
                {...this.props}
                ref="listView"
                onLayout={this._onLayout.bind(this)}
                //onContentSizeChange={this._onContentSizeChange.bind(this)}
                onTouchStart={this._onTouchStart.bind(this)}
                onTouchEnd={this._onTouchEnd.bind(this)}
                onTouchMove={this._onTouchMove.bind(this)}
                onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
                onScrollEndDrag={(this._onScrollEndDrag.bind(this))}
                onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
                onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
            />
        );
    }
}