package com.expo.modules.devclient.tests

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import androidx.test.core.app.launchActivity
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import com.expo.modules.devclient.activities.DevClientBundledAppActivity
import com.expo.modules.devclient.activities.reactNativeHostHolder
import com.expo.modules.devclient.devmenu.DevClientTestExtension
import com.expo.modules.devclient.koin.DevLauncherKoinTest
import com.expo.modules.devclient.koin.declareInDevLauncherScope
import com.expo.modules.devclient.scenarios.DevLauncherBasicScenario
import com.expo.modules.devclient.scenarios.KoinDeclaration
import com.expo.modules.devclient.scenarios.ReactNativeHostCreator
import com.expo.modules.devclient.selectors.Views
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.shell.MainReactPackage
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.google.common.truth.Truth
import expo.modules.devlauncher.DevLauncherPackage
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.DevLauncherIntentRegistryInterface
import expo.modules.devlauncher.launcher.errors.DevLauncherAppError
import expo.modules.devlauncher.launcher.errors.DevLauncherErrorActivity
import expo.modules.devlauncher.launcher.loaders.DevLauncherAppLoader
import expo.modules.devlauncher.launcher.loaders.DevLauncherAppLoaderFactoryInterface
import expo.modules.devlauncher.launcher.loaders.DevLauncherPublishedAppLoader
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifest
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifestParser
import expo.modules.devmenu.DevMenuManager
import expo.modules.devmenu.DevMenuPackage
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.runner.RunWith
import org.koin.test.inject
import java.io.File
import java.io.IOException
import java.io.StringReader

