//
//  ChivoxISE.m
//  Jicheng7
//
//  Created by guojicheng on 16/10/13.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "ChivoxISE.h"
#import "zlib.h"
#include "aiengine.h"
#import "RCTEventDispatcher.h"
#import "RCTConvert.h"
#import "PcmPlayer.h"
#import "PcmPlayerDelegate.h"

bool blnStart = false;
bool blnSpeaked = false;
int tickCount = 0;
Byte feedData[999999];
int feedSize = 0;

@interface ChivoxISE() <PcmPlayerDelegate>

@property (nonatomic, retain) PcmPlayer* pcmPlayer;

@end

@implementation ChivoxISE

RCT_EXPORT_MODULE();

-(dispatch_queue_t)methodQueue
{
//  return dispatch_get_main_queue();
  return dispatch_queue_create("com.jld.rn.chivoxise", DISPATCH_QUEUE_SERIAL);
}

static int _recorder_callback(const void* usrdata, const void * data, int size, const void* dlgdata)
{
  if (feedSize == 0){
    feedSize = size;
    memcpy(feedData, data, feedSize);
  }else{
    int oldsize = feedSize;
    feedSize += size;
    memcpy(feedData+oldsize, data, size);
  }
  if (feedSize >= 32000){
    NSLog(@"feed: %d\n", feedSize);
    int rv = aiengine_feed((struct aiengine*)usrdata, feedData, feedSize);
    feedSize = 0;
    if (rv == -1){
      if (dlgdata != NULL){
        [(__bridge ChivoxISE *)dlgdata stopChivox];
      }
    }else{
      if (dlgdata != NULL){
        [(__bridge ChivoxISE *)dlgdata changeInWork:@"work"];
      }
    }
    return rv;
  }else{
    if (dlgdata != NULL){
      [(__bridge ChivoxISE *)dlgdata changeInWork:@"work"];
    }
    return 0;
  }
}

static int _aiengine_callback(const void * dlgdata, const char *id, int type, const void *message, int size)
{
  if (type == AIENGINE_MESSAGE_TYPE_JSON){
    [(__bridge ChivoxISE *)dlgdata performSelectorOnMainThread:@selector(getResult:) withObject:[[NSString alloc] initWithUTF8String:(char *)message] waitUntilDone:NO];
  }
  return  0;
}

-(instancetype)init
{
  self = [super init];
  
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
  _wavFilePath = [paths objectAtIndex:0];
  
  return self;
}

-(void) testFunc
{
  NSLog(@"test function!");
}

RCT_EXPORT_METHOD(initAll:(NSDictionary*) infos)
{
  if (engine){
    aiengine_delete(engine);
  }
  if (recorder){
    airecorder_delete(recorder);
  }
  char cfg[4096];
  const char *provision;
  self.appKey = [RCTConvert NSString:infos[@"APP_KEY"]];
  self.secretKey = [RCTConvert NSString:infos[@"SECRET_KEY"]];
  
  provision = [[[NSBundle mainBundle] pathForResource:[[NSString alloc] initWithUTF8String:"aiengine.provision"] ofType:NULL] UTF8String];
  
  sprintf(cfg, "{\"appKey\": \"%s\", \"secretKey\": \"%s\", \"provision\": \"%s\",\"cloud\":{\"enable\":1, \"server\": \"ws://cloud.chivox.com:8080\"}}", [_appKey UTF8String], [_secretKey UTF8String], provision);
  NSLog(@"cfg: %s\n", cfg);
  engine = aiengine_new(cfg);
  recorder = airecorder_new();
  if (engine == NULL){
    NSLog(@"初始化评测引擎失败，请检查各参数！");
    [self iseCallback:CB_CODE_ERROR
               result:@"初始化评测引擎失败，请检查各参数！"];
  }
}

