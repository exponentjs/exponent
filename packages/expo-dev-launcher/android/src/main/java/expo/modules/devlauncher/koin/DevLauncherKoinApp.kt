package expo.modules.devlauncher.koin

import expo.modules.devlauncher.launcher.DevLauncherIntentRegistry
import expo.modules.devlauncher.launcher.DevLauncherIntentRegistryInterface
import expo.modules.devlauncher.launcher.DevLauncherLifecycle
import expo.modules.devlauncher.launcher.loaders.DevLauncherAppLoaderFactory
import expo.modules.devlauncher.launcher.loaders.DevLauncherAppLoaderFactoryInterface
import expo.modules.devlauncher.tests.DevLauncherDisabledTestInterceptor
import expo.modules.devlauncher.tests.DevLauncherTestInterceptor
import okhttp3.OkHttpClient
import org.koin.core.KoinApplication
import org.koin.dsl.koinApplication
import org.koin.dsl.module

val DevLauncherTestModule = module {
  single<DevLauncherTestInterceptor> { DevLauncherDisabledTestInterceptor() }
}

val DevLauncherBaseModule = module {
  single<DevLauncherIntentRegistryInterface> { DevLauncherIntentRegistry() }
  single { OkHttpClient() }
  single { DevLauncherLifecycle() }
  factory<DevLauncherAppLoaderFactoryInterface> { DevLauncherAppLoaderFactory() }
}

private val koinAppFactory = {
  koinApplication {
    modules(DevLauncherBaseModule, DevLauncherTestModule)
  }
}

object DevLauncherKoinContext {
  private var internalApp: KoinApplication = koinAppFactory()

  fun reinitialize() {
    internalApp.close()
    internalApp = koinAppFactory()
  }

  val app: KoinApplication
    get() = internalApp
}

fun devLauncherKoin() = DevLauncherKoinContext.app.koin