private val manifest = """
      {"name":"Bundled App","description":"This demonstrates a bunch of the native components that you can use in React Native core and Expo.","slug":"native-component-list","sdkVersion":"UNVERSIONED","version":"41.0.0","githubUrl":"https://github.com/expo/native-component-list","orientation":"default","primaryColor":"#cccccc","privacy":"public","icon":"./assets/icons/icon.png","scheme":"ncl","notification":{"icon":"./assets/icons/notificationIcon.png","color":"#000000","iosDisplayInForeground":true,"iconUrl":"http://127.0.0.1:19000/assets/./assets/icons/notificationIcon.png"},"splash":{"image":"./assets/icons/loadingIcon.png","imageUrl":"http://127.0.0.1:19000/assets/./assets/icons/loadingIcon.png"},"developmentClient":{"silentLaunch":true},"platforms":["android","ios","web"],"facebookScheme":"fb629712900716487","facebookAppId":"629712900716487","facebookDisplayName":"Expo APIs","facebookAutoLogAppEventsEnabled":true,"facebookAdvertiserIDCollectionEnabled":true,"androidStatusBar":{"backgroundColor":"#4630eb"},"android":{"package":"host.exp.nclexp","versionCode":11,"googleServicesFile":"{\n  \"project_info\": {\n    \"project_number\": \"535516533800\",\n    \"firebase_url\": \"https://native-component-list-ac497.firebaseio.com\",\n    \"project_id\": \"native-component-list-ac497\",\n    \"storage_bucket\": \"native-component-list-ac497.appspot.com\"\n  },\n  \"client\": [\n    {\n      \"client_info\": {\n        \"mobilesdk_app_id\": \"1:535516533800:android:c41d3c676c51294b\",\n        \"android_client_info\": {\n          \"package_name\": \"host.exp.nclexp\"\n        }\n      },\n      \"oauth_client\": [\n        {\n          \"client_id\": \"535516533800-njp69pbcts74n2uuu5tm1srv4r6bgh7o.apps.googleusercontent.com\",\n          \"client_type\": 3\n        }\n      ],\n      \"api_key\": [\n        {\n          \"current_key\": \"AIzaSyDIbiyFGA53t7CKaYSLrBaA7St79d-aoO0\"\n        }\n      ],\n      \"services\": {\n        \"analytics_service\": {\n          \"status\": 1\n        },\n        \"appinvite_service\": {\n          \"status\": 1,\n          \"other_platform_oauth_client\": []\n        },\n        \"ads_service\": {\n          \"status\": 2\n        }\n      }\n    }\n  ],\n  \"configuration_version\": \"1\"\n}\n","playStoreUrl":"https://play.google.com/store/apps/details?id=host.exp.exponent","config":{"googleSignIn":{"apiKey":"AIzaSyC2kse8d0rFfi27jff5nD14cSNcPBQC4Tk","certificateHash":"1746BECB2497593B3296903145793BC0BE8C426B"},"googleMaps":{"apiKey":"AIzaSyC2kse8d0rFfi27jff5nD14cSNcPBQC4Tk"},"branch":{"apiKey":"key_live_pcxsCTBguAUqQBd8CjYZ7ogkurnZcQAO"},"googleMobileAdsAppId":"ca-app-pub-3940256099942544~3347511713"}},"ios":{"bundleIdentifier":"host.exp.nclexp","appStoreUrl":"https://itunes.apple.com/us/app/expo-client/id982107779?mt=8","userInterfaceStyle":"light","usesAppleSignIn":true,"usesIcloudStorage":true,"googleServicesFile":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VOIiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4wLmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+Q0xJRU5UX0lEPC9rZXk+Cgk8c3RyaW5nPjEwMjY3NjMyNjU0MTUtNDBkMzkwZnBhYWExMjFrbGoxdTY3cHM5cnI1NWVyYTAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb208L3N0cmluZz4KCTxrZXk+UkVWRVJTRURfQ0xJRU5UX0lEPC9rZXk+Cgk8c3RyaW5nPmNvbS5nb29nbGV1c2VyY29udGVudC5hcHBzLjEwMjY3NjMyNjU0MTUtNDBkMzkwZnBhYWExMjFrbGoxdTY3cHM5cnI1NWVyYTA8L3N0cmluZz4KCTxrZXk+QVBJX0tFWTwva2V5PgoJPHN0cmluZz5BSXphU3lCZ0g5bW85UjhXR040dGN1ZjdNM0haSFZqNDR6U0R2czQ8L3N0cmluZz4KCTxrZXk+R0NNX1NFTkRFUl9JRDwva2V5PgoJPHN0cmluZz4xMDI2NzYzMjY1NDE1PC9zdHJpbmc+Cgk8a2V5PlBMSVNUX1ZFUlNJT048L2tleT4KCTxzdHJpbmc+MTwvc3RyaW5nPgoJPGtleT5CVU5ETEVfSUQ8L2tleT4KCTxzdHJpbmc+aG9zdC5leHAubmNsZXhwPC9zdHJpbmc+Cgk8a2V5PlBST0pFQ1RfSUQ8L2tleT4KCTxzdHJpbmc+dGVzdC1zdWl0ZS1lY2QyMDwvc3RyaW5nPgoJPGtleT5TVE9SQUdFX0JVQ0tFVDwva2V5PgoJPHN0cmluZz50ZXN0LXN1aXRlLWVjZDIwLmFwcHNwb3QuY29tPC9zdHJpbmc+Cgk8a2V5PklTX0FEU19FTkFCTEVEPC9rZXk+Cgk8ZmFsc2U+PC9mYWxzZT4KCTxrZXk+SVNfQU5BTFlUSUNTX0VOQUJMRUQ8L2tleT4KCTxmYWxzZT48L2ZhbHNlPgoJPGtleT5JU19BUFBJTlZJVEVfRU5BQkxFRDwva2V5PgoJPHRydWU+PC90cnVlPgoJPGtleT5JU19HQ01fRU5BQkxFRDwva2V5PgoJPHRydWU+PC90cnVlPgoJPGtleT5JU19TSUdOSU5fRU5BQkxFRDwva2V5PgoJPHRydWU+PC90cnVlPgoJPGtleT5HT09HTEVfQVBQX0lEPC9rZXk+Cgk8c3RyaW5nPjE6MTAyNjc2MzI2NTQxNTppb3M6MDQ2MjNiN2I1NzMzM2Q4ZGU4YWYyMjwvc3RyaW5nPgoJPGtleT5EQVRBQkFTRV9VUkw8L2tleT4KCTxzdHJpbmc+aHR0cHM6Ly90ZXN0LXN1aXRlLWVjZDIwLmZpcmViYXNlaW8uY29tPC9zdHJpbmc+CjwvZGljdD4KPC9wbGlzdD4=","config":{"usesNonExemptEncryption":false,"googleSignIn":{"reservedClientId":"com.googleusercontent.apps.603386649315-1b2o2gole94qc6h4prj6lvoiueq83se4"},"branch":{"apiKey":"key_live_pcxsCTBguAUqQBd8CjYZ7ogkurnZcQAO"},"googleMobileAdsAppId":"ca-app-pub-3940256099942544~1458002511"},"scheme":["ncl-payments"]},"web":{"build":{"babel":{"root":"./","include":["test-suite","native-component-list","bare-expo"]}}},"assetBundlePatterns":["assets/**","node_modules/react-navigation/src/**/*.png","node_modules/@expo/vector-icons/fonts/*.ttf"],"_internal":{"isDebug":false,"projectRoot":"/Users/lukasz/work/expo/apps/native-component-list","dynamicConfigPath":"/Users/lukasz/work/expo/apps/native-component-list/app.config.js","staticConfigPath":"/Users/lukasz/work/expo/apps/native-component-list/app.json","packageJsonPath":"/Users/lukasz/work/expo/apps/native-component-list/package.json","pluginHistory":{"expo-payments-stripe":{"name":"expo-payments-stripe","version":"9.2.3"},"expo-document-picker":{"name":"expo-document-picker","version":"9.1.2"}}},"plugins":["./plugins/withNotFoundModule","./plugins/withDevMenu","./plugins/withExpoAsyncStorage",["./plugins/withPodfileMinVersion","11.0"],"unimodules-test-core",["./plugins/withGradleProperties",{"org.gradle.jvmargs":"-Xmx3g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8"}],["./plugins/withSettingsImport",{"packageName":"unimodules-test-core","packagePath":"../../../packages/unimodules-test-core/android"}],["expo-payments-stripe",{"scheme":"ncl-payments","merchantId":"merchant.com.example.development"}],["expo-document-picker",{"appleTeamId":"XXXXXX"}]],"xde":true,"developer":{"tool":"expo-cli","projectRoot":"/Users/lukasz/work/expo/apps/native-component-list"},"packagerOpts":{"scheme":null,"hostType":"lan","lanType":"ip","devClient":false,"dev":true,"minify":false,"urlRandomness":"ju-kge","https":false},"mainModuleName":"__generated__/AppEntry","bundleUrl":"http://127.0.0.1:19000/__generated__/AppEntry.bundle?platform=ios&dev=true&hot=false&minify=false","debuggerHost":"127.0.0.1:19000","logUrl":"http://127.0.0.1:19000/logs","hostUri":"127.0.0.1:19000","iconUrl":"http://127.0.0.1:19000/assets/./assets/icons/icon.png"}
    """.trimIndent()

