package com.expo.modules.devclient.selectors

internal object DevLauncherErrorScreenViews {
  val main = TaggedView("DevLauncherErrorScreen")
  val goToLauncher = TaggedView("DevLauncherErrorScreenGoToLauncher")
  val goToDetails = TaggedView("DevLauncherErrorScreenGoToDetails")
  val reload = TaggedView("DevLauncherErrorScreenReload")
  val details = TaggedView("DevLauncherErrorScreenDetails")
}

internal object DevLauncherViews {
  val main = TaggedView("DevLauncherMainScreen")
  val urlInput = TaggedView("DevLauncherURLInput")
  val loadAppButton = TaggedView("DevLauncherLoadAppButton")
  val ErrorScreen = DevLauncherErrorScreenViews
}

internal object DevMenuViews {
  val main = TaggedView("DevMenuMainScreen")
}

internal object BundledAppViews {
  val main = TaggedView("BundledAppMainScreen")
}

internal object Views {
  val DevLauncher = DevLauncherViews
  val DevMenu = DevMenuViews
  val BundledApp = BundledAppViews
}
