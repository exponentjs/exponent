# 📦 expo-dev-menu

Expo/React Native module with the developer menu.

# ⚙️ Installation

Firstly, you need to add the `expo-dev-menu` package to your project.

<details>
<summary>yarn</summary>

```bash
yarn add expo-dev-menu
```

</details>

<details>
<summary>npm</summary>

```bash
npm install expo-dev-menu
```

</details>

Then you can start to configure the native projects using steps below.

## 🤖 Android

1.  Set up the `DevMenuManager` in the native code.

    You can do it in two ways. We recommend using the basic initialization. However, if you have the custom activity in your application, then the advanced one will be more suitable for you.

    - **Basic**

      Open the `MainActivity.java` or `MainActivity.kt` and make sure that your main activity class extends the `DevMenuAwareReactActivity`.

        <details>
        <summary>Java</summary>

      ```java
      ...
      // You need to import the `DevMenuAwareReactActivity` class
      import expo.modules.devmenu.react.DevMenuAwareReactActivity;
      ...

      // Make sure that the `MainActivity` extends the `DevMenuAwareReactActivity` class not the `ReactActivity`
      public class MainActivity extends DevMenuAwareReactActivity {
        ...
      }
      ```

        </details>
        <details>
        <summary>Kotlin</summary>

      ```kotlin
      ...
      // You need to import the `DevMenuAwareReactActivity` class
      import expo.modules.devmenu.react.DevMenuAwareReactActivity;
      ...

      // Make sure that the `MainActivity` extends the `DevMenuAwareReactActivity` class not the `ReactActivity`
      class MainActivity : DevMenuAwareReactActivity() {
        ...
      }
      ```

      </details>

      <br/>

    - **Advanced**


      I. Open the file with the main activity of your application (`MainActivity.java` or `MainActivity.kt`) and add methods that will communicate with the `DevMenuManager`.

      <details>
      <summary>Java</summary>

      ```java
      ...
      // Add those imports.
      import android.view.KeyEvent;
      import android.view.MotionEvent;

      import expo.modules.devmenu.DevMenuManager;
      ...

      public class MainActivity extends ReactActivity {
        ...
        // A function which sends the touch events to the dev menu.
        @Override
        public boolean dispatchTouchEvent(MotionEvent ev) {
          DevMenuManager.INSTANCE.onTouchEvent(ev);
          return super.dispatchTouchEvent(ev);
        }

        // A function which handles the key commands.
        @Override
        public boolean onKeyUp(int keyCode, KeyEvent event) {
          return DevMenuManager.INSTANCE.onKeyEvent(keyCode, event) || super.onKeyUp(keyCode, event);
        }
      }
      ```

      </details>

      <details>
      <summary>Kotlin</summary>

      ```kotlin
      ...
      // Add those imports.
      import android.view.KeyEvent;
      import android.view.MotionEvent;

      import expo.modules.devmenu.DevMenuManager;
      ...

      class MainActivity : ReactActivity() {
        ...
        // A function which sends the touch events to the dev menu.
        override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
          DevMenuManager.onTouchEvent(ev)
          return super.dispatchTouchEvent(ev)
        }

        // A function which handles the key commands.
        override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
          return DevMenuManager.onKeyEvent(keyCode, event) || super.onKeyUp(keyCode, event)
        }
      }
      ```

      </details>


      <br/>

      II. Open the `MainApplication` class (`MainApplication.java` or `MainApplication.kt`) and in `onCreate` method initialize `DevMenuManager`.

      <details>
      <summary>Java</summary>

      ```java
      ...
      public class MainApplication extends Application implements ReactApplication {
        ...
        @Override
        public void onCreate() {
          ...
          DevMenuManager.INSTANCE.initializeWithReactNativeHost(getReactNativeHost());
        }
      }
      ```

      </details>


      <details>
      <summary>Kotlin</summary>

      ```kotlin
      ...
      public class MainApplication : Application(), ReactApplication {
        ...
        override fun onCreate() {
          ...
          DevMenuManager.initializeWithReactNativeHost(reactNativeHost);
        }
      }
      ```

      </details>

## 🍏 iOS

1. Add `expo-dev-menu` to your Podfile.


      ```ruby
      ...
      target '<your app>' do
        ...
        pod 'EXDevMenu', path: '../node_modules/expo-dev-menu', :configurations => :debug
        ...
      end
      ```

2. Run `pod install` in `ios` directory.
3. Open file with your `AppDelegate` (`AppDelegate.m` or `AppDelegate.swift`) and pass bridge to the `DevMenuManager`.

   > ⚠️ You should skip this step if you're using `expo-dev-launcher` too.

      <details>
      <summary>Objective-C</summary>

   ```objc
   ...
   // Firstly, you need to import EXDevMenu package.
   #if defined(EX_DEV_MENU_ENABLED)
   @import EXDevMenu;
   #endif
   ...

   @implementation AppDelegate
   ...
   - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
   {
     ...
     RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
     RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                      moduleName:@"devMenuDemo"
                                               initialProperties:nil];
     // Add those lines only if you aren't using the dev-launcher.
     #if defined(EX_DEV_MENU_ENABLED)
     [DevMenuManager configureWithBridge:bridge];
     #endif
   }
   @end
   ```

      </details>

      <details>
      <summary>Swift</summary>

   ```swift
   ...
   // Firstly, you need to import EXDevMenu package.
   #if EX_DEV_MENU_ENABLED
   @import EXDevMenu
   #endif
   ...

   @UIApplicationMain
   class AppDelegate: UMAppDelegateWrapper {
     override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       ...

       if let bridge = RCTBridge(delegate: self, launchOptions: launchOptions) {
         ...
         // Add those lines.
         #if EX_DEV_MENU_ENABLED
         DevMenuManager.configure(withBridge: bridge)
         #endif
       }

       ...
     }
   }
   ```

      </details>

# 📂 Accessing the Developer Menu

You can access the developer menu by shaking your device, making a three-finger long-press gesture, or by selecting "Shake Gesture" inside the Hardware menu in the iOS simulator. You can also use keyboard shortcuts - `⌘D` on iOS, or `⌘M` on Android when you're using Mac OS and `Ctrl+M` on Windows and Linux. Alternatively for Android, you can run the command `adb shell input keyevent 82` to open the dev menu (`82` being the Menu key code).

> **Note:** if you're using the iOS simulator and keyboard shortcuts don't work, make sure you've selected `Send Keyboard Input to Device` inside the `I/O` menu in the Simulator.

# 💪 Extending the dev-menu's functionalities

One of the main purposes of this package was to provide an easy way to create extensions. We know that developing a React Native app can be painful - often, developers need to create additional tools, which for example, clear the local storage, to test or debug their applications. Some of their work can be integrated with the application itself to save time and make the development more enjoyable.

You can find instructions that will show you how to create simple extension that removes a key from the `NSUserDefaults`/`SharedPreferences` [here](https://docs.expo.io/clients/extending-the-dev-menu/).

# 📚 API

```js
import * as DevMenu from 'expo-dev-menu';
```

For now, the `DevMenu` module exports only one method - [`openMenu`](#openmenu).

### openMenu()

Opens the dev menu.

#### Example

Using this method you can open the dev menu from your JS code whenever you want. It does nothing when the dev menu is not available (i.e. in release mode).

Below you can find an example of opening the dev menu on button press:

```js
import * as DevMenu from 'expo-dev-menu';
import { Button } from 'react-native';

export const DevMenuButton = () => (
  <Button
    onPress={() => {
      DevMenu.openMenu();
    }}
    title="Press to open the dev menu 🚀"
    color="#841584"
  />
);
```

# 👏 Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).