private const val appURL = "http://localhost:1234"

@RunWith(AndroidJUnit4::class)
@LargeTest
internal class DevClientLoadLocalAppTest : DevLauncherKoinTest() {
  private val rnHostCreator: ReactNativeHostCreator = { app ->
    object : ReactNativeHost(app) {
      override fun getUseDeveloperSupport(): Boolean {
        return false
      }

      override fun getPackages(): List<ReactPackage> {
        return listOf(
          MainReactPackage(null),
          DevLauncherPackage(),
          DevMenuPackage(),
          object : ReactPackage {
            override fun createNativeModules(reactContext: ReactApplicationContext) = listOf(DevClientTestExtension(reactContext))
            override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> = emptyList()
          })
      }
    }.also {
      reactNativeHostHolder = it
    }
  }

  private val koinDeclaration: KoinDeclaration = {
    declareInDevLauncherScope<DevLauncherAppLoaderFactoryInterface> {
      object : DevLauncherAppLoaderFactoryInterface, DevLauncherKoinComponent {
        private val context: Context by inject()
        private val appHost: ReactNativeHost by inject()
        private val parsedManifest = StringReader(manifest).use {
          DevLauncherManifest.fromJson(it)
        }
        private val controller: DevLauncherControllerInterface by inject()

        override suspend fun createAppLoader(url: Uri, manifestParser: DevLauncherManifestParser): DevLauncherAppLoader {
          Truth.assertThat(url).isEqualTo(Uri.parse(appURL))
          return DevLauncherPublishedAppLoader(
            parsedManifest,
            getFileFromAssets(context, "bundled_app.bundle").absolutePath,
            appHost,
            context,
            controller
          )
        }

        override fun getManifest(): DevLauncherManifest = parsedManifest

        override fun shouldUseDeveloperSupport(): Boolean = false

        @Throws(IOException::class)
        fun getFileFromAssets(context: Context, fileName: String): File = File(context.cacheDir, fileName)
          .also { file ->
            if (file.exists()) {
              file.delete()
            }

            file.outputStream().use { cache ->
              context.assets.open(fileName).use { inputStream ->
                inputStream.copyTo(cache)
              }
            }
          }
      }
    }
  }

