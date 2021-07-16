// Copyright 2015-present 650 Industries. All rights reserved.

#import <React/RCTAssert.h>

#import "EXDevLauncherRedBox.h"
#import "EXDevLauncherController.h"

#import <EXDevLauncher-Swift.h>

@interface EXDevLauncherRedBox ()

@property (nonatomic, weak) RCTLogBox *logBox;

@end

@implementation EXDevLauncherRedBox

@synthesize overrideBundleURL;
@synthesize overrideReloadAction;

- (void)registerLogBox:(RCTLogBox * _Nullable)logBox
{
  self.logBox = logBox;
}

- (void)addCustomButton:(NSString *)title onPressHandler:(RCTRedBoxButtonPressHandler)handler {

}

- (void)dismiss {

}

- (void)registerErrorCustomizer:(id<RCTErrorCustomizer>)errorCustomizer {

}

- (void)showError:(NSError *)error
{
  [self showErrorMessage:error.localizedDescription
             withDetails:error.localizedFailureReason
                   stack:error.userInfo[RCTJSStackTraceKey]
             errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message
{
  [self showErrorMessage:message withParsedStack:nil isUpdate:NO errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message withDetails:(NSString *)details
{
  [self showErrorMessage:message withDetails:details stack:nil errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message
             withDetails:(NSString *)details
                   stack:(NSArray<RCTJSStackFrame *> *)stack
             errorCookie:(int)errorCookie
{
  NSString *combinedMessage = message;
  if (details) {
    combinedMessage = [NSString stringWithFormat:@"%@\n\n%@", message, details];
  }
  [self showErrorMessage:combinedMessage withParsedStack:stack isUpdate:NO errorCookie:errorCookie];
}

- (void)showErrorMessage:(NSString *)message withRawStack:(NSString *)rawStack
{
  [self showErrorMessage:message withRawStack:rawStack errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message withRawStack:(NSString *)rawStack errorCookie:(int)errorCookie
{
  NSArray<RCTJSStackFrame *> *stack = [RCTJSStackFrame stackFramesWithLines:rawStack];
  [self showErrorMessage:message withParsedStack:stack isUpdate:NO errorCookie:errorCookie];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack
{
  [self showErrorMessage:message withStack:stack errorCookie:-1];
}

- (void)updateErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack
{
  [self updateErrorMessage:message withStack:stack errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack errorCookie:(int)errorCookie
{
  [self showErrorMessage:message
         withParsedStack:[RCTJSStackFrame stackFramesWithDictionaries:stack]
                isUpdate:NO
             errorCookie:errorCookie];
}

- (void)updateErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack errorCookie:(int)errorCookie
{
  [self showErrorMessage:message
         withParsedStack:[RCTJSStackFrame stackFramesWithDictionaries:stack]
                isUpdate:YES
             errorCookie:errorCookie];
}

- (void)showErrorMessage:(NSString *)message withParsedStack:(NSArray<RCTJSStackFrame *> *)stack
{
  [self showErrorMessage:message withParsedStack:stack errorCookie:-1];
}

- (void)updateErrorMessage:(NSString *)message withParsedStack:(NSArray<RCTJSStackFrame *> *)stack
{
  [self updateErrorMessage:message withParsedStack:stack errorCookie:-1];
}

- (void)showErrorMessage:(NSString *)message
         withParsedStack:(NSArray<RCTJSStackFrame *> *)stack
             errorCookie:(int)errorCookie
{
  [self showErrorMessage:message withParsedStack:stack isUpdate:NO errorCookie:errorCookie];
}

- (void)updateErrorMessage:(NSString *)message
           withParsedStack:(NSArray<RCTJSStackFrame *> *)stack
               errorCookie:(int)errorCookie
{
  [self showErrorMessage:message withParsedStack:stack isUpdate:YES errorCookie:errorCookie];
}

- (void)showErrorMessage:(NSString *)message
         withParsedStack:(NSArray<RCTJSStackFrame *> *)stack
                isUpdate:(BOOL)isUpdate
             errorCookie:(int)errorCookie
{
  if (isUpdate || errorCookie != -1) {
    // These errors should be handled by LogBox
    return;
  }
  
  // hide method was removed from the RCTLogBox interface in RN 0.64
  if ([self.logBox respondsToSelector:@selector(hide)]) {
    [self.logBox performSelector:@selector(hide)];
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [[EXDevLauncherController sharedInstance].errorManager showErrorWithMessage:[self stripAnsi:message] stack:stack];
  });
}

- (RCTRedBox *)unsafe_castToRCTRedBox {
  return (RCTRedBox *)self;
}

- (NSString *)stripAnsi:(NSString *)text
{
  NSError *error = nil;
  NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"\\x1b\\[[0-9;]*m"
                                                                         options:NSRegularExpressionCaseInsensitive
                                                                           error:&error];
  return [regex stringByReplacingMatchesInString:text options:0 range:NSMakeRange(0, [text length]) withTemplate:@""];
}

@end
