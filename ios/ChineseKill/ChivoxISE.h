//
//  ChivoxISE.h
//  Jicheng7
//
//  Created by guojicheng on 16/10/13.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#include "airecorder.h"
#include "aiengine.h"
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"

#define CB_CODE_RESULT @"0"
#define CB_CODE_ERROR @"1"
#define CB_CODE_STATUS @"2"
#define CB_CODE_LOG @"3"

#define SPEECH_START @"0"  //开始
#define SPEECH_WORK @"1" //工作中
#define SPEECH_RECOG @"2"  //评测中
#define SPEECH_STOP @"3" //停止
#define SPEECH_PRESTART @"4" //启动前

#define PCM_TOTALTIME @"0"//总时间
#define PCM_CURRENTTIME @"1"//当前时间
#define PCM_PLAYOVER @"2"//播放完毕
#define PCM_ERROR @"3"//错误信息

@interface ChivoxISE : RCTEventEmitter<RCTBridgeModule>
{
  struct airecorder * recorder;
  struct aiengine * engine;
  char device_id[64];
}

@property(nonatomic,strong)NSString* bridgeIndex;
@property(nonatomic,strong)NSString* bridgeCategory;
@property(nonatomic,strong)NSString* bridgeStatus;
@property(nonatomic,strong)NSString* wavFilePath;//音频文件路径
@property(nonatomic,strong)NSString* appKey;
@property(nonatomic,strong)NSString* secretKey;
@property(nonatomic,strong)NSString* userID;
@property(nonatomic,strong)NSString* deviceID;
@property(nonatomic,strong)NSString* inWork;
@property(nonatomic,assign)int vadBos;
@property(nonatomic,assign)int vadEos;
@property(nonatomic,assign)float volumeTS;

@property(nonatomic)NSTimer *SpeakTimer;//计时器

-(void) getResult:(NSString*) text;
-(void) initAll:(NSDictionary*) infos;
-(void) start:(NSDictionary*) infos bridgeIndex:(NSString*)index bridgeCategory:(NSString*)category;
-(void) stop;
-(void) stopChivox;
-(void) cancel;
-(void) cancelChivox;
-(void) iseCallback:(NSString*)code result:(NSString*) result;
-(void) iseVolume:(double)volume;
-(void) testFunc;
-(void) changeInWork:(NSString*)work;

-(void)playPcm;
-(void)stopPcm;
-(void)pausePcm;
-(void)playCallback:(NSString*)status msg:(NSString*)msg;

-(void)startTicks;
-(void)stopTicks;
-(void)timeTicked;

@end