  @Test
  fun checks_if_local_app_can_be_open() = DevLauncherBasicScenario(
    reactNativeHostCreator = rnHostCreator,
    koinDeclaration = koinDeclaration,
    launcherClass = DevClientBundledAppActivity::class.java
  ).setUpAndLaunch {
    runBlocking {
      it.launcherController()
        .loadApp(Uri.parse("http://localhost:1234"))
    }

    Views.BundledApp.main.isDisplayed()

    it.onAppActivity<DevClientBundledAppActivity> { activity ->
      DevMenuManager.openMenu(activity)
    }

    Views.DevMenu.main.isDisplayed()

    onView(withText("TEST_ACTION")).check(matches(isDisplayed())) // contains custom extension
    onView(withText("Profile")).check(matches(isDisplayed()))
    onView(withText("Settings")).check(matches(isDisplayed()))
    onView(withText("Bundled App")).check(matches(isDisplayed()))
  }

  @Test
  fun checks_if_can_return_to_dev_launcher() = DevLauncherBasicScenario(
    reactNativeHostCreator = rnHostCreator,
    koinDeclaration = koinDeclaration,
    launcherClass = DevClientBundledAppActivity::class.java
  ).setUpAndLaunch {
    runBlocking {
      it.launcherController()
        .loadApp(Uri.parse(appURL))
    }

    Views.BundledApp.main.isDisplayed()

    it.onAppActivity<DevClientBundledAppActivity> { activity ->
      DevMenuManager.openMenu(activity)
    }

    Views.DevMenu.main.isDisplayed()
    val menuSession = DevMenuManager.getSession()
    Truth.assertThat(DevMenuManager.getSession()).isNotNull()
    requireNotNull(menuSession)
    Truth.assertThat(menuSession.openScreen).isNull() // main screen
    Truth.assertThat(menuSession.appInfo.getString("appName")).isEqualTo("Bundled App") // main screen

    onView(withText("Back to Launcher")).check(matches(isDisplayed()))
    onView(withText("Back to Launcher")).perform(ViewActions.click())

    Views.DevLauncher.main.isDisplayed()

    Truth.assertThat(
      DevMenuManager.getSession()?.reactInstanceManager?.currentReactContext?.currentActivity
    ).isNull()
  }

  @Test
  fun checks_if_can_load_app_from_UI() = DevLauncherBasicScenario(
    reactNativeHostCreator = rnHostCreator,
    koinDeclaration = koinDeclaration,
    launcherClass = DevClientBundledAppActivity::class.java
  ).setUpAndLaunch {
    Views.DevLauncher.urlInput.perform(
      ViewActions.click(),
      ViewActions.typeText(appURL),
      ViewActions.closeSoftKeyboard()
    )

    // TODO: create something similar to the RNClickAction from https://github.com/wix/Detox/blob/8c0e4b530e7cb326117f4d64cb56f0a1ee2392d6/detox/android/detox/src/full/java/com/wix/detox/espresso/action/RNClickAction.java
    Views.DevLauncher.loadAppButton.perform(
      ViewActions.click(), ViewActions.click()
    )

    Views.BundledApp.main.isDisplayed()
  }

  @Test
  fun checks_if_app_can_be_reloaded_from_blue_screen() = DevLauncherBasicScenario(
    reactNativeHostCreator = rnHostCreator,
    koinDeclaration = koinDeclaration,
    launcherClass = DevClientBundledAppActivity::class.java
  ).setUpAndLaunch {
    runBlocking {
      it.launcherController()
        .loadApp(Uri.parse(appURL))
    }

    Views.BundledApp.main.isDisplayed()

    it.onAppActivity<DevClientBundledAppActivity> { activity ->
      DevLauncherErrorActivity.showError(activity, DevLauncherAppError("TEST_ERROR", Error()))
    }

    Views.DevLauncher.ErrorScreen.main.isDisplayed()
    Views.DevLauncher.ErrorScreen.reload.perform(ViewActions.click())

    Views.BundledApp.main.isDisplayed()
  }

  @Test
  fun checks_if_app_can_be_loaded_from_deep_link() = DevLauncherBasicScenario(
    reactNativeHostCreator = rnHostCreator,
    koinDeclaration = koinDeclaration,
    launcherClass = DevClientBundledAppActivity::class.java
  ).setUpAndLaunch {
    it.onLauncherActivity { launcherActivity ->
      it.launcherController().handleIntent(Intent().apply {
        data = Uri.parse("https://expo-development-client?url=$appURL")
      }, activityToBeInvalidated = launcherActivity)
    }

    Views.BundledApp.main.isDisplayed()
  }
}
