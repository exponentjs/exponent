package expo.modules.devlauncher

import android.app.Application
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.annotation.UiThread
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactContext
import expo.interfaces.devmenu.DevMenuManagerInterface
import expo.interfaces.devmenu.DevMenuManagerProviderInterface
import expo.modules.devlauncher.helpers.getAppUrlFromDevLauncherUrl
import expo.modules.devlauncher.helpers.getFieldInClassHierarchy
import expo.modules.devlauncher.helpers.isDevLauncherUrl
import expo.modules.devlauncher.helpers.runBlockingOnMainThread
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.koin.DevLauncherKoinContext
import expo.modules.devlauncher.koin.devLauncherKoin
import expo.modules.devlauncher.koin.optInject
import expo.modules.devlauncher.launcher.DevLauncherActivity
import expo.modules.devlauncher.launcher.DevLauncherClientHost
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.DevLauncherIntentRegistryInterface
import expo.modules.devlauncher.launcher.DevLauncherLifecycle
import expo.modules.devlauncher.launcher.DevLauncherReactActivityDelegateSupplier
import expo.modules.devlauncher.launcher.DevLauncherRecentlyOpenedAppsRegistry
import expo.modules.devlauncher.launcher.loaders.DevLauncherAppLoaderFactoryInterface
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifest
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifestParser
import expo.modules.devlauncher.launcher.menu.DevLauncherMenuDelegate
import expo.modules.devlauncher.react.activitydelegates.DevLauncherReactActivityNOPDelegate
import expo.modules.devlauncher.react.activitydelegates.DevLauncherReactActivityRedirectDelegate
import expo.modules.devlauncher.tests.DevLauncherTestInterceptor
import expo.modules.updatesinterface.UpdatesInterface
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import org.koin.core.component.get
import org.koin.core.component.inject
import org.koin.dsl.module

// Use this to load from a development server for the development client launcher UI
//  private final String DEV_LAUNCHER_HOST = "10.0.0.175:8090";
private val DEV_LAUNCHER_HOST: String? = null

private const val NEW_ACTIVITY_FLAGS = Intent.FLAG_ACTIVITY_NEW_TASK or
  Intent.FLAG_ACTIVITY_CLEAR_TASK or
  Intent.FLAG_ACTIVITY_NO_ANIMATION

private var MenuDelegateWasInitialized = false

