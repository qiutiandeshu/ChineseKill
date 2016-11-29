//
//  GoogleLogin.m
//  Jicheng8
//
//  Created by guojicheng on 16/11/17.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "GoogleLogin.h"
#import <GoogleSignIn/GoogleSignIn.h>
#import "AppDelegate.h"

@interface GoogleLogin()<GIDSignInDelegate, GIDSignInUIDelegate>

@end

@implementation GoogleLogin

-(instancetype)init
{
  self = [super init];
  if (self){
    [GIDSignIn sharedInstance].shouldFetchBasicProfile = YES;
    [GIDSignIn sharedInstance].delegate = self;
    [GIDSignIn sharedInstance].uiDelegate = self;
//    [[GIDSignIn sharedInstance] setScopes:[NSArray arrayWithObject:@"https://www.googleapis.com/auth/plus.login"]];
  }
  return self;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(Login)
{
  [[GIDSignIn sharedInstance]signIn];
}

RCT_EXPORT_METHOD(LoginSilently)
{
  [[GIDSignIn sharedInstance]signInSilently];
}

RCT_EXPORT_METHOD(Logout)
{
  [[GIDSignIn sharedInstance]signOut];
  NSLog(@"signOut success!");
  [self gglCallback:CB_CODE_LOGOUT
             result:@"logout success!"];
}

RCT_EXPORT_METHOD(IsExpired)
{
  BOOL ret = [[GIDSignIn sharedInstance]hasAuthInKeychain];
  if (ret){
    NSLog(@"not expired!");
    [self gglCallback:CB_CODE_EXPIRED result:EXPIRED_IN];
  }else{
    NSLog(@"is expired!");
    [self gglCallback:CB_CODE_EXPIRED result:EXPIRED_OUT];
  }
}

RCT_EXPORT_METHOD(Disconnect)
{
  [[GIDSignIn sharedInstance]disconnect];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"gglCallback"];//有几个就写几个
}

-(void)gglCallback:(NSString*)code result:(NSString*) result
{
  [self sendEventWithName:@"gglCallback"
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
           @"CB_CODE_DISCONNECT": @"4",
           
           @"ERROR_LOGIN": @"0",
           @"ERROR_DISCONNECT": @"1",
           
           @"EXPIRED_IN": @"0",
           @"EXPIRED_OUT": @"1"
           };
}

-(void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error
{
  // Perform any operations on signed in user here.
//  NSString *userId = user.userID;                  // For client-side use only!
//  NSString *idToken = user.authentication.idToken; // Safe to send to the server
//  NSString *fullName = user.profile.name;
//  NSString *givenName = user.profile.givenName;
//  NSString *familyName = user.profile.familyName;
//  NSString *email = user.profile.email;
  // ...
  if (error){
    [self gglCallback:CB_CODE_ERROR
               result:[NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"%@\"}",
                       ERROR_LOGIN,
                       [error localizedDescription]]];
  }else{
    NSLog(@"signIn as %@", user.profile.name);
    [self gglCallback:CB_CODE_LOGIN
               result:[NSString stringWithFormat:
                       @"{\"userID\":\"%@\", \"idToken\":\"%@\", \"fullName\":\"%@\", \"email\":\"%@\"}",
                       user.userID,
                       user.authentication.idToken,
                       user.profile.name,
                       user.profile.email]];
  }
}

-(void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error
{
  if (error) {
    [self gglCallback:CB_CODE_ERROR
               result:[NSString stringWithFormat:@"{\"id\":\"%@\", \"dsc\":\"%@\"}",
                       ERROR_DISCONNECT,
                       [error localizedDescription]]];
  }else{
    NSLog(@"disconnent as %@", user.profile.name);
    [self gglCallback:CB_CODE_DISCONNECT
               result:[NSString stringWithFormat:
                       @"{\"userID\":\"%@\", \"idToken\":\"%@\", \"fullName\":\"%@\", \"email\":\"%@\"}",
                       user.userID,
                       user.authentication.idToken,
                       user.profile.name,
                       user.profile.email]];
  }
}

//-(void)signInWillDispatch:(GIDSignIn *)signIn error:(NSError *)error
//{
//  if (error) {
//    NSLog(@"error: %@", [error localizedDescription]);
//  }else{
//    NSLog(@"signIn as %@", signIn.currentUser.profile.name);
//  }
//}

-(void)signIn:(GIDSignIn *)signIn dismissViewController:(UIViewController *)viewController
{
  NSLog(@"dismiss as %@", signIn.currentUser.profile.name);
  UINavigationController* ui = [[UIApplication sharedApplication] valueForKeyPath:@"delegate.navigationController"];
  [ui popViewControllerAnimated:YES];
}

-(void)signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController
{
  NSLog(@"present as %@", signIn.currentUser.profile.name);
  UINavigationController* ui = [[UIApplication sharedApplication] valueForKeyPath:@"delegate.navigationController"];
  [ui pushViewController:viewController animated:YES];
}

@end
