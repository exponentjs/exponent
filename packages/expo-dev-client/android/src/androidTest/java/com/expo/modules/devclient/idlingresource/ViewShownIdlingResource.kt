package com.expo.modules.devclient.idlingresource

import android.view.View
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.IdlingResource
import androidx.test.espresso.ViewFinder
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withEffectiveVisibility
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withTagValue
import androidx.test.espresso.matcher.ViewMatchers.withText
import org.hamcrest.Matcher
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.allOf
import java.lang.reflect.Field

internal class ViewIdlingResource(
  private val viewMatcher: Matcher<View?>?,
  private val idleMatcher: Matcher<View?>?
) : IdlingResource {
  private var resourceCallback: IdlingResource.ResourceCallback? = null

  override fun isIdleNow(): Boolean {
    val view: View? = getView(viewMatcher)
    val isIdle: Boolean = idleMatcher?.matches(view) ?: false
    if (isIdle) {
      resourceCallback?.onTransitionToIdle()
    }
    return isIdle
  }

  override fun registerIdleTransitionCallback(resourceCallback: IdlingResource.ResourceCallback?) {
    this.resourceCallback = resourceCallback
  }

  override fun getName() = "$this ${viewMatcher.toString()}"

  private fun getView(viewMatcher: Matcher<View?>?): View? {
    return try {
      val viewInteraction = onView(viewMatcher)
      val finderField: Field? = viewInteraction.javaClass.getDeclaredField("viewFinder")
      finderField?.isAccessible = true
      val finder = finderField?.get(viewInteraction) as ViewFinder
      finder.view
    } catch (e: Exception) {
      null
    }
  }
}

internal fun waitUntilViewIsDisplayed(matcher: Matcher<View?>) {
  val idlingResource: IdlingResource = ViewIdlingResource(matcher, isDisplayed())
  try {
    IdlingRegistry.getInstance().register(idlingResource)
    // First call to onView is to trigger the idler.
    onView(withId(0)).check(doesNotExist())
  } finally {
    IdlingRegistry.getInstance().unregister(idlingResource)
  }
}
