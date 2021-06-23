// Copyright 2015-present 650 Industries. All rights reserved.

#import "EXDevLauncherAppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBridgeDelegate.h>
#import <React/RCTRootView.h>
#import <UMCore/UMDefines.h>

#import "EXDevLauncherController.h"

@interface EXDevLauncherBridgeDelegateInterceptor : NSObject<RCTBridgeDelegate>

@property (nonatomic, weak) id<RCTBridgeDelegate> bridgeDelegate;

- (nonnull instancetype)initWithBridgeDelegate:(id<RCTBridgeDelegate>)bridgeDelegate;

@end

@interface EXDevLauncherAppDelegate()

@property (nonatomic, strong) NSDictionary *launchOptions;

@end

@implementation EXDevLauncherAppDelegate

#if DEBUG

UM_REGISTER_SINGLETON_MODULE(EXDevLauncherAppDelegate)

#endif

- (const NSInteger)priority
{
  return 1;
}

#pragma mark - UIApplicationDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.launchOptions = launchOptions;
  UIWindow *window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  id<UIApplicationDelegate> appDelegate = UIApplication.sharedApplication.delegate;
  appDelegate.window = window;
  EXDevLauncherController *controller = [EXDevLauncherController sharedInstance];
  [controller startWithWindow:appDelegate.window delegate:self launchOptions:launchOptions];

  return YES;
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([[EXDevLauncherController sharedInstance] onDeepLink:url options:options]) {
    return YES;
  }
  return NO;
}

#pragma mark - EXDevLauncherAppDelegate

- (void)devLauncherController:(EXDevLauncherController *)developmentClientController
          didStartWithSuccess:(BOOL)success
{
  developmentClientController.appBridge = [self initializeReactNativeApp];
}

- (RCTBridge *)initializeReactNativeApp
{
  if (![UIApplication.sharedApplication.delegate conformsToProtocol:@protocol(RCTBridgeDelegate)]) {
    [NSException raise:NSInvalidArgumentException format:@"AppDelegate does not conforms to RCTBridgeDelegate"];
  }
  EXDevLauncherBridgeDelegateInterceptor* bridgeDelegate = [[EXDevLauncherBridgeDelegateInterceptor alloc]
                                                            initWithBridgeDelegate:(id<RCTBridgeDelegate>)UIApplication.sharedApplication.delegate];

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:bridgeDelegate launchOptions:self.launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"main" initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;

  id<UIApplicationDelegate> appDelegate = UIApplication.sharedApplication.delegate;
  appDelegate.window.rootViewController = rootViewController;
  [appDelegate.window makeKeyAndVisible];

  return bridge;
}

@end

# pragma mark - EXDevLauncherBridgeDelegateInterceptor

@implementation EXDevLauncherBridgeDelegateInterceptor

- (nonnull instancetype)initWithBridgeDelegate:(id<RCTBridgeDelegate>)bridgeDelegate
{
  if (self = [super init]) {
    self.bridgeDelegate = bridgeDelegate;
  }
  return self;
}

- (id)forwardingTargetForSelector:(SEL)selector {
  if ([self isInterceptedSelector:selector]) {
    return self;
  }
  return self.bridgeDelegate;
}

- (BOOL)respondsToSelector:(SEL)selector {
  if ([self isInterceptedSelector:selector]) {
    return YES;
  }
  return [self.bridgeDelegate respondsToSelector:selector];
}

- (BOOL)isInterceptedSelector:(SEL)selector {
  if (selector == @selector(sourceURLForBridge:) || selector == @selector(bridge:didNotFindModule:)) {
    return YES;
  }
  return NO;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return EXDevLauncherController.sharedInstance.sourceUrl;
}

- (BOOL)bridge:(RCTBridge *)bridge didNotFindModule:(NSString *)moduleName {
  return YES;
}

@end
