package com.expo.modules.devclient.tests

import android.content.Intent
import android.net.Uri
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import com.expo.modules.devclient.idlingresource.waitUntilViewIsDisplayed
import com.expo.modules.devclient.koin.DevLauncherKoinTest
import com.expo.modules.devclient.koin.declareInDevLauncherScope
import com.expo.modules.devclient.scenarios.DevLauncherBasicScenario
import expo.modules.devlauncher.launcher.DevLauncherIntentRegistryInterface
import expo.modules.devlauncher.launcher.DevLauncherPendingIntentListener
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
internal class DevClientDeepLinkTest: DevLauncherKoinTest() {
  @Test
  fun checks_if_pending_deep_link_is_displayed() = DevLauncherBasicScenario(koinDeclaration = {
    val intentRegistry: DevLauncherIntentRegistryInterface = object : DevLauncherIntentRegistryInterface {
      override var intent: Intent? = null

      override fun subscribe(listener: DevLauncherPendingIntentListener) = Unit
      override fun unsubscribe(listener: DevLauncherPendingIntentListener) = Unit

      override fun consumePendingIntent(): Intent? = intent
    }

    intentRegistry.intent = Intent().apply {
      data = Uri.parse("http://localhost:9876")
    }
    @Suppress("RemoveExplicitTypeArguments")
    declareInDevLauncherScope<DevLauncherIntentRegistryInterface> {
      intentRegistry
    }
  }).setUpAndLaunch {
    onView(withText("http://localhost:9876")).check(matches(isDisplayed()))
  }

  @Test
  fun checks_if_UI_updates_on_new_deep_link() = DevLauncherBasicScenario().setUpAndLaunch {
    val intentRegistry = it.koin().get<DevLauncherIntentRegistryInterface>()
    intentRegistry.intent = Intent().apply { data = Uri.parse("http://localhost:1234") }
    waitUntilViewIsDisplayed(
      withText("http://localhost:1234")
    )
  }
}
