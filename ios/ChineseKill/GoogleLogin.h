//
//  GoogleLogin.h
//  Jicheng8
//
//  Created by guojicheng on 16/11/17.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "RCTEventEmitter.h"

#define CB_CODE_ERROR @"0"
#define CB_CODE_LOGIN @"1"
#define CB_CODE_LOGOUT @"2"
#define CB_CODE_EXPIRED @"3"
#define CB_CODE_DISCONNECT @"4"

#define ERROR_LOGIN @"0"
#define ERROR_DISCONNECT @"1"

#define EXPIRED_IN @"0"
#define EXPIRED_OUT @"1"

@interface GoogleLogin : RCTEventEmitter

@end
