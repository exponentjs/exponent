---
title: Extending the Dev Menu
---

import InstallSection from '~/components/plugins/InstallSection';

import ConfigurationDiff from '~/components/plugins/ConfigurationDiff';

One of the main purposes of this package was to provide an easy way to create extensions. We know that developing a React Native app can be painful - often, developers need to create additional tools, which for example, clear the local storage, to test or debug their applications. Some of their work can be integrated with the application itself to save time and make the development more enjoyable.

> **Note:** The tutorial was written using Kotlin and Swift. However, you can also use Java and Objective-C if you want.

## 🤖 Android

1. Create a class which extends the `ReactContextBaseJavaModule` and implements the `DevMenuExtensionInterface`.

   ```kotlin
   // CustomDevMenuExtension.kt
   package com.devmenudemo.customdevmenuextension

   import com.facebook.react.bridge.ReactApplicationContext
   import com.facebook.react.bridge.ReactContextBaseJavaModule
   import expo.interfaces.devmenu.DevMenuExtensionInterface
   import expo.interfaces.devmenu.items.DevMenuItem
   import expo.interfaces.devmenu.items.DevMenuDataSourceInterface
   import expo.interfaces.devmenu.items.DevMenuItemsContainer
   import expo.interfaces.devmenu.items.DevMenuScreen

   class CustomDevMenuExtension(reactContext: ReactApplicationContext)
     : ReactContextBaseJavaModule(reactContext),
       DevMenuExtensionInterface {

     override fun getName() = "CustomDevMenuExtension" // here you can provide name for your extension

     override fun devMenuItems(settings: DevMenuExtensionSettingsInterface) = DevMenuItemsContainer.export {
       // Firstly, create a function which will be called when the user presses the button.
       val clearSharedPreferencesOnPress: () -> Unit = {
         reactApplicationContext
           .getSharedPreferences("your.shared.preferences", MODE_PRIVATE)
           .edit()
           .apply {
             remove("key_to_remove")
             Log.i("CustomDevMenuExt", "Remove key from SharedPreferences")
             apply()
           }
       }

       // Then, create `DevMenuAction` and export it.
       action(
         actionId = "clear_shared_preferences", // This string identifies your custom action. Make sure that it's unique.
         action = clearSharedPreferencesOnPress
       ) {
         label = { "Clear shared preferences" } // This string will be displayed in the dev menu.
         glyphName = { "delete" } // This is a icon name used to present your action. You can use any icon from the `MaterialCommunityIcons`.
         importance = DevMenuItemImportance.HIGH.value // This value tells the dev-menu in which order the actions should be rendered.
         keyCommand = KeyCommand(KeyEvent.KEYCODE_S) // You can associate key commend with your action.
       }
     }

     fun devMenuScreens(settings: DevMenuExtensionSettingsInterface): List<DevMenuScreen>? = null

     fun devMenuDataSources(settings: DevMenuExtensionSettingsInterface): List<DevMenuDataSourceInterface>? = null
   }
   ```

2. Create a react native package class for the extension.

   ```kotlin
   // CustomDevMenuExtensionPackage.kt
   package com.devmenudemo.customdevmenuextension

   import android.view.View
   import com.facebook.react.ReactPackage
   import com.facebook.react.bridge.ReactApplicationContext
   import com.facebook.react.uimanager.ReactShadowNode
   import com.facebook.react.uimanager.ViewManager

   class CustomDevMenuExtensionPackage : ReactPackage {
       override fun createNativeModules(reactContext: ReactApplicationContext) = listOf(
           CustomDevMenuExtension(reactContext) // here you need to export your custom extension
       )

       override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> = listOf()

   }
   ```

3. Go to `MainApplication` (`MainApplication.java` or `MainApplication.kt`) and register created package.

   ```java
   // MainApplication.java

   // You need to import your custom package.
   import com.devmenudemo.customdevmenuextension.CustomDevMenuExtensionPackage; // the package can be different in your case

   ...
   public class MainApplication extends Application implements ReactApplication {
     ...

     @Override
     protected List<ReactPackage> getPackages() {
       List<ReactPackage> packages = new PackageList(this).getPackages();

       // Add this line.
       packages.add(new CustomDevMenuExtensionPackage());

       return packages;
     }
   }
   ```

## 🍏 iOS

1. Create a Swift class which implements `DevMenuExtensionProtocol` for your extension.

   ```swift
   // CustomDevMenuExtension.swift
   import EXDevMenuInterface

   @objc(CustomDevMenuExtension)
   open class CustomDevMenuExtension: NSObject, RCTBridgeModule, DevMenuExtensionProtocol {
     public static func moduleName() -> String! {
       return "CustomDevMenuExtension" // here you can provide name for your extension
     }

     @objc
     open func devMenuItems(_ settings: DevMenuExtensionSettingsProtocol) -> DevMenuItemsContainerProtocol? {
       // Firstly, create a function which will be called when the user presses the button.
       let clearNSUserDefaultsOnPress = {
         let prefs = UserDefaults.standard
         prefs.removeObject(forKey: "key_to_remove")
       }

       // Then we need to create a container that will contain all our custom features
       let container = DevMenuItemsContainer()

       let clearNSUserDefaults = DevMenuAction(
         withId: "clear_nsusersdefaults", // This string identifies your custom action. Make sure that it's unique.
         action: clearNSUserDefaultsOnPress
       )

       clearNSUserDefaults.label = { "Clear NSUserDefaults" } // This string will be displayed in the dev menu.
       clearNSUserDefaults.glyphName = { "delete" } // This is a icon name used to present your action. You can use any icon from the `MaterialCommunityIcons`.
       clearNSUserDefaults.importance = DevMenuItem.ImportanceHigh // This value tells the dev-menu in which order the actions should be rendered.
       clearNSUserDefaults.registerKeyCommand(input: "p", modifiers: .command) // You can associate key commend with your action.

       // Register created object. Note: you can register multiple actions if you want.
       container.addItem(clearNSUserDefaults)

       // Return container
       return container
     }
   }
   ```

   > **Note:** if you don't use Swift in your project earlier, you need to create bridging header. For more information, checks [importing objective-c into swift](https://developer.apple.com/documentation/swift/imported_c_and_objective-c_apis/importing_objective-c_into_swift).

2. Create a `.m` file to integrate Swift class with react native and add the following lines.

   ```objc
   // CustomDevMenuExtension.m

   #import <React/RCTBridgeModule.h>

   @interface RCT_EXTERN_REMAP_MODULE(CustomDevMenuExtensionObjc, CustomDevMenuExtension, NSObject)
   @end
   ```

3. Add the following line into the bridging header.

   ```objc
   #import <React/RCTBridgeModule.h>
   ```

After all those steps you should see something like this:

<img src="/static/images/client/custom_dev_menu_extension_example.png" style={{maxWidth: "100%" }}/>
