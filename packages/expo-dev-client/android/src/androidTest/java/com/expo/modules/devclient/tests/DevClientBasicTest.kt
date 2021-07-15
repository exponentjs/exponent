package com.expo.modules.devclient.tests

import android.view.KeyEvent
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions
import androidx.test.espresso.action.ViewActions.pressKey
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isRoot
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import com.expo.modules.devclient.koin.DevLauncherKoinTest
import com.expo.modules.devclient.scenarios.DevLauncherBasicScenario
import com.expo.modules.devclient.selectors.Views
import expo.modules.devlauncher.launcher.errors.DevLauncherAppError
import expo.modules.devlauncher.launcher.errors.DevLauncherErrorActivity
import expo.modules.devmenu.DevMenuManager
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
internal class DevClientBasicTest : DevLauncherKoinTest() {
  @Test
  fun checks_if_menu_can_be_toggled() = DevLauncherBasicScenario().setUpAndLaunch {
    val activity = it.launcherController()
      .devClientHost
      .reactInstanceManager
      .currentReactContext!!
      .currentActivity!!

    DevMenuManager.toggleMenu(activity)
    Views.DevMenu.main.isDisplayed()
    onView(withText("DEVELOPMENT CLIENT")).check(doesNotExist())

    DevMenuManager.toggleMenu(activity)
    Views.DevLauncher.main.isDisplayed()
    onView(withText("DEVELOPMENT CLIENT")).check(matches(isDisplayed()))
  }

  @Test
  fun checks_if_menu_can_be_toggled_using_cmd_m() = DevLauncherBasicScenario().setUpAndLaunch {
    onView(isRoot()).perform(pressKey(KeyEvent.KEYCODE_MENU))
    Views.DevMenu.main.isDisplayed()
    onView(withText("DEVELOPMENT CLIENT")).check(doesNotExist())

    onView(isRoot()).perform(pressKey(KeyEvent.KEYCODE_MENU))
    Views.DevLauncher.main.isDisplayed()

    onView(isRoot()).perform(pressKey(KeyEvent.KEYCODE_MENU))
    Views.DevMenu.main.isDisplayed()
    onView(withText("DEVELOPMENT CLIENT")).check(doesNotExist())
  }

  @Test
  fun checks_if_UI_is_rendered() = DevLauncherBasicScenario().setUpAndLaunch {
    onView(withText("DEVELOPMENT CLIENT")).check(matches(isDisplayed()))
    onView(withText("Scan QR code")).check(matches(isDisplayed()))
    onView(withText("Connect to URL")).check(matches(isDisplayed()))
    onView(withText("Profile")).check(matches(isDisplayed()))
    onView(withText("Settings")).check(matches(isDisplayed()))
  }

  @Test
  fun checks_if_error_screen_can_be_shown() = DevLauncherBasicScenario().setUpAndLaunch {
    it.onLauncherActivity { launcherActivity ->
      DevLauncherErrorActivity.showError(launcherActivity, DevLauncherAppError("TEST_ERROR", Error()))
    }

    Views.DevLauncher.ErrorScreen.main.isDisplayed(shouldWait = false)
    onView(withText("Something went wrong.")).check(matches(isDisplayed()))

    Views.DevLauncher.ErrorScreen.goToDetails.perform(ViewActions.click())
    Views.DevLauncher.ErrorScreen.details.isDisplayed(shouldWait = false)
    onView(withText("TEST_ERROR")).check(matches(isDisplayed()))

    onView(isRoot()).perform(ViewActions.pressBack())

    Views.DevLauncher.ErrorScreen.main.isDisplayed(shouldWait = false)
    Views.DevLauncher.ErrorScreen.goToLauncher.perform(ViewActions.click())

    Views.DevLauncher.main.isDisplayed()
  }
}
