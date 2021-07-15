package com.expo.modules.devclient.koin

import expo.modules.devlauncher.koin.DevLauncherKoinContext
import org.koin.core.Koin
import org.koin.core.qualifier.Qualifier
import org.koin.test.KoinTest
import org.koin.test.get

internal inline fun <reified T : Any> DevLauncherKoinTest.declareInDevLauncherScope(
  qualifier: Qualifier? = null,
  noinline instance: () -> T
): T {
  val koin = getKoin()
  koin.declare(instance(), qualifier, allowOverride = true)
  return get(qualifier)
}

internal open class DevLauncherKoinTest : KoinTest {
  override fun getKoin(): Koin = DevLauncherKoinContext.app.koin
}