RCT_EXPORT_METHOD(start:(NSDictionary*) infos bridgeIndex:(NSString*)index bridgeCategory:(NSString*)category)
{
  int rv = 0;
  self.bridgeIndex = [NSString stringWithString:index];
  self.bridgeCategory = [NSString stringWithString:category];
  if (recorder == NULL || engine == NULL) {
    NSLog(@"未初始化评测引擎，请先初始化引擎！");
    [self iseCallback:CB_CODE_ERROR
               result:@"未初始化评测引擎，请先初始化引擎！"];
    return;
  }
  self.vadBos = [[RCTConvert NSNumber:infos[@"VAD_BOS"]] intValue];
  self.vadEos = [[RCTConvert NSNumber:infos[@"VAD_EOS"]] intValue];
  self.volumeTS = [[RCTConvert NSNumber:infos[@"VOLUME_TS"]] floatValue];
  self.userID = [RCTConvert NSString:infos[@"USER_ID"]];
  NSString* sampleRate = [RCTConvert NSString:infos[@"SAMPLE_RATE"]];
  blnStart = true;
  feedSize = 0;
  NSLog(@"start chivox!");
  self.inWork = @"not";
  [self iseCallback:CB_CODE_STATUS result:SPEECH_START];
  char wav_path[1024];
  char record_id[64];
  NSString* recordName = [RCTConvert NSString:infos[@"ISE_AUDIO_PATH"]];
  strcpy(record_id, [recordName UTF8String]);
  NSString* strInfo = @"{\"coreProvideType\":\"cloud\",\"app\": {\"userId\": \"";
  strInfo = [strInfo stringByAppendingString:_userID];
  strInfo = [strInfo stringByAppendingString:@"\"}, \"audio\": {\"audioType\": \"wav\", \"sampleRate\": "];
  strInfo = [strInfo stringByAppendingString:sampleRate];
  strInfo = [strInfo stringByAppendingString:@", \"channel\": 1, \"sampleBytes\": 2}, \"request\" : {\"coreType\": \""];
  NSString* strCategory = [RCTConvert NSString:infos[@"ISE_CATEGORY"]];
  if ([strCategory isEqualToString:@"word"]){//字词评测
    strInfo = [strInfo stringByAppendingString:@"cn.word.score\", \"refText\": \""];
  }else{//句子评测
    strInfo = [strInfo stringByAppendingString:@"cn.sent.score\", \"refText\": \""];
  }
  strInfo = [strInfo stringByAppendingString:[RCTConvert NSString:infos[@"TEXT"]]];
  strInfo = [strInfo stringByAppendingString:@"\", \"rank\": 100, \"attachAudioUrl\": 1}}"];
  
  //strInfo 组成的字符串
  //"{\"coreProvideType\":\"cloud\",\"app\": {\"userId\": \"this-is-user-id\"}, \"audio\": {\"audioType\": \"wav\", \"sampleRate\": 16000, \"channel\": 1, \"sampleBytes\": 2}, \"request\" : {\"coreType\": \"cn.word.score\", \"refText\": \"zou3 dao4 na4 li3 xu1 yao4 duo1 jiu3?\", \"rank\": 100, \"attachAudioUrl\": 1}}"
  rv = aiengine_start(engine,
                      [strInfo UTF8String],
                      record_id,
                      (aiengine_callback)_aiengine_callback,
                      (__bridge const void*)self);
  if (rv) {
    NSLog(@"aiengine_start() failed: %d\n", rv);
    [self stopChivox];
    return;
  }
  
  NSString* tmpPath = [RCTConvert NSString:infos[@"WAV_PATH"]];
  if (tmpPath && ![tmpPath isEqualToString:@""]){//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
    sprintf(wav_path, "%s/%s.wav", [tmpPath UTF8String], [recordName UTF8String]);
  }else{
    sprintf(wav_path, "%s/%s.wav", [_wavFilePath UTF8String], [recordName UTF8String]);
  }
  NSLog(@"wav_path: %s\n", wav_path);
  
  AVAudioSession * session = [AVAudioSession sharedInstance];
  if (!session) printf("ERROR INITIALIZING AUDIO SESSION! \n");
  else{
    NSError* nsError;
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:&nsError];
    if (nsError) {
      NSLog(@"couldn't set audio category!");
    }
    [session setActive:YES error:&nsError];
    if (nsError) {
      NSLog(@"AudioSession setActive = YES failed");
    }
  }
  
  rv = airecorder_start(recorder, wav_path, _recorder_callback, engine, 100,
                        (__bridge const void*)self);
  if(rv != 0) {
    NSLog(@"airecorder_start() failed: %d\n", rv);
    [self iseCallback:CB_CODE_ERROR result:@"录音启动失败！"];
    return;
  }
  [self iseCallback:CB_CODE_STATUS result:SPEECH_PRESTART];
}