class DevLauncherController private constructor()
  : DevLauncherKoinComponent, DevLauncherControllerInterface {
  private val context: Context by lazy {
    DevLauncherKoinContext.app.koin.get()
  }
  override val appHost: ReactNativeHost by inject()
  private val httpClient: OkHttpClient by inject()
  private val lifecycle: DevLauncherLifecycle by inject()
  private val pendingIntentRegistry: DevLauncherIntentRegistryInterface by inject()
  val internalUpdatesInterface: UpdatesInterface? by optInject()
  private var devMenuManager: DevMenuManagerInterface? = null
  var updatesInterface: UpdatesInterface?
    get() = internalUpdatesInterface
    set(value) = DevLauncherKoinContext.app.koin.loadModules(listOf(module {
      single { value }
    }))

  override val devClientHost = DevLauncherClientHost((context as Application), DEV_LAUNCHER_HOST)

  private val recentlyOpedAppsRegistry = DevLauncherRecentlyOpenedAppsRegistry(context)
  override var manifest: DevLauncherManifest? = null
    private set
  override var latestLoadedApp: Uri? = null
  var useDeveloperSupport = true

  enum class Mode {
    LAUNCHER, APP
  }

  override var mode = Mode.LAUNCHER

  private var appIsLoading = false

  override suspend fun loadApp(url: Uri, mainActivity: ReactActivity?) {
    synchronized(this) {
      if (appIsLoading) {
        return
      }
      appIsLoading = true
    }

    try {
      ensureHostWasCleared(appHost, activityToBeInvalidated = mainActivity)

      val manifestParser = DevLauncherManifestParser(httpClient, url)
      val appIntent = createAppIntent()

      internalUpdatesInterface?.reset()

      val appLoaderFactory = get<DevLauncherAppLoaderFactoryInterface>()
      val appLoader = appLoaderFactory.createAppLoader(url, manifestParser)
      useDeveloperSupport = appLoaderFactory.shouldUseDeveloperSupport()
      manifest = appLoaderFactory.getManifest()

      val appLoaderListener = appLoader.createOnDelegateWillBeCreatedListener()
      lifecycle.addListener(appLoaderListener)
      mode = Mode.APP

      // Note that `launch` method is a suspend one. So the execution will be stopped here until the method doesn't finish.
      if (appLoader.launch(appIntent)) {
        recentlyOpedAppsRegistry.appWasOpened(url, appLoader.getAppName())
        latestLoadedApp = url
        // Here the app will be loaded - we can remove listener here.
        lifecycle.removeListener(appLoaderListener)
      } else {
        // The app couldn't be loaded. For now, we just return to the launcher.
        mode = Mode.LAUNCHER
        manifest = null
      }
    } catch (e: Exception) {
      synchronized(this) {
        appIsLoading = false
      }
      throw e
    }
  }

  override fun onAppLoaded(context: ReactContext) {
    // App can be started from deep link.
    // That's why, we maybe need to initialized dev menu here.
    maybeInitDevMenuDelegate(context)
    synchronized(this) {
      appIsLoading = false
    }
  }

  override fun onAppLoadedWithError() {
    synchronized(this) {
      appIsLoading = false
    }
  }

  override fun getRecentlyOpenedApps(): Map<String, String?> = recentlyOpedAppsRegistry.getRecentlyOpenedApps()

  override fun navigateToLauncher() {
    ensureHostWasCleared(appHost)
    synchronized(this) {
      appIsLoading = false
    }

    mode = Mode.LAUNCHER
    manifest = null
    context.applicationContext.startActivity(createLauncherIntent())
  }

  override fun handleIntent(intent: Intent?, activityToBeInvalidated: ReactActivity?): Boolean {
    intent
      ?.data
      ?.let { uri ->
        if (!isDevLauncherUrl(uri)) {
          return handleExternalIntent(intent)
        }

        val appUrl = getAppUrlFromDevLauncherUrl(uri)
        if (appUrl == null) {
          navigateToLauncher()
          return true
        }

        GlobalScope.launch {
          loadApp(appUrl, activityToBeInvalidated)
        }
        return true
      }
    return false
  }

  private fun handleExternalIntent(intent: Intent): Boolean {
    if (mode == Mode.APP) {
      return false
    }

    pendingIntentRegistry.intent = intent
    return true
  }

  private fun ensureHostWasCleared(host: ReactNativeHost, activityToBeInvalidated: ReactActivity? = null) {
    if (host.hasInstance()) {
      runBlockingOnMainThread {
        clearHost(host, activityToBeInvalidated)
      }
    }
  }

  override fun maybeSynchronizeDevMenuDelegate() {
    val devMenuManager = this.devMenuManager
    if (MenuDelegateWasInitialized && devMenuManager != null) {
      devMenuManager.synchronizeDelegate()
    }
  }

  override fun maybeInitDevMenuDelegate(context: ReactContext) {
    if (MenuDelegateWasInitialized) {
      return
    }
    MenuDelegateWasInitialized = true

    val devMenuManagerProvider = context
      .catalystInstance
      .nativeModules
      .find { nativeModule ->
        nativeModule is DevMenuManagerProviderInterface
      } as? DevMenuManagerProviderInterface

    val devMenuManager = devMenuManagerProvider?.getDevMenuManager() ?: return
    devMenuManager.setDelegate(DevLauncherMenuDelegate(instance))
    this.devMenuManager = devMenuManager
  }

  @UiThread
  private fun clearHost(host: ReactNativeHost, activityToBeInvalidated: ReactActivity?) {
    host.clear()
    activityToBeInvalidated?.let {
      invalidateActivity(it)
    }
  }

  override fun getCurrentReactActivityDelegate(activity: ReactActivity, delegateSupplierDevLauncher: DevLauncherReactActivityDelegateSupplier): ReactActivityDelegate {
    return if (mode == Mode.LAUNCHER) {
      DevLauncherReactActivityRedirectDelegate(activity, this::redirectFromStartActivity)
    } else {
      delegateSupplierDevLauncher.get()
    }
  }

  private fun redirectFromStartActivity(intent: Intent?) {
    if (!handleIntent(intent, null)) {
      navigateToLauncher()
    }
  }

  /**
   * If we try to launch a different app when the `MainActivity` is active, the app will crash
   * (NPE caused by missing activity reference in the [ReactActivityDelegate]).
   * To prevent such behavior, we need to invalidate active activity. To do it we switch
   * the inner [ReactActivityDelegate] to be a NOP object.
   */
  private fun invalidateActivity(activity: ReactActivity) {
    val field = activity::class.java.getFieldInClassHierarchy("mDelegate")
    requireNotNull(field) { "Cannot find mDelegate field in activity." }
    field.isAccessible = true
    field.set(activity, DevLauncherReactActivityNOPDelegate(activity))
  }

  private fun createLauncherIntent() =
    Intent(context, DevLauncherActivity::class.java)
      .apply { addFlags(NEW_ACTIVITY_FLAGS) }

  private fun createAppIntent() =
    createBasicAppIntent().apply {
      pendingIntentRegistry
        .consumePendingIntent()
        ?.let { intent ->
          action = intent.action
          data = intent.data
          intent.extras?.let {
            putExtras(it)
          }
          intent.categories?.let {
            categories.addAll(it)
          }
        }
    }

  private fun createBasicAppIntent() =
    if (sLauncherClass == null) {
      checkNotNull(
        context
          .packageManager
          .getLaunchIntentForPackage(context.packageName)
      ) { "Couldn't find the launcher class." }
    } else {
      Intent(context, sLauncherClass!!)
    }.apply { addFlags(NEW_ACTIVITY_FLAGS) }

  companion object {
    private var sLauncherClass: Class<*>? = null
    internal var sAdditionalPackages: List<ReactPackage>? = null

    @JvmStatic
    fun wasInitialized() =
      DevLauncherKoinContext.app.koin.getOrNull<DevLauncherControllerInterface>() != null

    @JvmStatic
    val instance: DevLauncherControllerInterface
      get() = checkNotNull(
        DevLauncherKoinContext.app.koin.getOrNull()
      ) {
        "DevelopmentClientController.getInstance() was called before the module was initialized"
      }

    @JvmStatic
    fun initialize(context: Context, appHost: ReactNativeHost) {
      val testInterceptor = DevLauncherKoinContext.app.koin.get<DevLauncherTestInterceptor>()
      if (!testInterceptor.allowReinitialization()) {
        check(wasInitialized()) { "DevelopmentClientController was initialized." }
      }

      MenuDelegateWasInitialized = false
      DevLauncherKoinContext.app.koin.loadModules(listOf(
        module {
          single { context }
          single { appHost }
        }
      ), allowOverride = true)
      DevLauncherKoinContext.app.koin.declare<DevLauncherControllerInterface>(DevLauncherController())
    }

    @JvmStatic
    fun initialize(context: Context, appHost: ReactNativeHost, additionalPackages: List<ReactPackage>? = null, launcherClass: Class<*>? = null) {
      initialize(context, appHost)
      sAdditionalPackages = additionalPackages
      sLauncherClass = launcherClass
    }

    @JvmStatic
    fun wrapReactActivityDelegate(activity: ReactActivity, devLauncherReactActivityDelegateSupplier: DevLauncherReactActivityDelegateSupplier): ReactActivityDelegate {
      devLauncherKoin()
        .get<DevLauncherLifecycle>()
        .delegateWillBeCreated(activity)

      return devLauncherKoin()
        .get<DevLauncherControllerInterface>()
        .getCurrentReactActivityDelegate(activity, devLauncherReactActivityDelegateSupplier)
    }

    @JvmStatic
    fun tryToHandleIntent(activity: ReactActivity, intent: Intent): Boolean {
      return devLauncherKoin()
        .get<DevLauncherControllerInterface>()
        .handleIntent(intent, activityToBeInvalidated = activity)
    }
  }
}
