package expo.modules.devlauncher.koin

import org.koin.core.Koin
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.koin.core.parameter.ParametersDefinition
import org.koin.core.qualifier.Qualifier
import org.koin.mp.KoinPlatformTools

interface DevLauncherKoinComponent : KoinComponent {
  override fun getKoin(): Koin = devLauncherKoin()
}

inline fun <reified T : Any> DevLauncherKoinComponent.optInject(
  qualifier: Qualifier? = null,
  mode: LazyThreadSafetyMode = KoinPlatformTools.defaultLazyMode(),
  noinline parameters: ParametersDefinition? = null
): Lazy<T?> =
  lazy(mode) {
    try {
      get(qualifier, parameters)
    } catch (e: Exception) {
      return@lazy null
    }
  }