-(void) changeInWork:(NSString*)work
{
  if (![self.inWork isEqualToString:work]){
    self.inWork = work;
    if ([self.inWork isEqualToString:@"work"]){
      [self startTicks];
      [self iseCallback:CB_CODE_STATUS result:SPEECH_WORK];
    }
  }
}

- (void) getResult:(NSString *)text
{
  NSLog(@"%s\n", [text UTF8String]);
  if ([text containsString:@"error"]){
    [self stopChivox];
    [self iseCallback:CB_CODE_ERROR
               result:[NSString stringWithFormat:@"-20161015_%@", text]];
  }else{
    [self iseCallback:CB_CODE_RESULT result:text];
  }
}

RCT_EXPORT_METHOD(stop)
{
  if (blnSpeaked){
    [self stopChivox];
    [self iseCallback:CB_CODE_STATUS result:SPEECH_RECOG];
  }else{
    [self cancelChivox];
    [self iseCallback:CB_CODE_ERROR result:@"没有说话"];
  }
}

-(void) stopChivox
{
  if (recorder == NULL || engine == NULL) {
    NSLog(@"recorder and engine is null!");
    return;
  }
  if (feedSize > 0){
    NSLog(@"feed: %d\n", feedSize);
    aiengine_feed(engine, feedData, feedSize);
    feedSize = 0;
  }
  NSLog(@"stop chivox!");
  airecorder_stop(recorder);
  aiengine_stop(engine);
}

-(void) cancelChivox
{
  if (recorder == NULL || engine == NULL) {
    NSLog(@"recorder and engine is null!");
    return;
  }
  NSLog(@"cancel chivox!");
  airecorder_stop(recorder);
  aiengine_cancel(engine);
}

RCT_EXPORT_METHOD(cancel)
{
  [self cancelChivox];
  [self iseCallback:CB_CODE_STATUS result:SPEECH_STOP];
}

RCT_REMAP_METHOD(initPcm,
                 infos:(NSDictionary*)infos
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString* filePath = [RCTConvert NSString:infos[@"FILE_PATH"]];
  NSString* rate = [RCTConvert NSString:infos[@"SAMPLE_RATE"]];
  long value = [rate intValue];
  NSString* tmpPath = [RCTConvert NSString:infos[@"WAV_PATH"]];
  NSString* realPath;
  if (tmpPath && ![tmpPath isEqualToString:@""]){//如果传递了录音文件保存路径，则使用传入的地址，否则默认路径保存在Caches文件夹下面
    realPath = [NSString stringWithFormat:@"%@/%@.wav", tmpPath, filePath];
  }else{
    realPath = [NSString stringWithFormat:@"%@/%@.wav", _wavFilePath, filePath];
  }
  if(_pcmPlayer != nil){
    _pcmPlayer = nil;
  }
  _pcmPlayer = [[PcmPlayer alloc] initWithFilePath:realPath sampleRate:value];
  if (_pcmPlayer == nil){
    reject(@"1", @"文件不存在或数据为空", nil);
  }else{
    _pcmPlayer.delegate = self;
    resolve([[NSNumber alloc]initWithDouble:[_pcmPlayer getLong]]);
  }
}

