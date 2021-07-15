package com.expo.modules.devclient.selectors

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.ViewAction
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers
import com.expo.modules.devclient.idlingresource.waitUntilViewIsDisplayed

internal data class TaggedView(val tag: String) {
  fun isDisplayed(shouldWait: Boolean = true) {
    if (shouldWait) {
      waitUntilViewIsDisplayed(
        ViewSelectors.withTaggedView(
          tag
        )
      )
    } else {
      onView(ViewSelectors.withTaggedView(tag)).check(matches(ViewMatchers.isDisplayed()))
    }
  }

  fun perform(vararg actions: ViewAction) {
    onView(ViewSelectors.withTaggedView(tag)).perform(*actions)
  }
}

