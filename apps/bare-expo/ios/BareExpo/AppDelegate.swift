//
//  AppDelegate.swift
//  BareExpo
//
//  Created by the Expo team on 5/27/20.
//  Copyright © 2020 Expo. All rights reserved.
//

import Foundation

@UIApplicationMain
class AppDelegate: UMAppDelegateWrapper {
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  var moduleRegistryAdapter: UMModuleRegistryAdapter!
  
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    ensureReactMethodSwizzlingSetUp()

    moduleRegistryAdapter = UMModuleRegistryAdapter(moduleRegistryProvider: UMModuleRegistryProvider())
    self.launchOptions = launchOptions
    
    self.window = UIWindow(frame: UIScreen.main.bounds)

    // DEBUG must be setup in Swift projects: https://stackoverflow.com/a/24112024/4047926
//    #if DEBUG
      initializeReactNativeApp()
//    #else
//      let controller = EXUpdatesAppController.sharedInstance()
//      controller.delegate = self
//      controller.startAndShowLaunchScreen(window!)
//    #endif

    super.application(application, didFinishLaunchingWithOptions: launchOptions);
    
    return true
  }
  
  @discardableResult
  func initializeReactNativeApp() -> RCTBridge? {
    guard let bridge = RCTBridge(delegate: self, launchOptions: launchOptions) else { return nil }
    let rootView = RCTRootView(bridge: bridge, moduleName: "BareExpo", initialProperties: nil)
    let rootViewController = UIViewController()
    rootView.backgroundColor = UIColor.white;
    rootViewController.view = rootView
    
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()
    
    return bridge
  }
  
  #if RCT_DEV
  func bridge(_ bridge: RCTBridge!, didNotFindModule moduleName: String!) -> Bool {
    return true;
  }
  #endif
  
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options);
  }
}

// MARK: - RCTBridgeDelegate

extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings()?.jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
    #else
//    return EXUpdatesAppController.sharedInstance().launchAssetUrl!
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle");
    #endif
  }
  
  func extraModules(for bridge: RCTBridge!) -> [RCTBridgeModule]! {
    var extraModules = moduleRegistryAdapter.extraModules(for: bridge)
    // You can inject any extra modules that you would like here, more information at:
    // https://facebook.github.io/react-native/docs/native-modules-ios.html#dependency-injection
    
    // RCTDevMenu was removed when integrating React with Expo client:
    // https://github.com/expo/react-native/commit/7f2912e8005ea6e81c45935241081153b822b988
    // Let's bring it back in Bare Expo.
    extraModules?.append(RCTDevMenu() as! RCTBridgeModule)
    return extraModules
  }
}

// MARK: - Expo fork of React Native

public class Dispatch
{
   private static var _onceTracker = [String]()

    public class func once(file: String = #file,
                           function: String = #function,
                           line: Int = #line,
                           block: () -> Void) {
        let token = "\(file):\(function):\(line)"
        once(token: token, block: block)
    }

    /**
     Executes a block of code, associated with a unique token, only once.  The code is thread safe and will
     only execute the code once even in the presence of multithreaded calls.

     - parameter token: A unique reverse DNS style name such as com.vectorform.<name> or a GUID
     - parameter block: Block to execute once
     */
    public class func once(token: String,
                           block: () -> Void) {
        objc_sync_enter(self)
        defer { objc_sync_exit(self) }

        guard !_onceTracker.contains(token) else { return }

        _onceTracker.append(token)
        block()
    }
}

extension AppDelegate {
  // Bring back React method swizzling removed from its Pod
  // when integrating with Expo client.
  // https://github.com/expo/react-native/commit/7f2912e8005ea6e81c45935241081153b822b988
  func ensureReactMethodSwizzlingSetUp() {
    Dispatch.once {

      //#pragma clang diagnostic push
      //#pragma clang diagnostic ignored "-Wundeclared-selector"
      // RCTKeyCommands.m
      // swizzle UIResponder
      RCTSwapInstanceMethods(UIResponder.self,
                             #selector(getter: UIResponder.keyCommands),
                             Selector(("RCT_keyCommands")));

      // RCTDevMenu.m
      // We're swizzling here because it's poor form to override methods in a category,
      // however UIWindow doesn't actually implement motionEnded:withEvent:, so there's
      // no need to call the original implementation.
      RCTSwapInstanceMethods(UIWindow.self,
                             #selector(UIResponder.motionEnded(_:with:)),
                             Selector(("RCT_motionEnded:withEvent:")));
      //#pragma clang diagnostic pop
    }
  }
}

