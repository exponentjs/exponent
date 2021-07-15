package expo.modules.devlauncher.tests

class DevLauncherDisabledTestInterceptor : DevLauncherTestInterceptor {
  override fun allowReinitialization() = false
}
