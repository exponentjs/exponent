# expo-dev-launcher

`expo-dev-launcher` is an npm package installable in any Expo or React Native project. Once installed, any Debug builds of your application will gain the ability to load projects from Expo CLI. Release builds of your application will not change other than the addition of a few header files. This package is intended to be included in your project through [`expo-dev-client`](https://docs.expo.io/clients/introduction/).

# ⚙️ Installation

Firstly, you need to add the `expo-dev-launcher` package to your project.

<details>
<summary>yarn</summary>

```bash
yarn add expo-dev-launcher expo-dev-menu-interface expo-updates-interface
```

</details>

<details>
<summary>npm</summary>

```bash
npm install expo-dev-launcher expo-dev-menu-interface expo-updates-interface
```

</details>

<br>

Then you can start to configure the native projects using steps below.

## 🤖 Android

1.  Initialize the `DevLauncherController`.

    Open your `MainApplication.{java|kt}` and add the following lines:

    <details>
    <summary>Java</summary>

    ```java
    ...
    // You need to import the `DevLauncherController` class
    import expo.modules.devlauncher.DevLauncherController;
    ...
    public class MainApplication extends Application implements ReactApplication {
      ...
      @Override
      public void onCreate() {
        super.onCreate();
        ...
        DevLauncherController.initialize(this, mReactNativeHost); // Initialize the `DevLauncherController` with the `ReactNativeHost`
      }
    }
    ```

    </details>
    <details>
    <summary>Kotlin</summary>

    ```kotlin
    ...
    // You need to import the `DevLauncherController` class
    import expo.modules.devlauncher.DevLauncherController;
    ...
    public class MainApplication : Application(), ReactApplication {
      ...
      override public fun onCreate() {
        super.onCreate();
        ...
        DevLauncherController.initialize(this, mReactNativeHost); // Initialize the `DevLauncherController` with the `ReactNativeHost`
      }
    }
    ```

    </details>
    <br>

2.  Wrap the default `ReactActivityDelegate` with the one from `DevLauncher`.

    Open your `MainActivity.{java|kt}` and add the following lines:

    <details>
    <summary>Java</summary>

    ```java
    ...
    // You need to import the `DevLauncherController` class
    import expo.modules.devlauncher.DevLauncherController;
    ...
    public class MainActivity extends DevMenuAwareReactActivity {
      ...
      @Override
      protected ReactActivityDelegate createReactActivityDelegate() {
        return DevLauncherController.wrapReactActivityDelegate(
          this,
          () -> new ReactActivityDelegate(this, getMainComponentName()) // Here you can pass your custom `ReactActivityDelegate`
        );
      }
    }
    ```

    </details>
    <details>
    <summary>Kotlin</summary>

    ```kotlin
    ...
    // You need to import the `DevLauncherController` class
    import expo.modules.devlauncher.DevLauncherController;
    ...
    public class MainActivity : DevMenuAwareReactActivity() {
      ...
      protected override fun ReactActivityDelegate createReactActivityDelegate(): ReactActivityDelegate {
        return DevLauncherController.wrapReactActivityDelegate(this) {
          ReactActivityDelegate(this, getMainComponentName()) // Here you can pass your custom `ReactActivityDelegate`
        });
      }
    }
    ```

    </details>

    <br>

3.  Pass new intents to the `DevLauncherController`.

    > **Note:** This step is not required but without it, **deep-link** handling **won't work**.

    Open your `MainActivity.{java|kt}` and add the following method:

    <details>
    <summary>Java</summary>

    ```java
    ...
    public class MainActivity extends DevMenuAwareReactActivity {
      ...
      @Override
      public void onNewIntent(Intent intent) {
        if (DevLauncherController.tryToHandleIntent(this, intent)) {
          return;
        }
        super.onNewIntent(intent);
      }
    }
    ```

    </details>
    <details>
    <summary>Kotlin</summary>

    ```kotlin
    ...
    public class MainActivity : DevMenuAwareReactActivity() {
      ...
      public override fun onNewIntent(intent: Intent) {
        if (DevLauncherController.tryToHandleIntent(this, intent)) {
          return;
        }
        super.onNewIntent(intent);
      }
    }
    ```

    </details>

## 🍏 iOS

1. Run `npx pod-install` after installing the npm package.

2. Set up the `EXDevLauncherControllerDelegate`.

   <details>
   <summary>Objective-C</summary>

   Open your `AppDelegate.h` and implement `EXDevLauncherControllerDelegate`.

   ```objc
   ...
   // You need to import the `EXDevLauncherController` and `EXDevLauncherControllerDelegate.
   #import <EXDevLauncherController.h>
   ...
   @interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate, EXDevLauncherControllerDelegate> // Here you're implementing the `EXDevLauncherControllerDelegate`

   @end

   ```

   Open your `AppDelegate.m` and add the following method:

   ```objc
   ...
   @implementation AppDelegate
   ...
   - (void)developmentClientController:(EXDevLauncherController * )devLauncherController
               didStartWithSuccess:(BOOL)success
   {
     devLauncherController.appBridge = [self initializeReactNativeApp];
   }
   ...
   @end
   ```

    </details>

    <details>
    <summary>Swift</summary>

   Open your `AppDelegate.swift` and implement `EXDevLauncherControllerDelegate`.

   ```swift
   ...
   @UIApplicationMain
   class AppDelegate: UMAppDelegateWrapper, EXDevLauncherControllerDelegate { // You need to implement the `EXDevLauncherControllerDelegate`
     ...
     func developmentClientController(_ devLauncherController: EXDevLauncherController!, didStartWithSuccess success: Bool) {
      devLauncherController.appBridge = initializeReactNativeBridge()
     }
     ...
   }
   ```

    </details>

    <br>

3. Start the `EXDevLauncherController`.

   Open your `AppDelegate.{m|swift}` and add the following lines:

   <details>
   <summary>Objective-C</summary>

   ```objc
   @implementation AppDelegate
   ...
   - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
   {
     // Remove [self initializeReactNativeApp];
     // and instead add:
     EXDevLauncherController *controller = [EXDevLauncherController sharedInstance];
     [controller startWithWindow:self.window delegate:self launchOptions:launchOptions];
   }
   ...
   @end
   ```

   </details>
   <details>
   <summary>Swift</summary>

   ```swift
   ...
   @UIApplicationMain
   class AppDelegate: UMAppDelegateWrapper {
     ...
     override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       // Remove
       // [self initializeReactNativeApp];
       // and instead add:
       let controller = EXDevLauncherController.sharedInstance()
       controller?.start(with: window, delegate: self, launchOptions: launchOptions);
     }
     ...
   }
   ```

   </details>

   <br>

4. Change the source URL.

   Open your `AppDelegate.{m|swift}` and add the following lines:

   <details>
   <summary>Objective-C</summary>

   ```objc
   ...
   @implementation AppDelegate
   ...
   - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
   {
     // Remove
     // return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
     // and instead add:
     return [[EXDevLauncherController sharedInstance] sourceUrl];
   }
   ...
   @end
   ```

   </details>
   <details>
   <summary>Swift</summary>

   ```swift
   ...
   @UIApplicationMain
   class AppDelegate: UMAppDelegateWrapper {
     ...
     func sourceURL(for bridge: RCTBridge!) -> URL! {
       // Remove
       // return RCTBundleURLProvider.sharedSettings()?.jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
       // and instead add:
        return EXDevLauncherController.sharedInstance()?.sourceUrl()
     }
     ...
   }
   ```

   </details>

    <br>

5. Handle deep links.

   Open your `AppDelegate.{m|swift}` and add the following lines:

   <details>
   <summary>Objective-C</summary>

   ```objc
   ...
   #import <React/RCTLinkingManager.h>
   ...
   @implementation AppDelegate

   - (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
   {
     if ([EXDevLauncherController.sharedInstance onDeepLink:url options:options]) {
      return true;
     }
     return [RCTLinkingManager application:application openURL:url options:options];
   }
   ...
   @end
   ```

   </details>
   <details>
   <summary>Swift</summary>

   ```swift
   ...
   class AppDelegate: UMAppDelegateWrapper {
     ...
     func initializeReactNativeBridge() -> RCTBridge? {
       // change
       // RCTBridge(delegate: self, launchOptions: self.launchOptions)
       // to
       // RCTBridge(delegate: self, launchOptions: EXDevelopmentClientController.sharedInstance()!.getLaunchOptions())
       // the final version looks like this:
       if let bridge = RCTBridge(delegate: self, launchOptions: EXDevelopmentClientController.sharedInstance()!.getLaunchOptions()) {
         ...
       }
     }
     ...
     override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
       if (useDevClient && EXDevLauncherController.sharedInstance()!.onDeepLink(url, options: options)) {
          return true;
        }

        return RCTLinkingManager.application(app, open: url, options: options)
     }
   ...
   }
   ```

   </details>
