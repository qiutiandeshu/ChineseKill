//
//  TwitterLogin.m
//  Jicheng8
//
//  Created by guojicheng on 16/11/15.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "TwitterLogin.h"
#import "RCTConvert.h"
#import <TwitterKit/TwitterKit.h>

@implementation TwitterLogin

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(Login)
{
//  [[Twitter sharedInstance] logInWithCompletion:^(TWTRSession* session, NSError* error){
//    if (session){
//      NSLog(@"signed in as %@", [session userName]);
//      [self twlCallback:@"1" result:
//       [NSString stringWithFormat:@"{\"userName\": \"%@\",\"userID\": \"%@\",\"authToken\": \"%@\",\"authTokenSecret\": \"%@\"}",
//        [session userName],
//        [session userID],
//        [session authToken],
//        [session authTokenSecret]
//        ]
//       ];
//    }else{
//      NSLog(@"error: %@", [error localizedDescription]);
//      [self twlCallback:@"0" result:
//       [NSString stringWithFormat:@"{\"eroor\":\"%@\"}",
//        [error localizedDescription]
//        ]
//       ];
//    }
//  }];
  [[Twitter sharedInstance] logInWithMethods:TWTRLoginMethodWebBased completion:^(TWTRSession* session, NSError* error) {
    if (session){
      NSLog(@"signed in as %@", [session userName]);
      [self twlCallback:CB_CODE_LOGIN result:
       [NSString stringWithFormat:@"{\"userName\": \"%@\",\"userID\": \"%@\",\"authToken\": \"%@\",\"authTokenSecret\": \"%@\"}",
        [session userName],
        [session userID],
        [session authToken],
        [session authTokenSecret]
        ]
       ];
    }else{
      NSLog(@"error: %@", [error localizedDescription]);
      [self twlCallback:CB_CODE_ERROR
                 result:[NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"%@\"}", ERROR_LOGIN, [error localizedDescription]]];
    }
  }];
}

RCT_EXPORT_METHOD(GetInfos)
{
  TWTRAPIClient* client = [TWTRAPIClient clientWithCurrentUser];
  NSURLRequest *request = [client URLRequestWithMethod:@"GET"
                                                   URL:@"https://api.twitter.com/1.1/account/verify_credentials.json"
                                            parameters:@{@"include_email": @"true", @"skip_status": @"true"}
                                                 error:nil];
  [client sendTwitterRequest:request completion:^(NSURLResponse* response, NSData* data, NSError* connectionError) {
    if (connectionError == nil){
//      NSDictionary* dic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:nil];
//      NSLog(@"name: %@", dic[@"name"]);
      [self twlCallback:CB_CODE_GETINFO result:[[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding]];
    }else{
      [self twlCallback:CB_CODE_ERROR
                 result:
       [NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"%@\"}",
        ERROR_GETINFO,
        [connectionError localizedDescription]]];
    }
  }];
}

RCT_EXPORT_METHOD(Logout)
{
  TWTRSessionStore* store = [[Twitter sharedInstance] sessionStore];
  NSString* userID = store.session.userID;
  if (userID){
    [store logOutUserID:userID];
    NSLog(@"signed out as %@", userID);
    [self twlCallback:CB_CODE_LOGOUT
               result:[NSString stringWithFormat:@"{\"userID\":\"%@\"}", userID]];
  }else{
    NSLog(@"not login!");
    [self twlCallback:CB_CODE_ERROR
               result:
     [NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"not login!\"}",
      ERROR_NOTLOGIN
      ]
     ];
  }
}

RCT_EXPORT_METHOD(IsExpired)
{
  TWTRSessionStore* store = [[Twitter sharedInstance] sessionStore];
  NSString* userID = store.session.userID;
  if (userID){
    [[[TWTRAPIClient alloc]init] loadUserWithID:userID completion:^(TWTRUser* user, NSError* error) {
      if (error.domain == TWTRErrorDomain && (error.code == TWTRAPIErrorCodeInvalidOrExpiredToken || error.code == TWTRAPIErrorCodeBadGuestToken)){
        NSLog(@"is expired!");
        [self twlCallback:CB_CODE_EXPIRED result:EXPIRED_OUT];
      }else if (error) {
        NSLog(@"isExpired error: %@", error.localizedDescription);
        [self twlCallback:CB_CODE_ERROR
                   result:
         [NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"%@\"}",
          ERROR_EXPIRED,
          [error localizedDescription]]];
      }else{
        NSLog(@"not expired!");
        [self twlCallback:CB_CODE_EXPIRED result:EXPIRED_IN];
      }
    }];
  }else{
    NSLog(@"not login!");
    [self twlCallback:CB_CODE_ERROR
               result:
     [NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"not login!\"}",
      ERROR_NOTLOGIN
      ]
     ];
  }
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"twlCallback"];//有几个就写几个
}

-(void)twlCallback:(NSString*)code result:(NSString*) result
{
  [self sendEventWithName:@"twlCallback"
                     body:@{
                            @"code": code,
                            @"result": result,
                            }];
}

-(NSDictionary*)constantsToExport
{
  return @{
           @"CB_CODE_ERROR": @"0",
           @"CB_CODE_LOGIN": @"1",
           @"CB_CODE_LOGOUT": @"2",
           @"CB_CODE_EXPIRED": @"3",
           @"CB_CODE_GETINFO": @"4",
           
           @"ERROR_LOGIN": @"0",
           @"ERROR_EXPIRED": @"1",
           @"ERROR_GETINFO": @"2",
           @"ERROR_NOTLOGIN": @"3",
           
           @"EXPIRED_IN": @"0",
           @"EXPIRED_OUT": @"1"
           };
}

@end