RCT_REMAP_METHOD(getPcmCurrentTime,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve([[NSNumber alloc]initWithDouble:[_pcmPlayer getCurrentTime]]);
}

RCT_EXPORT_METHOD(playPcm)
{
  [_pcmPlayer play];
}

RCT_EXPORT_METHOD(stopPcm)
{
  [_pcmPlayer stop];
}

RCT_EXPORT_METHOD(pausePcm)
{
  [_pcmPlayer pause];
}

RCT_EXPORT_METHOD(getStatus:(RCTResponseSenderBlock)callback)
{
  callback(@[[NSNull null], self.bridgeStatus]);
}

-(void)startTicks
{
  self.SpeakTimer = [NSTimer scheduledTimerWithTimeInterval:0.1
                                               target:self
                                             selector:@selector(timeTicked)
                                             userInfo:nil
                                              repeats:YES];
}

-(void)stopTicks
{
  if (self.SpeakTimer){
    [self.SpeakTimer invalidate];
    self.SpeakTimer = nil;
  }
}

-(void)timeTicked
{
  double volume = airecorder_getVolume(recorder);

  volume = pow(10,0.05*volume);
  NSLog(@"volume: %f\n", volume);
  [self iseVolume: volume];
  if (blnStart){
    blnStart = false;
    blnSpeaked = false;
    tickCount = 0;
  }
  if (volume >= self.volumeTS){
    blnSpeaked = true;
    tickCount = 0;
  }else{
    tickCount++;
  }
  if (blnSpeaked){
    if (tickCount * 100 >= self.vadEos){
      [self stop];
    }
  }
  else{
    if (tickCount * 100 >= self.vadBos){
      [self stop];
    }
  }
}

-(NSDictionary*) constantsToExport
{
  return @{
           @"CB_CODE_RESULT":@"0",
           @"CB_CODE_ERROR":@"1",
           @"CB_CODE_STATUS":@"2",
           @"CB_CODE_LOG":@"3",
           
           @"SPEECH_START":@"0",
           @"SPEECH_WORK":@"1",
           @"SPEECH_RECOG":@"2",
           @"SPEECH_STOP":@"3",
           @"SPEECH_PRESTART":@"4",
           
           @"PCM_TOTALTIME":@"0",//总时间
           @"PCM_CURRENTTIME":@"1",//当前时间
           @"PCM_PLAYOVER":@"2",//播放完
           @"PCM_ERROR":@"3"//错误信息
           };
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"iseCallback", @"iseVolume", @"playCallback"];
}

-(void)iseCallback:(NSString*)code result:(NSString*) result
{
  if ([code isEqualToString:CB_CODE_STATUS]){
    self.bridgeStatus = result;
//    if ([self.bridgeStatus isEqualToString:SPEECH_PRESTART]){
//      [self startTicks];
//    }
  }else if ([code isEqualToString:CB_CODE_RESULT] || [code isEqualToString:CB_CODE_ERROR]){
    self.bridgeStatus = SPEECH_STOP;
    [self stopTicks];
  }else if ([code isEqualToString:CB_CODE_STATUS] && [result isEqualToString:SPEECH_RECOG]){
    [self stopTicks];
  }
  [self sendEventWithName:@"iseCallback"
                     body:@{
                            @"code": code,
                            @"result": result,
                            @"index": self.bridgeIndex,
                            @"category": self.bridgeCategory
                            }];
}

-(void)iseVolume:(double)volume
{
  [self sendEventWithName:@"iseVolume"
                     body:@{
                            @"volume": [NSString stringWithFormat:@"%f", volume]
                            }];
}

-(void)playCallback:(NSString*)status msg:(NSString*)msg
{
  [self sendEventWithName:@"playCallback"
                     body:@{
                            @"status": status,
                            @"msg": msg
                            }];
}

#pragma mark - PcmPlayerDelegate
//播放音频结束
-(void)onPlayCompleted {
  [self playCallback:PCM_PLAYOVER msg:@"0"];
}

@end







